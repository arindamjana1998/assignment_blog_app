import { jest, describe, test, expect, beforeEach } from '@jest/globals';
import request from 'supertest';
import app from '../../src/app.js';
import AdminService from '../../src/services/admin.service.js';
import TokenService from '../../src/services/token.service.js';
import User from '../../src/models/user.model.js';

describe('Admin Routes Integration Tests (/api/v1/admin)', () => {
  const standardUser = {
    _id: '507f1f77bcf86cd799439011',
    name: 'Normal User',
    email: 'normal@example.com',
    role: 'user',
    isActive: true,
  };

  const adminUser = {
    _id: '507f1f77bcf86cd799439000',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin',
    isActive: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('RBAC Protection', () => {
    test('should return 401 if unauthenticated', async () => {
      const response = await request(app).get('/api/v1/admin/dashboard');
      expect(response.status).toBe(401);
    });

    test('should return 403 Forbidden if authenticated as non-admin user', async () => {
      jest.spyOn(TokenService, 'verifyAccessToken').mockReturnValue({ sub: standardUser._id });
      jest.spyOn(User, 'findById').mockResolvedValue(standardUser);

      const response = await request(app)
        .get('/api/v1/admin/dashboard')
        .set('Authorization', 'Bearer user_token');

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/admin/dashboard', () => {
    test('should return 200 with aggregated metrics for admin', async () => {
      jest.spyOn(TokenService, 'verifyAccessToken').mockReturnValue({ sub: adminUser._id });
      jest.spyOn(User, 'findById').mockResolvedValue(adminUser);

      const mockMetrics = {
        totalUsers: 15,
        activeUsers: 14,
        totalPosts: 30,
        totalComments: 75,
      };

      jest.spyOn(AdminService, 'getDashboardMetrics').mockResolvedValue(mockMetrics);

      const response = await request(app)
        .get('/api/v1/admin/dashboard')
        .set('Authorization', 'Bearer admin_token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockMetrics);
    });
  });

  describe('GET /api/v1/admin/users', () => {
    test('should return 200 with paginated user directory', async () => {
      jest.spyOn(TokenService, 'verifyAccessToken').mockReturnValue({ sub: adminUser._id });
      jest.spyOn(User, 'findById').mockResolvedValue(adminUser);

      const mockResult = {
        users: [standardUser, adminUser],
        pagination: { page: 1, limit: 10, totalItems: 2, totalPages: 1 },
      };

      jest.spyOn(AdminService, 'getUsers').mockResolvedValue(mockResult);

      const response = await request(app)
        .get('/api/v1/admin/users')
        .set('Authorization', 'Bearer admin_token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
    });
  });

  describe('PATCH /api/v1/admin/posts/:id', () => {
    test('should allow admin to restore or update post status', async () => {
      jest.spyOn(TokenService, 'verifyAccessToken').mockReturnValue({ sub: adminUser._id });
      jest.spyOn(User, 'findById').mockResolvedValue(adminUser);

      const mockUpdatedPost = {
        _id: 'post123',
        title: 'Restored Post Title',
        isDeleted: false,
      };

      jest.spyOn(AdminService, 'updatePost').mockResolvedValue(mockUpdatedPost);

      const response = await request(app)
        .patch('/api/v1/admin/posts/post123')
        .set('Authorization', 'Bearer admin_token')
        .send({ isDeleted: false });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.post.isDeleted).toBe(false);
    });
  });

  describe('PATCH /api/v1/admin/comments/:id', () => {
    test('should allow admin to moderate and update comment content', async () => {
      jest.spyOn(TokenService, 'verifyAccessToken').mockReturnValue({ sub: adminUser._id });
      jest.spyOn(User, 'findById').mockResolvedValue(adminUser);

      const mockUpdatedComment = {
        _id: 'c1',
        content: 'Cleaned comment content',
        author: standardUser,
      };

      jest.spyOn(AdminService, 'updateComment').mockResolvedValue(mockUpdatedComment);

      const response = await request(app)
        .patch('/api/v1/admin/comments/c1')
        .set('Authorization', 'Bearer admin_token')
        .send({ content: 'Cleaned comment content' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.comment.content).toBe('Cleaned comment content');
    });

    test('should return 403 when non-admin attempts to access admin comment update', async () => {
      jest.spyOn(TokenService, 'verifyAccessToken').mockReturnValue({ sub: standardUser._id });
      jest.spyOn(User, 'findById').mockResolvedValue(standardUser);

      const response = await request(app)
        .patch('/api/v1/admin/comments/c1')
        .set('Authorization', 'Bearer user_token')
        .send({ content: 'Unauthorized admin edit' });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/admin/activity-logs', () => {
    test('should return 200 with paginated activity logs for admin', async () => {
      jest.spyOn(TokenService, 'verifyAccessToken').mockReturnValue({ sub: adminUser._id });
      jest.spyOn(User, 'findById').mockResolvedValue(adminUser);

      const mockLogsResult = {
        logs: [
          {
            _id: 'log1',
            event: 'USER_LOGIN',
            userName: 'Admin User',
            method: 'POST',
            path: '/api/v1/auth/login',
            statusCode: 200,
          },
        ],
        pagination: { page: 1, limit: 10, totalItems: 1, totalPages: 1 },
      };

      jest.spyOn(AdminService, 'getActivityLogs').mockResolvedValue(mockLogsResult);

      const response = await request(app)
        .get('/api/v1/admin/activity-logs')
        .set('Authorization', 'Bearer admin_token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].event).toBe('USER_LOGIN');
    });

    test('should return 403 when non-admin accesses activity logs', async () => {
      jest.spyOn(TokenService, 'verifyAccessToken').mockReturnValue({ sub: standardUser._id });
      jest.spyOn(User, 'findById').mockResolvedValue(standardUser);

      const response = await request(app)
        .get('/api/v1/admin/activity-logs')
        .set('Authorization', 'Bearer user_token');

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });
  });
});
