import { HTTP_STATUS } from '../constants/httpStatusCodes.js';

export class ApiError extends Error {
  /**
   * Custom Operational API Error
   * @param {number} statusCode - HTTP status code
   * @param {string} message - Error description message
   * @param {Array|object} errors - Detailed validation or field errors
   * @param {string} stack - Optional custom stack trace
   */
  constructor(statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR, message = 'Internal Server Error', errors = [], stack = '') {
    super(message);
    this.statusCode = statusCode;
    this.success = false;
    this.errors = errors;
    this.isOperational = true;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  static badRequest(message = 'Bad Request', errors = []) {
    return new ApiError(HTTP_STATUS.BAD_REQUEST, message, errors);
  }

  static unauthorized(message = 'Unauthorized access', errors = []) {
    return new ApiError(HTTP_STATUS.UNAUTHORIZED, message, errors);
  }

  static forbidden(message = 'Forbidden action', errors = []) {
    return new ApiError(HTTP_STATUS.FORBIDDEN, message, errors);
  }

  static notFound(message = 'Resource not found', errors = []) {
    return new ApiError(HTTP_STATUS.NOT_FOUND, message, errors);
  }

  static conflict(message = 'Resource conflict', errors = []) {
    return new ApiError(HTTP_STATUS.CONFLICT, message, errors);
  }

  static unprocessable(message = 'Unprocessable entity', errors = []) {
    return new ApiError(HTTP_STATUS.UNPROCESSABLE_ENTITY, message, errors);
  }

  static tooManyRequests(message = 'Too many requests', errors = []) {
    return new ApiError(HTTP_STATUS.TOO_MANY_REQUESTS, message, errors);
  }

  static internal(message = 'Internal server error', errors = []) {
    return new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, message, errors);
  }
}

export default ApiError;
