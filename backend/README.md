# MERN Blog Application — Enterprise RESTful API Backend

A production-grade, secure, and scalable backend REST API for a MERN Stack Blog Management System built with **Node.js (ES Modules)**, **Express.js**, and **MongoDB with Mongoose**.

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture & Design Principles](#architecture--design-principles)
3. [Technology Stack](#technology-stack)
4. [Prerequisites](#prerequisites)
5. [Installation & Setup](#installation--setup)
6. [Environment Variables](#environment-variables)
7. [MongoDB Setup & Indexing](#mongodb-setup--indexing)
8. [Starting the Server](#starting-the-server)
9. [Administrator Account Setup](#administrator-account-setup)
10. [API Documentation (Swagger OpenAPI 3.0)](#api-documentation-swagger-openapi-30)
11. [OAuth 2.0 Configuration (Google & Facebook)](#oauth-20-configuration-google--facebook)
12. [API Endpoints Overview](#api-endpoints-overview)
13. [Example API Requests & Responses](#example-api-requests--responses)
14. [Security & Performance Optimizations](#security--performance-optimizations)
15. [Graceful Shutdown & Health Diagnostics](#graceful-shutdown--health-diagnostics)

---

## 1. Project Overview

The backend is engineered to power a blog management platform with multi-tier access control, content creation, discussion threads, and moderation controls.

### Key Capabilities
- **Dual JWT Authentication**: Short-lived Access Token (15 min) + Long-lived Refresh Token (7 days).
- **Refresh-Token Rotation & Reuse Detection**: Mitigates replay attacks. If an already-rotated or revoked token is reused, all active user sessions are invalidated.
- **Role-Based Access Control (RBAC)**: Distinguishes between regular `user` and `admin`. Public registration is protected against privilege escalation.
- **Post & Comment Lifecycle**: Unique collision-safe URL slugs, soft deletion, and foreign-key integrity constraints.
- **Admin Dashboard**: Real-time aggregation metrics (`totalUsers`, `activeUsers`, `totalPosts`, `totalComments`) and management of users, posts, and comments.
- **Interactive OpenAPI 3.0 Documentation**: Complete interactive Swagger UI documentation at `/api-docs` and raw specification at `/api-docs.json`.

---

## 2. Architecture & Design Principles

The backend follows a **Layered Service-Oriented Architecture**:

```
backend/
├── src/
│   ├── app.js                          # Express app configuration & middleware pipeline
│   ├── server.js                       # HTTP server bootstrap & graceful shutdown
│   ├── config/
│   │   ├── db.js                       # Mongoose connection & lifecycle handlers
│   │   ├── env.js                      # Environment variable loader & validator
│   │   ├── passport.js                 # Passport Google & Facebook OAuth strategies
│   │   └── swagger.js                  # OpenAPI 3.0 specification & Swagger UI
│   ├── constants/
│   │   ├── httpStatusCodes.js          # HTTP status constants
│   │   ├── messages.js                 # Unified response & error messages
│   │   └── roles.js                    # Role definitions (user, admin)
│   ├── controllers/
│   │   ├── admin.controller.js         # Admin dashboard & resource moderation
│   │   ├── auth.controller.js          # Auth, tokens, cookies, OAuth callbacks
│   │   ├── comment.controller.js       # Comment operations
│   │   ├── post.controller.js          # Post operations & slug queries
│   │   └── user.controller.js          # User profile operations
│   ├── middleware/
│   │   ├── auth.middleware.js          # JWT Bearer token authentication
│   │   ├── error.middleware.js         # Centralized error handler
│   │   ├── notFound.middleware.js      # 404 Route handler
│   │   ├── rateLimiter.middleware.js   # Auth rate limiter (express-rate-limit)
│   │   ├── rbac.middleware.js          # Role authorization & requireAdmin
│   │   └── validate.middleware.js      # Zod validation middleware
│   ├── models/
│   │   ├── comment.model.js            # Comment Mongoose schema
│   │   ├── post.model.js               # Post Mongoose schema
│   │   ├── refreshToken.model.js       # RefreshToken storage & TTL schema
│   │   └── user.model.js               # User Mongoose schema
│   ├── routes/
│   │   ├── admin.routes.js             # /api/v1/admin
│   │   ├── auth.routes.js              # /api/v1/auth
│   │   ├── comment.routes.js           # /api/v1/comments
│   │   ├── index.js                    # Central API v1 router aggregator
│   │   ├── post.routes.js              # /api/v1/posts
│   │   └── user.routes.js              # /api/v1/users
│   ├── scripts/
│   │   └── seedAdmin.js                # Administrator initialization script
│   ├── services/
│   │   ├── admin.service.js            # Platform metrics & admin operations
│   │   ├── auth.service.js             # Registration, login, OAuth resolution
│   │   ├── comment.service.js          # Comment business logic & validation
│   │   ├── post.service.js             # Post CRUD, slugging & soft delete
│   │   ├── token.service.js            # JWT signing, rotation, hashing & revocation
│   │   └── user.service.js             # Profile queries & updates
│   ├── utils/
│   │   ├── apiError.js                 # Custom operational Error class
│   │   ├── apiResponse.js              # Standardized API response formatter
│   │   ├── asyncHandler.js             # Async route wrapper
│   │   └── slugger.js                  # Collision-safe unique slug utility
│   └── validators/
│       ├── admin.validator.js          # Zod schemas for admin operations
│       ├── auth.validator.js           # Zod schemas for auth endpoints
│       ├── comment.validator.js        # Zod schemas for comments
│       ├── post.validator.js           # Zod schemas for posts & queries
│       └── user.validator.js           # Zod schemas for user profile
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

---

## 3. Technology Stack

- **Runtime**: Node.js (>= 18.0.0, ES Modules)
- **Framework**: Express.js 4.x
- **Database**: MongoDB with Mongoose 8.x ODM
- **Authentication**: JSON Web Tokens (`jsonwebtoken`), `bcryptjs`, `passport`, `passport-google-oauth20`, `passport-facebook`
- **Validation**: Zod 3.x
- **Documentation**: Swagger UI Express with OpenAPI 3.0.3 specification
- **Security & Utilities**: Helmet, CORS, Express-Rate-Limit, Cookie-Parser, Slugify, Morgan

---

## 4. Prerequisites

Before running the server, ensure you have:
1. **Node.js** (v18.0.0 or higher recommended)
2. **MongoDB** (Local instance or MongoDB Atlas cluster URI)
3. **npm** package manager

---

## 5. Installation & Setup

1. Clone or navigate to the backend repository directory:
   ```bash
   cd assignment_blog_app/backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables (see below):
   ```bash
   cp .env.example .env
   ```

---

## 6. Environment Variables

Create a `.env` file in the root of `backend/` with the following configuration:

```ini
# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Database Configuration (Local or MongoDB Atlas)
MONGODB_URI=mongodb://127.0.0.1:27017/blog_app

# JWT Configuration (Use at least 32-character random secrets)
JWT_ACCESS_SECRET=your_jwt_access_secret_key_minimum_32_characters_long_12345
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key_minimum_32_characters_long_67890
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Google OAuth 2.0 Credentials (Optional in local dev)
GOOGLE_CLIENT_ID=your_google_client_id_placeholder
GOOGLE_CLIENT_SECRET=your_google_client_secret_placeholder
GOOGLE_CALLBACK_URL=http://localhost:5000/api/v1/auth/google/callback

# Facebook OAuth 2.0 Credentials (Optional in local dev)
FACEBOOK_APP_ID=your_facebook_app_id_placeholder
FACEBOOK_APP_SECRET=your_facebook_app_secret_placeholder
FACEBOOK_CALLBACK_URL=http://localhost:5000/api/v1/auth/facebook/callback

# Security & Password Hashing
BCRYPT_SALT_ROUNDS=12
```

---

## 7. MongoDB Setup & Indexing

The application leverages optimized Mongoose compound and TTL indexes:
- **Users**: Unique index on `email`, compound sparse index on `{ 'oauthProvider.provider': 1, 'oauthProvider.providerId': 1 }`.
- **Posts**: Unique index on `slug`, compound index on `{ isDeleted: 1, createdAt: -1 }`, and text index on `{ title: 'text', content: 'text' }`.
- **Comments**: Compound index on `{ post: 1, isDeleted: 1, createdAt: -1 }`.
- **Refresh Tokens**: Native MongoDB **TTL index** on `expiresAt` (`{ expires: 0 }`) which automatically garbage-collects expired tokens.

---

## 8. Starting the Server

### Development Mode (with nodemon auto-restart):
```bash
npm run dev
# or: node src/server.js
```

### Production Mode:
```bash
npm start
```

Upon successful startup, the console displays:
```
=======================================================
🚀 Blog API Server running in [development] mode
🌐 Server URL:        http://localhost:5000
❤️  Health Check:      http://localhost:5000/health
📖 API Documentation: http://localhost:5000/api-docs
=======================================================
```

---

## 9. Administrator Account Setup

To bootstrap an initial administrator account, run the included seeding script:

```bash
node src/scripts/seedAdmin.js
```

**Default Seed Credentials:**
- **Email:** `admin@example.com`
- **Password:** `AdminPassword123!`
- **Role:** `admin`

*(You can override these defaults by setting `ADMIN_SEED_EMAIL` and `ADMIN_SEED_PASSWORD` in your `.env` file).*

---

## 10. API Documentation (Swagger OpenAPI 3.0)

Interactive API documentation is integrated and accessible directly in your browser:

- **Swagger UI Interactive Explorer**: [`http://localhost:5000/api-docs`](http://localhost:5000/api-docs)
- **Raw OpenAPI 3.0 JSON Specification**: [`http://localhost:5000/api-docs.json`](http://localhost:5000/api-docs.json)

The Swagger UI allows exploring request parameters, authorization headers, testing endpoints interactively, and viewing sample payloads.

---

## 11. OAuth 2.0 Configuration (Google & Facebook)

### Google OAuth Setup:
1. Navigate to Google Cloud Console (`https://console.cloud.google.com`).
2. Create OAuth 2.0 Client ID Credentials (Web Application).
3. Set Authorized Redirect URI: `http://localhost:5000/api/v1/auth/google/callback`.
4. Copy the Client ID & Secret into `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.

### Facebook OAuth Setup:
1. Navigate to Meta for Developers (`https://developers.facebook.com`).
2. Create an App with Facebook Login.
3. Set Valid OAuth Redirect URI: `http://localhost:5000/api/v1/auth/facebook/callback`.
4. Copy App ID & Secret into `FACEBOOK_APP_ID` and `FACEBOOK_APP_SECRET`.

*(If credentials are not configured, the OAuth endpoints degrade gracefully and report an informative message instead of crashing the server).*

---

## 12. API Endpoints Overview

All resource endpoints are versioned with `/api/v1`.

### System
| Method | Endpoint | Access | Description |
|---|---|:---:|---|
| `GET` | `/health` | Public | System uptime & MongoDB connection status |
| `GET` | `/api-docs` | Public | Interactive Swagger UI documentation |
| `GET` | `/api-docs.json` | Public | OpenAPI 3.0 JSON specification |

### Authentication (`/api/v1/auth`)
| Method | Endpoint | Access | Description |
|---|---|:---:|---|
| `POST` | `/api/v1/auth/register` | Public (Rate Limited) | Register user (`role: 'user'`) |
| `POST` | `/api/v1/auth/login` | Public (Rate Limited) | Authenticate user; returns access token & sets HttpOnly refresh cookie |
| `POST` | `/api/v1/auth/refresh` | Public | Rotates refresh token and issues new token pair |
| `POST` | `/api/v1/auth/logout` | Public/Auth | Revokes refresh token and clears cookie |
| `GET` | `/api/v1/auth/me` | Authenticated | Get current authenticated user details |
| `GET` | `/api/v1/auth/google` | Public | Initiate Google OAuth 2.0 flow |
| `GET` | `/api/v1/auth/google/callback` | Public | Google OAuth callback |
| `GET` | `/api/v1/auth/facebook` | Public | Initiate Facebook OAuth 2.0 flow |
| `GET` | `/api/v1/auth/facebook/callback` | Public | Facebook OAuth callback |

### User Profile (`/api/v1/users`)
| Method | Endpoint | Access | Description |
|---|---|:---:|---|
| `GET` | `/api/v1/users/me` | Authenticated | Get profile of logged-in user |
| `PATCH` | `/api/v1/users/me` | Authenticated | Update user name, avatar, or password |

### Posts (`/api/v1/posts`)
| Method | Endpoint | Access | Description |
|---|---|:---:|---|
| `GET` | `/api/v1/posts` | Public | Paginated post listing (`page`, `limit`, `search`, `author`, `sort`, `order`) |
| `GET` | `/api/v1/posts/:id` | Public | Retrieve single post by ID |
| `GET` | `/api/v1/posts/slug/:slug` | Public | Retrieve single post by unique slug |
| `POST` | `/api/v1/posts` | Authenticated | Create post with auto-generated unique slug |
| `PATCH` | `/api/v1/posts/:id` | Owner / Admin | Update post title or content; regenerates slug |
| `DELETE` | `/api/v1/posts/:id` | Owner / Admin | Soft delete post (`isDeleted: true`) |

### Comments (`/api/v1/posts/:postId/comments` & `/api/v1/comments/:id`)
| Method | Endpoint | Access | Description |
|---|---|:---:|---|
| `GET` | `/api/v1/posts/:postId/comments` | Public | Paginated comments on a post |
| `POST` | `/api/v1/posts/:postId/comments` | Authenticated | Add comment (only allowed on active, non-deleted posts) |
| `PATCH` | `/api/v1/comments/:id` | Owner / Admin | Update comment content |
| `DELETE` | `/api/v1/comments/:id` | Owner / Admin | Delete comment |

### Admin Operations (`/api/v1/admin`)
| Method | Endpoint | Access | Description |
|---|---|:---:|---|
| `GET` | `/api/v1/admin/dashboard` | Admin Only | Metrics: `totalUsers`, `activeUsers`, `totalPosts`, `totalComments` |
| `GET` | `/api/v1/admin/users` | Admin Only | Paginated users list with search, role, active filters |
| `GET` | `/api/v1/admin/users/:id` | Admin Only | User details with post and comment statistics |
| `PATCH` | `/api/v1/admin/users/:id` | Admin Only | Update user role or status (self-demotion protected) |
| `DELETE` | `/api/v1/admin/users/:id` | Admin Only | Delete user and revoke all active sessions |
| `GET` | `/api/v1/admin/posts` | Admin Only | List all posts including soft-deleted posts |
| `PATCH` | `/api/v1/admin/posts/:id` | Admin Only | Update or restore soft-deleted posts (`isDeleted: false`) |
| `DELETE` | `/api/v1/admin/posts/:id` | Admin Only | Permanently delete post and cascade comments |
| `GET` | `/api/v1/admin/comments` | Admin Only | List all comments across the platform |
| `DELETE` | `/api/v1/admin/comments/:id` | Admin Only | Permanently remove comment |

---

## 13. Example API Requests & Responses

### 1. User Registration
**Request:**
```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Doe",
    "email": "jane@example.com",
    "password": "Password123!"
  }'
```
**Response (201 Created):**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "6ad21fcb29bbb7747b1d9218",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "role": "user",
      "avatar": null,
      "isActive": true,
      "oauthProvider": {
        "provider": "local",
        "providerId": null
      },
      "createdAt": "2026-10-16T12:59:55.874Z",
      "updatedAt": "2026-10-16T12:59:55.874Z"
    }
  }
}
```

---

### 2. User Login
**Request:**
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jane@example.com",
    "password": "Password123!"
  }'
```
**Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "6ad21fcb29bbb7747b1d9218",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "role": "user",
      "avatar": null,
      "isActive": true
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### 3. Create a Blog Post
**Request:**
```bash
curl -X POST http://localhost:5000/api/v1/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <YOUR_ACCESS_TOKEN>" \
  -d '{
    "title": "Modern Backend Architecture with Node.js and MongoDB",
    "content": "In this guide, we dive deep into production-grade REST API design, JWT authentication, and MongoDB indexing strategies."
  }'
```
**Response (201 Created):**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Post created successfully",
  "data": {
    "post": {
      "_id": "6ad221157116f28d01ea55f6",
      "title": "Modern Backend Architecture with Node.js and MongoDB",
      "slug": "modern-backend-architecture-with-nodejs-and-mongodb",
      "content": "In this guide, we dive deep into production-grade REST API design...",
      "author": {
        "_id": "6ad21fcb29bbb7747b1d9218",
        "name": "Jane Doe",
        "email": "jane@example.com",
        "avatar": null
      },
      "isDeleted": false,
      "deletedAt": null,
      "createdAt": "2026-10-16T13:05:20.120Z",
      "updatedAt": "2026-10-16T13:05:20.120Z"
    }
  }
}
```

---

### 4. Admin Dashboard Metrics
**Request:**
```bash
curl -X GET http://localhost:5000/api/v1/admin/dashboard \
  -H "Authorization: Bearer <ADMIN_ACCESS_TOKEN>"
```
**Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Dashboard metrics retrieved successfully",
  "data": {
    "totalUsers": 24,
    "activeUsers": 22,
    "totalPosts": 85,
    "totalComments": 340
  }
}
```

---

## 14. Security & Performance Optimizations

1. **Helmet HTTP Headers**: Enforces secure HTTP headers (`Content-Security-Policy`, `X-Content-Type-Options`, `X-Frame-Options`, `Strict-Transport-Security`).
2. **Strict CORS Whitelisting**: Restricts API calls strictly to `FRONTEND_URL` and development origins with credentials enabled.
3. **Password Security**: Uses `bcryptjs` with 12 salt rounds. `passwordHash` is excluded by default from queries (`select: false`).
4. **Token Security**:
   - Refresh tokens are stored as **SHA-256 hashes** in MongoDB.
   - HttpOnly cookies prevent XSS theft.
   - Reuse detection detects token theft and invalidates the entire session family.
5. **NoSQL Injection & Mass Assignment Defense**:
   - All request bodies are strictly validated against Zod schemas.
   - Parameterized Mongoose queries avoid query selector injection.
6. **Rate Limiting**: `express-rate-limit` prevents brute-force login and registration attempts (20 requests per 15 minutes per IP).

---

## 15. Graceful Shutdown & Health Diagnostics

### Health Check Endpoint:
`GET /health` returns process uptime, execution environment, and live MongoDB connection state:
```json
{
  "success": true,
  "status": "UP",
  "timestamp": "2026-10-16T12:53:31.483Z",
  "uptimeSeconds": 182,
  "environment": "development",
  "database": {
    "status": "connected",
    "host": "cluster0.mongodb.net",
    "databaseName": "blog_app"
  }
}
```

### Graceful Termination:
`server.js` listens for `SIGINT` (Ctrl+C) and `SIGTERM` signals. Upon receiving a shutdown signal:
1. Stops accepting new HTTP connections.
2. Closes remaining active HTTP connections.
3. Closes MongoDB connection cleanly using `mongoose.connection.close()`.
4. Enforces a 10-second timeout fail-safe.

---

## 16. Unit & Integration Testing Suite (Jest & Supertest)

A complete automated test suite is implemented using **Jest** and **Supertest**, featuring **17 test suites** and **93 passing test cases** across unit and integration tiers.

### Running Tests:

```bash
# Run all unit and integration tests
npm test

# Run tests with code coverage analysis
npm run test:coverage
```

### Test Suite Structure:

```text
backend/tests/
├── setup.js                      # Test lifecycle setup, mocks, and environment variables
├── unit/                         # Unit tests (Services, Middlewares, Utilities)
│   ├── middlewares/
│   │   ├── auth.middleware.test.js # Bearer extraction, token validity, account status
│   │   ├── error.middleware.test.js # CastError, duplicate key, Zod issues, JWT expiry
│   │   └── rbac.middleware.test.js  # Role checking, 401 unauthenticated, 403 forbidden
│   ├── services/
│   │   ├── admin.service.test.js   # Dashboard metrics, user role edits, self-protection guards
│   │   ├── auth.service.test.js    # Registration hashing, login verification, logout
│   │   ├── comment.service.test.js # Comment author checks, deletion, foreign key validation
│   │   ├── post.service.test.js    # Slug generation, post author checks, soft delete
│   │   ├── token.service.test.js   # JWT signing, verification, token rotation & reuse detection
│   │   └── user.service.test.js    # Profile retrieval, avatar update, password change
│   └── utils/
│       ├── apiError.test.js        # ApiError class, status codes, factory helpers
│       ├── apiResponse.test.js     # Standardized ApiResponse envelope & pagination
│       └── slugger.test.js         # URL slug creation and collision resolution
│
└── integration/                  # HTTP API integration tests (Supertest)
    ├── admin.routes.test.js      # /api/v1/admin RBAC protection, metrics, user directory
    ├── auth.routes.test.js       # /api/v1/auth register, login, refresh-token, cookies, logout
    ├── comment.routes.test.js    # /api/v1/comments and nested /posts/:id/comments CRUD
    ├── health.test.js            # /health diagnostics and root / endpoints
    └── post.routes.test.js       # /api/v1/posts public feed, slug retrieval, protected CRUD
```

