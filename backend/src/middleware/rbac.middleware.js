import { ApiError } from '../utils/apiError.js';
import { MESSAGES } from '../constants/messages.js';
import { ROLES } from '../constants/roles.js';

/**
 * Role-Based Access Control (RBAC) middleware
 * Ensures the authenticated user possesses one of the allowed roles.
 *
 * @param  {...string} allowedRoles
 * @returns {Function} Express middleware
 */
export const authorize = (...allowedRoles) => (req, res, next) => {
  if (!req.user) {
    return next(ApiError.unauthorized(MESSAGES.UNAUTHORIZED));
  }

  if (!allowedRoles.includes(req.user.role)) {
    return next(ApiError.forbidden(MESSAGES.FORBIDDEN));
  }

  next();
};

/**
 * Convenience middleware requiring administrator role
 */
export const requireAdmin = authorize(ROLES.ADMIN);

export default {
  authorize,
  requireAdmin,
};
