import { ApiError } from '../utils/apiError.js';
import { HTTP_STATUS } from '../constants/httpStatusCodes.js';
import { MESSAGES } from '../constants/messages.js';
import env from '../config/env.js';

export const errorHandler = (err, req, res, next) => {
  let error = err;

  // Handle Mongoose Bad ObjectId (CastError)
  if (err.name === 'CastError') {
    const message = `Invalid format for field '${err.path}': '${err.value}'`;
    error = ApiError.badRequest(message);
  }

  // Handle MongoDB Duplicate Key (E11000)
  else if (err.code === 11000) {
    const duplicateField = Object.keys(err.keyValue || {})[0] || 'field';
    const duplicateValue = err.keyValue ? err.keyValue[duplicateField] : '';
    const message = `Duplicate value '${duplicateValue}' for field '${duplicateField}'. Please use another value.`;
    error = ApiError.conflict(message);
  }

  // Handle Mongoose Schema Validation Error
  else if (err.name === 'ValidationError') {
    const formattedErrors = Object.values(err.errors || {}).map((item) => ({
      field: item.path,
      message: item.message,
    }));
    error = ApiError.badRequest(MESSAGES.VALIDATION_ERROR, formattedErrors);
  }

  // Handle Zod Validation Error
  else if (err.name === 'ZodError' || Array.isArray(err.issues)) {
    const formattedErrors = (err.issues || []).map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));
    error = ApiError.badRequest(MESSAGES.VALIDATION_ERROR, formattedErrors);
  }

  // Handle JWT Malformed / Invalid
  else if (err.name === 'JsonWebTokenError') {
    error = ApiError.unauthorized(MESSAGES.TOKEN_INVALID);
  }

  // Handle JWT Expired
  else if (err.name === 'TokenExpiredError') {
    error = ApiError.unauthorized(MESSAGES.TOKEN_EXPIRED);
  }

  // Handle SyntaxError in request payload (e.g. invalid JSON)
  else if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    error = ApiError.badRequest('Malformed JSON payload in request body');
  }

  // If not already an operational ApiError instance, wrap it
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
    const message = error.message || MESSAGES.INTERNAL_SERVER_ERROR;
    error = new ApiError(statusCode, message, [], err.stack);
  }

  const statusCode = error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  const response = {
    success: false,
    message: error.message || MESSAGES.INTERNAL_SERVER_ERROR,
    statusCode,
    errors: error.errors && error.errors.length > 0 ? error.errors : undefined,
  };

  // Expose stack trace only in development
  if (env.isDevelopment) {
    response.stack = error.stack;
  }

  // Log server errors (5xx)
  if (statusCode >= 500) {
    console.error(`[Server Error ${statusCode}]`, err);
  }

  return res.status(statusCode).json(response);
};

export default errorHandler;
