import { jest, describe, test, expect, beforeEach } from '@jest/globals';
import { activityLogger } from '../../../src/middleware/activityLogger.middleware.js';
import ActivityLog from '../../../src/models/activityLog.model.js';

describe('Activity Logger Middleware Unit Tests', () => {
  let req;
  let res;
  let next;
  let finishCallback;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(ActivityLog, 'create').mockResolvedValue({});
    req = {
      method: 'GET',
      originalUrl: '/api/v1/posts',
      url: '/api/v1/posts',
    };
    res = {
      statusCode: 200,
      on: jest.fn((event, cb) => {
        if (event === 'finish') {
          finishCallback = cb;
        }
      }),
    };
    next = jest.fn();
  });

  test('should pass through non-mutating and non-auth requests without attaching finish listener', () => {
    activityLogger(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.on).not.toHaveBeenCalled();
  });

  test('should attach finish listener and log activity for mutating POST requests', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    req.method = 'POST';
    req.originalUrl = '/api/v1/posts';
    req.user = {
      _id: '507f1f77bcf86cd799439011',
      name: 'John Doe',
      role: 'admin',
    };

    activityLogger(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.on).toHaveBeenCalledWith('finish', expect.any(Function));

    // Trigger finish callback
    res.statusCode = 201;
    finishCallback();

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('[ACTIVITY LOG]')
    );
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('POST_CREATE')
    );
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('John Doe')
    );
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('role: admin')
    );

    consoleSpy.mockRestore();
  });

  test('should log authentication activities correctly', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    req.method = 'POST';
    req.originalUrl = '/api/v1/auth/login';

    activityLogger(req, res, next);
    expect(res.on).toHaveBeenCalledWith('finish', expect.any(Function));

    res.statusCode = 200;
    finishCallback();

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('USER_LOGIN')
    );
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Unauthenticated / Guest')
    );

    consoleSpy.mockRestore();
  });
});
