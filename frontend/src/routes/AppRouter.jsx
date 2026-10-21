import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import PublicLayout from "../layouts/PublicLayout";
import AuthLayout from "../layouts/AuthLayout";
import AdminLayout from "../layouts/AdminLayout";
import ProtectedRoute from "./ProtectedRoute";
import AdminRoute from "./AdminRoute";
import { useAuth } from "../hooks/useAuth";

import HomePage from "../pages/HomePage";
import PostDetailsPage from "../pages/PostDetailsPage";
import CreatePostPage from "../pages/CreatePostPage";
import EditPostPage from "../pages/EditPostPage";
import MyPostsPage from "../pages/MyPostsPage";
import ProfilePage from "../pages/ProfilePage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import OAuthCallbackPage from "../pages/OAuthCallbackPage";
import NotFoundPage from "../pages/NotFoundPage";

import AdminDashboardPage from "../pages/admin/AdminDashboardPage";
import AdminUsersPage from "../pages/admin/AdminUsersPage";
import AdminPostsPage from "../pages/admin/AdminPostsPage";
import AdminCommentsPage from "../pages/admin/AdminCommentsPage";
import AdminActivityLogsPage from "../pages/admin/AdminActivityLogsPage";

// Redirect authenticated users away from Login/Register
const GuestRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  if (isAuthenticated) return <Navigate to="/" replace />;
  return children;
};

export const AppRouter = () => {
  return (
    <Routes>
      {/* 1. Public Layout Routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/posts/:slug" element={<PostDetailsPage />} />

        {/* 2. Authenticated User Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/posts/create" element={<CreatePostPage />} />
          <Route path="/posts/:id/edit" element={<EditPostPage />} />
          <Route path="/my-posts" element={<MyPostsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Route>

      {/* 3. Guest Auth Routes */}
      <Route
        element={
          <GuestRoute>
            <AuthLayout />
          </GuestRoute>
        }
      >
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* 4. OAuth Callback */}
      <Route path="/oauth/callback" element={<OAuthCallbackPage />} />

      {/* 5. Protected Admin Routes */}
      <Route element={<AdminRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
          <Route path="/admin/posts" element={<AdminPostsPage />} />
          <Route path="/admin/comments" element={<AdminCommentsPage />} />
          <Route
            path="/admin/activity-logs"
            element={<AdminActivityLogsPage />}
          />
        </Route>
      </Route>

      {/* 6. 404 Route */}
      <Route element={<PublicLayout />}>
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};

export default AppRouter;
