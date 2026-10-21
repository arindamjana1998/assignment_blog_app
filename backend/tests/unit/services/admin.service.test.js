import { jest, describe, test, expect, beforeEach } from '@jest/globals';
import AdminService from '../../../src/services/admin.service.js';
import User from '../../../src/models/user.model.js';
import Post from '../../../src/models/post.model.js';
import Comment from '../../../src/models/comment.model.js';
import RefreshToken from '../../../src/models/refreshToken.model.js';
import { ApiError } from '../../../src/utils/apiError.js';

describe('AdminService Unit Tests', () => {
  const currentAdminId = '507f1f77bcf86cd799439000';
  const targetUserId = '507f1f77bcf86cd799439111';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getDashboardMetrics', () => {
    test('should aggregate platform metrics correctly', async () => {
      jest.spyOn(User, 'countDocuments').mockImplementation(async (filter) => {
        if (filter && filter.isActive) return 8;
        return 10;
      });
      jest.spyOn(Post, 'countDocuments').mockResolvedValue(25);
      jest.spyOn(Comment, 'countDocuments').mockResolvedValue(50);

      const metrics = await AdminService.getDashboardMetrics();

      expect(metrics).toEqual({
        totalUsers: 10,
        activeUsers: 8,
        totalPosts: 25,
        totalComments: 50,
      });
    });
  });

  describe('updateUser', () => {
    test('should throw 400 if admin attempts to deactivate their own account', async () => {
      const mockAdminUser = {
        _id: currentAdminId,
        role: 'admin',
        isActive: true,
      };
      jest.spyOn(User, 'findById').mockResolvedValue(mockAdminUser);

      await expect(
        AdminService.updateUser(currentAdminId, { isActive: false }, currentAdminId)
      ).rejects.toThrow(/cannot deactivate their own account/);
    });

    test('should throw 400 if admin attempts to demote their own role', async () => {
      const mockAdminUser = {
        _id: currentAdminId,
        role: 'admin',
        isActive: true,
      };
      jest.spyOn(User, 'findById').mockResolvedValue(mockAdminUser);

      await expect(
        AdminService.updateUser(currentAdminId, { role: 'user' }, currentAdminId)
      ).rejects.toThrow(/cannot demote their own role/);
    });

    test('should update target user role and status and revoke tokens when deactivated', async () => {
      const mockTargetUser = {
        _id: targetUserId,
        role: 'user',
        isActive: true,
        save: jest.fn().mockResolvedValue(true),
        toJSON: jest.fn().mockReturnValue({ _id: targetUserId, role: 'admin', isActive: false }),
      };
      jest.spyOn(User, 'findById').mockResolvedValue(mockTargetUser);
      const updateTokensSpy = jest.spyOn(RefreshToken, 'updateMany').mockResolvedValue({ modifiedCount: 2 });

      const updated = await AdminService.updateUser(
        targetUserId,
        { role: 'admin', isActive: false },
        currentAdminId
      );

      expect(mockTargetUser.role).toBe('admin');
      expect(mockTargetUser.isActive).toBe(false);
      expect(mockTargetUser.save).toHaveBeenCalled();
      expect(updateTokensSpy).toHaveBeenCalledWith({ user: targetUserId }, { isRevoked: true });
      expect(updated.role).toBe('admin');
    });
  });

  describe('deletePost', () => {
    test('should cascade delete comments and delete post', async () => {
      const mockPost = { _id: 'post123', title: 'To Delete' };
      jest.spyOn(Post, 'findById').mockResolvedValue(mockPost);
      const deleteCommentsSpy = jest.spyOn(Comment, 'deleteMany').mockResolvedValue({ deletedCount: 5 });
      const deletePostSpy = jest.spyOn(Post, 'findByIdAndDelete').mockResolvedValue(mockPost);

      const res = await AdminService.deletePost('post123');

      expect(res).toEqual({ id: 'post123', deleted: true });
      expect(deleteCommentsSpy).toHaveBeenCalledWith({ post: 'post123' });
      expect(deletePostSpy).toHaveBeenCalledWith('post123');
    });
  });

  describe('getActivityLogs', () => {
    test('should return paginated activity logs', async () => {
      const ActivityLog = (await import('../../../src/models/activityLog.model.js')).default;

      jest.spyOn(ActivityLog, 'countDocuments').mockResolvedValue(1);
      const mockChain = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([
          {
            _id: 'log1',
            event: 'USER_LOGIN',
            userName: 'Admin User',
            statusCode: 200,
          },
        ]),
      };
      jest.spyOn(ActivityLog, 'find').mockReturnValue(mockChain);

      const res = await AdminService.getActivityLogs({ page: 1, limit: 10, search: 'Admin' });

      expect(res.logs).toHaveLength(1);
      expect(res.pagination.totalItems).toBe(1);
      expect(res.logs[0].event).toBe('USER_LOGIN');
    });
  });
});
