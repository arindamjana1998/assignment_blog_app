import rateLimit from 'express-rate-limit';
import { ApiError } from '../utils/apiError.js';
import { HTTP_STATUS } from '../constants/httpStatusCodes.js';
import { MESSAGES } from '../constants/messages.js';

/**
 * Rate limiter for sensitive authentication endpoints (register, login)
 * 15-minute window with maximum 20 requests per IP
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Max 20 attempts
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next) => {
    next(new ApiError(HTTP_STATUS.TOO_MANY_REQUESTS, MESSAGES.RATE_LIMIT_EXCEEDED));
  },
});

/**
 * General API rate limiter for standard routes
 * 15-minute window with maximum 300 requests per IP
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next) => {
    next(new ApiError(HTTP_STATUS.TOO_MANY_REQUESTS, MESSAGES.RATE_LIMIT_EXCEEDED));
  },
});

export default {
  authLimiter,
  apiLimiter,
};
