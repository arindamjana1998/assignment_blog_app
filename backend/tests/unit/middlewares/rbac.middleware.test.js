import { jest, describe, test, expect, beforeEach } from '@jest/globals';
import { authorize, requireAdmin } from '../../../src/middleware/rbac.middleware.js';
import { ApiError } from '../../../src/utils/apiError.js';
import { HTTP_STATUS } from '../../../src/constants/httpStatusCodes.js';
import { ROLES } from '../../../src/constants/roles.js';

describe('RBAC Middleware Unit Tests', () => {
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    mockReq = {};
    mockRes = {};
    mockNext = jest.fn();
  });

  test('should return 401 if req.user is missing', () => {
    const middleware = authorize(ROLES.USER);
    middleware(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalledWith(expect.any(ApiError));
    const error = mockNext.mock.calls[0][0];
    expect(error.statusCode).toBe(HTTP_STATUS.UNAUTHORIZED);
  });

  test('should return 403 if user role is not authorized', () => {
    mockReq.user = { role: ROLES.USER };
    const middleware = authorize(ROLES.ADMIN);
    middleware(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalledWith(expect.any(ApiError));
    const error = mockNext.mock.calls[0][0];
    expect(error.statusCode).toBe(HTTP_STATUS.FORBIDDEN);
  });

  test('should call next() if user role matches allowed roles', () => {
    mockReq.user = { role: ROLES.ADMIN };
    const middleware = authorize(ROLES.ADMIN, ROLES.USER);
    middleware(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalledWith();
  });

  test('requireAdmin middleware should allow admins and reject standard users', () => {
    mockReq.user = { role: ROLES.ADMIN };
    requireAdmin(mockReq, mockRes, mockNext);
    expect(mockNext).toHaveBeenCalledWith();

    mockNext.mockClear();
    mockReq.user = { role: ROLES.USER };
    requireAdmin(mockReq, mockRes, mockNext);
    expect(mockNext).toHaveBeenCalledWith(expect.any(ApiError));
    expect(mockNext.mock.calls[0][0].statusCode).toBe(HTTP_STATUS.FORBIDDEN);
  });
});
