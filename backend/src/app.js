import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import passport from 'passport';

import env from './config/env.js';
import { getDBConnectionStatus } from './config/db.js';
import { setupSwagger } from './config/swagger.js';
import { configurePassport } from './config/passport.js';
import apiV1Router from './routes/index.js';
import { notFoundHandler } from './middleware/notFound.middleware.js';
import { errorHandler } from './middleware/error.middleware.js';
import { activityLogger } from './middleware/activityLogger.middleware.js';
import { ApiResponse } from './utils/apiResponse.js';
import { HTTP_STATUS } from './constants/httpStatusCodes.js';

const app = express();

// Initialize Passport Strategies
configurePassport();

// 1. Security Headers
app.use(helmet());

// 2. CORS Configuration
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, Postman, server-to-server)
      if (!origin) return callback(null, true);

      const serverOrigin = `http://localhost:${env.PORT}`;
      const serverOriginIp = `http://127.0.0.1:${env.PORT}`;
      const allowedOrigins = [env.FRONTEND_URL, serverOrigin, serverOriginIp];

      if (env.isDevelopment) {
        allowedOrigins.push(
          'http://localhost:3000',
          'http://localhost:5173',
          'http://127.0.0.1:3000',
          'http://127.0.0.1:5173'
        );

        // Allow any localhost or 127.0.0.1 port in development (e.g., Swagger UI, Vite, React)
        if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
          return callback(null, true);
        }
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`Origin '${origin}' not allowed by CORS`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// 3. Request Logging
if (env.isDevelopment) {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// 4. Body Parsers & Cookie Parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// 5. Passport Middleware
app.use(passport.initialize());

// 6. Root Landing Endpoint
app.get('/', (req, res) => {
  return ApiResponse.success(res, 'MERN Blog Management System Backend API is active', {
    name: 'MERN Blog Application API',
    version: '1.0.0',
    status: 'ONLINE',
    environment: env.NODE_ENV,
    endpoints: {
      healthCheck: '/health',
      apiDocs: '/api-docs',
      apiDocsJson: '/api-docs.json',
      apiV1: '/api/v1',
    },
  });
});

// 7. Health Check Endpoint
app.get('/health', (req, res) => {
  const dbStatus = getDBConnectionStatus();
  const statusCode = dbStatus.isConnected
    ? HTTP_STATUS.OK
    : HTTP_STATUS.SERVICE_UNAVAILABLE;

  return res.status(statusCode).json({
    success: dbStatus.isConnected,
    status: dbStatus.isConnected ? 'UP' : 'DOWN',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    environment: env.NODE_ENV,
    database: {
      status: dbStatus.isConnected ? 'connected' : 'disconnected',
      host: dbStatus.host,
      databaseName: dbStatus.name,
    },
  });
});

// 8. User Activity Logging Middleware
app.use(activityLogger);

// 9. API v1 Router Mount
app.use('/api/v1', apiV1Router);

// 8. Swagger OpenAPI 3.0 Documentation
setupSwagger(app);

// 9. 404 Route Handler
app.use(notFoundHandler);

// 10. Centralized Error Handler
app.use(errorHandler);

export default app;
