export const MESSAGES = Object.freeze({
  // Auth
  REGISTER_SUCCESS: "User registered successfully",
  LOGIN_SUCCESS: "Login successful",
  LOGOUT_SUCCESS: "Logout successful",
  REFRESH_SUCCESS: "Token refreshed successfully",
  PROFILE_RETRIEVED: "User profile retrieved successfully",
  PROFILE_UPDATED: "User profile updated successfully",
  INVALID_CREDENTIALS: "Invalid email or password",
  USER_ALREADY_EXISTS: "User with this email already exists",
  USER_NOT_FOUND: "User not found",
  ACCOUNT_INACTIVE: "Account is deactivated. Please contact support.",
  UNAUTHORIZED: "Authentication required. Please log in.",
  TOKEN_EXPIRED: "Authentication token has expired. Please log in again.",
  TOKEN_INVALID: "Invalid authentication token.",
  REFRESH_TOKEN_REQUIRED: "Refresh token is required",
  REFRESH_TOKEN_INVALID: "Invalid or revoked refresh token",
  FORBIDDEN:
    "Access denied. You do not have permission to perform this action.",

  // Post
  POST_CREATED: "Post created successfully",
  POSTS_RETRIEVED: "Posts retrieved successfully",
  POST_RETRIEVED: "Post retrieved successfully",
  POST_UPDATED: "Post updated successfully",
  POST_DELETED: "Post deleted successfully",
  POST_NOT_FOUND: "Post not found",
  POST_SLUG_EXISTS: "A post with this slug or title already exists",

  // Comment
  COMMENT_CREATED: "Comment created successfully",
  COMMENTS_RETRIEVED: "Comments retrieved successfully",
  COMMENT_UPDATED: "Comment updated successfully",
  COMMENT_DELETED: "Comment deleted successfully",
  COMMENT_NOT_FOUND: "Comment not found",

  // Admin
  DASHBOARD_METRICS_RETRIEVED: "Dashboard metrics retrieved successfully",
  USER_UPDATED: "User updated successfully",
  USER_DELETED: "User deleted or deactivated successfully",

  // General / Errors
  VALIDATION_ERROR: "Request validation failed",
  RESOURCE_NOT_FOUND: "Requested resource not found",
  INTERNAL_SERVER_ERROR: "An unexpected internal server error occurred",
  RATE_LIMIT_EXCEEDED: "Too many requests. Please try again later.",
  HEALTHY: "Server and database are healthy",
});

export default MESSAGES;
