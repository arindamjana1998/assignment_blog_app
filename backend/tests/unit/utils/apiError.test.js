import { describe, test, expect } from '@jest/globals';
import { ApiError } from '../../../src/utils/apiError.js';
import { HTTP_STATUS } from '../../../src/constants/httpStatusCodes.js';

describe('ApiError Utility Unit Tests', () => {
  test('should create ApiError with correct properties', () => {
    const error = new ApiError(HTTP_STATUS.NOT_FOUND, 'Resource not found', [{ field: 'id', message: 'invalid' }]);

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(ApiError);
    expect(error.statusCode).toBe(404);
    expect(error.message).toBe('Resource not found');
    expect(error.isOperational).toBe(true);
    expect(error.errors).toEqual([{ field: 'id', message: 'invalid' }]);
    expect(error.stack).toBeDefined();
  });

  test('ApiError.badRequest should create 400 error', () => {
    const error = ApiError.badRequest('Invalid input data', ['Field required']);
    expect(error.statusCode).toBe(HTTP_STATUS.BAD_REQUEST);
    expect(error.message).toBe('Invalid input data');
    expect(error.errors).toEqual(['Field required']);
  });

  test('ApiError.unauthorized should create 401 error', () => {
    const error = ApiError.unauthorized('Token expired');
    expect(error.statusCode).toBe(HTTP_STATUS.UNAUTHORIZED);
    expect(error.message).toBe('Token expired');
  });

  test('ApiError.forbidden should create 403 error', () => {
    const error = ApiError.forbidden('Access denied');
    expect(error.statusCode).toBe(HTTP_STATUS.FORBIDDEN);
    expect(error.message).toBe('Access denied');
  });

  test('ApiError.notFound should create 404 error', () => {
    const error = ApiError.notFound('Post not found');
    expect(error.statusCode).toBe(HTTP_STATUS.NOT_FOUND);
    expect(error.message).toBe('Post not found');
  });

  test('ApiError.conflict should create 409 error', () => {
    const error = ApiError.conflict('Email already in use');
    expect(error.statusCode).toBe(HTTP_STATUS.CONFLICT);
    expect(error.message).toBe('Email already in use');
  });

  test('ApiError.unprocessable should create 422 error', () => {
    const error = ApiError.unprocessable('Semantic validation failed');
    expect(error.statusCode).toBe(HTTP_STATUS.UNPROCESSABLE_ENTITY);
    expect(error.message).toBe('Semantic validation failed');
  });

  test('ApiError.internal should create 500 error', () => {
    const error = ApiError.internal('Database connection lost');
    expect(error.statusCode).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
    expect(error.message).toBe('Database connection lost');
  });
});
