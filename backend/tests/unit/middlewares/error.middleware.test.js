import { jest, describe, test, expect, beforeEach } from '@jest/globals';
import { errorHandler } from '../../../src/middleware/error.middleware.js';
import { ApiError } from '../../../src/utils/apiError.js';
import { HTTP_STATUS } from '../../../src/constants/httpStatusCodes.js';

describe('Error Handling Middleware Unit Tests', () => {
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    mockReq = {};
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  test('should handle operational ApiError correctly', () => {
    const error = ApiError.notFound('Resource not found');

    errorHandler(error, mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(HTTP_STATUS.NOT_FOUND);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        statusCode: 404,
        message: 'Resource not found',
      })
    );
  });

  test('should convert Mongoose CastError to 400 Bad Request', () => {
    const castError = {
      name: 'CastError',
      path: '_id',
      value: 'invalid-id-format',
    };

    errorHandler(castError, mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        statusCode: 400,
        message: "Invalid format for field '_id': 'invalid-id-format'",
      })
    );
  });

  test('should convert MongoDB duplicate key (11000) error to 409 Conflict', () => {
    const duplicateError = {
      code: 11000,
      keyValue: { email: 'duplicate@test.com' },
    };

    errorHandler(duplicateError, mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(HTTP_STATUS.CONFLICT);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        statusCode: 409,
        message: expect.stringContaining("Duplicate value 'duplicate@test.com'"),
      })
    );
  });

  test('should convert Zod validation error to 400 with field issues', () => {
    const zodError = {
      name: 'ZodError',
      issues: [
        { path: ['email'], message: 'Invalid email address' },
        { path: ['password'], message: 'Password too short' },
      ],
    };

    errorHandler(zodError, mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        statusCode: 400,
        errors: [
          { field: 'email', message: 'Invalid email address' },
          { field: 'password', message: 'Password too short' },
        ],
      })
    );
  });

  test('should convert JWT TokenExpiredError to 401 Unauthorized', () => {
    const jwtError = { name: 'TokenExpiredError' };

    errorHandler(jwtError, mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(HTTP_STATUS.UNAUTHORIZED);
  });

  test('should convert unknown error to 500 Internal Server Error', () => {
    const genericError = new Error('Unexpected database failure');

    errorHandler(genericError, mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        statusCode: 500,
      })
    );
  });
});
