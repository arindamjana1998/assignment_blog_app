import { jest, describe, test, expect, beforeEach } from '@jest/globals';
import { ApiResponse } from '../../../src/utils/apiResponse.js';
import { HTTP_STATUS } from '../../../src/constants/httpStatusCodes.js';

describe('ApiResponse Utility Unit Tests', () => {
  let mockRes;

  beforeEach(() => {
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  test('should create default ApiResponse instance with success true', () => {
    const resInstance = new ApiResponse(HTTP_STATUS.OK, 'Operation successful', { foo: 'bar' });

    expect(resInstance.success).toBe(true);
    expect(resInstance.statusCode).toBe(200);
    expect(resInstance.message).toBe('Operation successful');
    expect(resInstance.data).toEqual({ foo: 'bar' });
  });

  test('should handle ApiResponse.success static method', () => {
    ApiResponse.success(mockRes, 'Data retrieved', { id: 1 });

    expect(mockRes.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        statusCode: 200,
        message: 'Data retrieved',
        data: { id: 1 },
      })
    );
  });

  test('should handle ApiResponse.created static method with 201 status', () => {
    ApiResponse.created(mockRes, 'Entity created', { id: 123 });

    expect(mockRes.status).toHaveBeenCalledWith(HTTP_STATUS.CREATED);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        statusCode: 201,
        message: 'Entity created',
        data: { id: 123 },
      })
    );
  });

  test('should include pagination metadata when ApiResponse.paginated is called', () => {
    const pagination = { page: 1, limit: 10, total: 50, totalPages: 5 };
    const items = [{ id: 1 }, { id: 2 }];

    ApiResponse.paginated(mockRes, 'List retrieved', items, pagination);

    expect(mockRes.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        statusCode: 200,
        message: 'List retrieved',
        data: items,
        pagination: pagination,
      })
    );
  });
});
