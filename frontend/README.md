# MERN Stack Blog Management System — Frontend Client

A modern, production-grade, responsive single-page web application (SPA) built with **React.js**, **Vite**, **Tailwind CSS**, and **React Router DOM**. This client connects seamlessly to the Node.js/Express/MongoDB Atlas backend to deliver a full-featured editorial blogging experience and an isolated administrative control portal.

---

## 🌟 Key Features

### 1. Modern Editorial User Experience
- **Public Feed & Discovery**: Instant keyword searching, responsive card grid, and pagination.
- **Article Details**: Full markdown-ready body rendering, author attribution, dynamic read-time estimation, and publication date formatting.
- **Interactive Comment System**: Authenticated users can post comments, delete their own comments, and see real-time deletion confirmations.
- **Author Workspace**: Dedicated `/my-posts` dashboard with quick metrics, direct edit links, and deletion guards.

### 2. High-Security Authentication & Session Architecture
- **Memory-Only Access Tokens**: Access tokens are kept strictly in JavaScript memory (`AuthContext`) to mitigate Cross-Site Scripting (XSS) token theft. No sensitive tokens are persisted to `localStorage`.
- **Automatic Silent Token Refresh**: On page load, `AuthContext` initializes a background handshake via HttpOnly refresh cookie to restore sessions transparently.
- **Axios 401 Interceptor Queue**: A thread-safe refresh lock and pending-request subscriber queue prevent duplicate refresh calls when multiple requests fail with 401 simultaneously.
- **Social OAuth 2.0 Integration**: Direct Google and Facebook OAuth sign-in flow with centralized callback handling (`/oauth/callback`).

### 3. Dedicated Administrative Portal
- **Dashboard Overview**: Aggregated platform metrics (Total Users, Active Users, Published Articles, Total Comments) with instant refresh.
- **User Moderation**: Paginated user directory with role assignment (`user` vs `admin`), suspension toggling (`active` vs `suspended`), and self-demotion/deactivation safety guards.
- **Post Moderation**: Filter posts by publication status (`Live` vs `Soft-Deleted`), edit content, restore soft-deleted posts, or permanently hard-delete posts with cascade comment pruning.
- **Comment Moderation**: Platform-wide comment audit log with direct links to target articles and permanent removal capabilities.

---

## 🛠️ Technology Stack

