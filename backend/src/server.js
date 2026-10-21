import http from "http";
import app from "./app.js";
import env from "./config/env.js";
import { connectDB, disconnectDB } from "./config/db.js";

let server;

const startServer = async () => {
  try {
    // 1. Establish Database Connection
    await connectDB();

    // 2. Start HTTP Server
    server = http.createServer(app);
    server.listen(env.PORT, () => {
      console.log(`=======================================================`);
      console.log(`🚀 Blog API Server running in [${env.NODE_ENV}] mode`);
      console.log(`🌐 Server URL:        http://localhost:${env.PORT}`);
      console.log(`❤️  Health Check:      http://localhost:${env.PORT}/health`);
      console.log(
        `📖 API Documentation: http://localhost:${env.PORT}/api-docs`,
      );
      console.log(`=======================================================`);
    });
  } catch (error) {
    console.error(`[FATAL] Failed to initialize server: ${error.message}`);
    process.exit(1);
  }
};

// Graceful Shutdown Handler
const gracefulShutdown = async (signal) => {
  console.log(`\n[${signal}] Received. Initiating graceful shutdown...`);

  if (server) {
    server.close(async () => {
      console.log("[HTTP] Closed remaining active HTTP connections.");
      try {
        await disconnectDB();
        console.log("[System] Graceful shutdown completed cleanly.");
        process.exit(0);
      } catch (err) {
        console.error("[System] Error during database disconnection:", err);
        process.exit(1);
      }
    });

    // Force close after 10 seconds timeout
    setTimeout(() => {
      console.error("[System] Forced shutdown after timeout.");
      process.exit(1);
    }, 10000);
  } else {
    process.exit(0);
  }
};

// Listen for termination signals
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// Process-level unhandled exception catches
process.on("unhandledRejection", (reason, promise) => {
  console.error("[FATAL] Unhandled Rejection at:", promise, "reason:", reason);
  // Optional: In production you may trigger gracefulShutdown('unhandledRejection')
});

process.on("uncaughtException", (error) => {
  console.error("[FATAL] Uncaught Exception thrown:", error);
  process.exit(1);
});

// Bootstrap application
startServer();
