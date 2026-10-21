# MERN Stack Blog Management System

A full-stack, enterprise-grade Blog Management System developed with **Node.js/Express/MongoDB** on the backend and **React/Vite/Tailwind CSS** on the frontend. Features complete user authentication with JWT rotation, social OAuth 2.0 (Google & Facebook), Swagger UI documentation, public editorial feed, rich commenting, and an isolated administration dashboard.

---

## 🏗️ Repository Architecture

This repository is organized as a clean decoupled monorepo:

```text
assignment_blog_app/
├── backend/                  # Node.js + Express + MongoDB REST API & Swagger UI
│   ├── src/                  # Express controllers, services, models, middlewares
│   ├── .env.example          # Backend environment variables template
│   ├── package.json          # Backend dependencies and scripts
│   └── README.md             # In-depth Backend Documentation & API Reference
│
└── frontend/                 # React.js + Vite + Tailwind CSS Single Page Application
    ├── src/                  # Components, pages, hooks, contexts, routes
    ├── .env.example          # Frontend environment variables template
    ├── package.json          # Frontend dependencies and scripts
    └── README.md             # In-depth Frontend Architecture & Guide
```

---

## ⚡ Quick Start Guide

### 1. Backend Setup
1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
   npm install
   ```
2. Configure environment variables in `backend/.env` (see `backend/.env.example`).
3. Start the backend development server:
   ```bash
   npm run dev
   ```
4. The backend runs on [http://localhost:5000](http://localhost:5000).
   - **Interactive Swagger Documentation**: [http://localhost:5000/api-docs](http://localhost:5000/api-docs)
   - **Health Check**: [http://localhost:5000/api/v1/health](http://localhost:5000/api/v1/health)
5. Run the automated test suite (Unit & Integration tests):
   ```bash
   npm test
   # Or for coverage analysis:
   npm run test:coverage
   ```

### 2. Frontend Setup
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   npm install
   ```
2. Configure environment variables in `frontend/.env` (see `frontend/.env.example`).
3. Start the frontend development server:
   ```bash
   npm run dev
   ```
4. The client runs on [http://localhost:3000](http://localhost:3000).

---

## 🔑 Default Administrator Credentials

A seeded administrator account is pre-configured for review and testing:
- **Email**: `admin@example.com`
- **Password**: `AdminPassword123!`
- **Role**: `admin`

*Note: You can also register a standard user via the `/register` page at any time.*

---

## 🌐 Environment Variables Summary

### Backend (`backend/.env`)
```ini
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://...
JWT_ACCESS_SECRET=your_jwt_access_secret_key_minimum_32_chars
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key_minimum_32_chars
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
FRONTEND_URL=http://localhost:3000
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/v1/auth/google/callback
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret
FACEBOOK_CALLBACK_URL=http://localhost:5000/api/v1/auth/facebook/callback
```

### Frontend (`frontend/.env`)
```ini
# Backend API endpoint URL
VITE_API_BASE_URL=http://localhost:5000/api/v1

# Frontend application URL (used for deployment domain, OAuth redirects)
VITE_FRONTEND_URL=http://localhost:3000
```

---

## 📚 Detailed Documentation

- **[Backend Architecture & API Documentation](./backend/README.md)**: Details regarding JWT rotation & reuse detection, database schemas, rate limiting, and RBAC.
- **[Frontend Architecture & Implementation Guide](./frontend/README.md)**: Details regarding Axios 401 interceptor queues, memory-only access tokens, component library, and admin dashboard.