| Layer / Concern | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework & Tooling** | [React 18](https://react.dev/) + [Vite](https://vitejs.dev/) | Ultra-fast HMR and optimized production bundling |
| **Routing** | [React Router v6](https://reactrouter.com/) | Client-side routing with nested layouts and route guards |
| **Styling** | [Tailwind CSS v3](https://tailwindcss.com/) | Utility-first responsive design system |
| **HTTP Client** | [Axios](https://axios-http.com/) | Configured instance with credentials and 401 refresh interception |
| **Form Management** | [React Hook Form](https://react-hook-form.com/) | Uncontrolled performant form state management |
| **Schema Validation** | [Zod](https://zod.dev/) + `@hookform/resolvers` | Strict client-side validation mirroring backend DTO rules |
| **Icons** | [Lucide React](https://lucide.dev/) | Clean, accessible SVG iconography |
| **Notifications** | [React Hot Toast](https://react-hot-toast.com/) | Lightweight, non-intrusive notification toasts |

---

## 📁 Project Directory Structure

```text
frontend/
├── public/                     # Static assets and favicon
├── src/
│   ├── assets/                 # Brand logos and illustration assets
│   ├── components/
│   │   ├── admin/              # Admin dashboard widgets
│   │   │   ├── PostEditModal.jsx
│   │   │   ├── StatCard.jsx
│   │   │   └── UserEditModal.jsx
│   │   ├── auth/               # Auth cards and social OAuth buttons
│   │   ├── comments/           # Comment feed, input, and cards
│   │   ├── common/             # Reusable UI primitives
│   │   │   ├── Alert.jsx
│   │   │   ├── Badge.jsx
│   │   │   ├── Button.jsx
│   │   │   ├── Card.jsx
│   │   │   ├── ConfirmationModal.jsx
│   │   │   ├── EmptyState.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── Pagination.jsx
│   │   │   ├── Skeleton.jsx
│   │   │   ├── Spinner.jsx
│   │   │   └── Textarea.jsx
│   │   ├── layout/             # Headers, Footers, and Admin Sidebar
│   │   │   ├── AdminHeader.jsx
│   │   │   ├── AdminSidebar.jsx
│   │   │   ├── Footer.jsx
│   │   │   └── Navbar.jsx
│   │   └── posts/              # PostCard, PostGrid, PostSearchBar, PostForm
│   ├── context/
│   │   └── AuthContext.jsx     # Global authentication provider and session state
│   ├── hooks/
│   │   └── useAuth.js          # Convenience hook for AuthContext
│   ├── layouts/
│   │   ├── AdminLayout.jsx     # Isolated administrative layout with sidebar
│   │   ├── AuthLayout.jsx      # Clean centered auth layout
│   │   └── PublicLayout.jsx    # Public editorial navbar and footer layout
│   ├── pages/
│   │   ├── CreatePostPage.jsx
│   │   ├── EditPostPage.jsx
│   │   ├── HomePage.jsx
│   │   ├── LoginPage.jsx
│   │   ├── MyPostsPage.jsx
│   │   ├── NotFoundPage.jsx
│   │   ├── OAuthCallbackPage.jsx
│   │   ├── PostDetailsPage.jsx
│   │   ├── ProfilePage.jsx
│   │   ├── RegisterPage.jsx
│   │   └── admin/
│   │       ├── AdminCommentsPage.jsx
│   │       ├── AdminDashboardPage.jsx
│   │       ├── AdminPostsPage.jsx
│   │       └── AdminUsersPage.jsx
│   ├── routes/
│   │   ├── AdminRoute.jsx      # Role-based route guard for admins
│   │   ├── AppRouter.jsx       # Central route configuration
│   │   └── ProtectedRoute.jsx  # Authentication route guard
│   ├── schemas/
│   │   ├── authSchema.js       # Login and Registration Zod schemas
│   │   └── postSchema.js       # Post creation/editing Zod schema
│   ├── services/
│   │   ├── adminService.js     # Admin API endpoints
│   │   ├── api.js              # Central Axios instance with interceptors
│   │   ├── authService.js      # Auth endpoints (login, register, refresh, logout)
│   │   ├── commentService.js   # Comment API endpoints
│   │   ├── postService.js      # Post API endpoints
│   │   └── userService.js      # User profile endpoints
│   ├── utils/
│   │   ├── constants.js        # Global constants and storage keys
│   │   ├── dateFormatter.js    # Relative and absolute date formatters
│   │   ├── errorHandler.js     # Unified API error extractor
│   │   └── stringHelpers.js    # Reading time calculation & truncate helpers
│   ├── App.jsx                 # Top-level application with providers
│   ├── index.css               # Tailwind CSS directives & custom scrollbars
│   └── main.jsx                # React DOM entry point
├── .env                        # Local environment variables
├── .env.example                # Example environment template
├── index.html                  # HTML5 entry template
├── package.json                # Project dependencies and npm scripts
├── tailwind.config.js          # Tailwind CSS theme configuration
└── vite.config.js              # Vite bundler configuration (port 3000)
```

---

## ⚙️ Environment Variables

Create a `.env` file in the `frontend/` directory (or copy `.env.example`):

```bash
# Backend REST API Base URL (including version prefix /api/v1)
VITE_API_BASE_URL=http://localhost:5000/api/v1

# Frontend Application URL (used for deployment domain, OAuth redirects, and link generation)
VITE_FRONTEND_URL=http://localhost:3000
```

> **Deployment Tip**: When deploying to production platforms (e.g. Vercel, Netlify, Render, AWS Amplify), update `VITE_API_BASE_URL` to your production backend API domain (e.g. `https://api.yourdomain.com/api/v1`) and `VITE_FRONTEND_URL` to your live frontend URL.

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- Running backend service on `http://localhost:5000` (see `backend/README.md`)

### 2. Installation
Navigate into the `frontend/` folder:
```bash
cd frontend
npm install
```

### 3. Running Development Server
Start the Vite local development server on port `3000`:
```bash
npm run dev
```
The application will be live at [http://localhost:3000](http://localhost:3000).

### 4. Production Build & Preview
To create an optimized production build:
```bash
npm run build
```
To preview the production build locally:
```bash
npm run preview
```

---

## 🔒 Route Protection & Access Control

| Route Pattern | Access Level | Description |
| :--- | :--- | :--- |
| `/` | Public | Explore recent articles with search and pagination |
| `/posts/:slug` | Public | Read full article content and comments |
| `/login` | Guest Only | Email/password login and OAuth buttons (redirects if logged in) |
| `/register` | Guest Only | Account creation form (redirects if logged in) |
| `/oauth/callback` | Public | Handles social authentication redirect tokens |
| `/my-posts` | Authenticated | Manage articles authored by the current user |
| `/posts/create` | Authenticated | Create a new blog post |
| `/posts/:id/edit` | Authenticated | Edit existing post owned by the user (or admin) |
| `/profile` | Authenticated | View and update personal profile details |
| `/admin` | Admin Only | System metrics dashboard |
| `/admin/users` | Admin Only | User directory, role assignment, and account status |
| `/admin/posts` | Admin Only | Global article moderation and soft-delete recovery |
| `/admin/comments` | Admin Only | Platform-wide comment audit log and deletion |

---

## 🛡️ Security Best Practices Implemented

1. **Defense in Depth**: Frontend route guards improve user experience and avoid unnecessary page flashes, while the backend strictly enforces authentication and RBAC on every API request.
2. **Safe Credential Handling**: Refresh tokens are stored strictly in `HttpOnly`, `SameSite=Lax`, `Secure` cookies, shielded against unauthorized script access.
3. **Self-Harm Guards**: The Admin interface prevents administrators from deactivating their own accounts or demoting their own admin role, protecting the system from lockout.
4. **Input Sanitization & Validation**: Form schemas are enforced before submission via Zod, eliminating invalid requests from reaching the network.
