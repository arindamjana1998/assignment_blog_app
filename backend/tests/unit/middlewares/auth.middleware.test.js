import { jest, describe, test, expect, beforeEach } from '@jest/globals';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import TokenService from '../../../src/services/token.service.js';
import User from '../../../src/models/user.model.js';
import { ApiError } from '../../../src/utils/apiError.js';
import { HTTP_STATUS } from '../../../src/constants/httpStatusCodes.js';

describe('Auth Middleware Unit Tests', () => {
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    mockReq = {
      headers: {},
    };
    mockRes = {};
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  test('should return 401 if authorization header is missing', async () => {
    await authenticate(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalledWith(expect.any(ApiError));
    const error = mockNext.mock.calls[0][0];
    expect(error.statusCode).toBe(HTTP_STATUS.UNAUTHORIZED);
  });

  test('should return 401 if authorization header does not start with Bearer', async () => {
    mockReq.headers.authorization = 'Basic token123';
    await authenticate(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalledWith(expect.any(ApiError));
    const error = mockNext.mock.calls[0][0];
    expect(error.statusCode).toBe(HTTP_STATUS.UNAUTHORIZED);
  });

  test('should return 401 if token verification throws an error', async () => {
    mockReq.headers.authorization = 'Bearer invalid-token';
    jest.spyOn(TokenService, 'verifyAccessToken').mockImplementation(() => {
      throw ApiError.unauthorized('Token expired');
    });

    await authenticate(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalledWith(expect.any(ApiError));
    const error = mockNext.mock.calls[0][0];
    expect(error.statusCode).toBe(HTTP_STATUS.UNAUTHORIZED);
  });

  test('should return 401 if user does not exist in database', async () => {
    mockReq.headers.authorization = 'Bearer valid-token';
    jest.spyOn(TokenService, 'verifyAccessToken').mockReturnValue({ sub: 'user123' });
    jest.spyOn(User, 'findById').mockResolvedValue(null);

    await authenticate(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalledWith(expect.any(ApiError));
    const error = mockNext.mock.calls[0][0];
    expect(error.statusCode).toBe(HTTP_STATUS.UNAUTHORIZED);
  });

  test('should return 403 if user account is deactivated', async () => {
    mockReq.headers.authorization = 'Bearer valid-token';
    jest.spyOn(TokenService, 'verifyAccessToken').mockReturnValue({ sub: 'user123' });
    jest.spyOn(User, 'findById').mockResolvedValue({
      _id: 'user123',
      isActive: false,
    });

    await authenticate(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalledWith(expect.any(ApiError));
    const error = mockNext.mock.calls[0][0];
    expect(error.statusCode).toBe(HTTP_STATUS.FORBIDDEN);
  });

  test('should attach user to req and call next() on valid token and active user', async () => {
    const mockUser = {
      _id: 'user123',
      name: 'John Doe',
      role: 'user',
      isActive: true,
    };

    mockReq.headers.authorization = 'Bearer valid-token';
    jest.spyOn(TokenService, 'verifyAccessToken').mockReturnValue({ sub: 'user123' });
    jest.spyOn(User, 'findById').mockResolvedValue(mockUser);

    await authenticate(mockReq, mockRes, mockNext);

    expect(mockReq.user).toEqual(mockUser);
    expect(mockNext).toHaveBeenCalledWith();
  });
});
