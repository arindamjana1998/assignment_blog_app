import { jest, describe, test, expect, beforeEach } from '@jest/globals';
import request from 'supertest';
import app from '../../src/app.js';
import CommentService from '../../src/services/comment.service.js';
import TokenService from '../../src/services/token.service.js';
import User from '../../src/models/user.model.js';

describe('Comment Routes Integration Tests (/api/v1/comments and /api/v1/posts/:id/comments)', () => {
  const mockUser = {
    _id: '507f1f77bcf86cd799439011',
    name: 'Commenter',
    email: 'commenter@example.com',
    role: 'user',
    isActive: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/v1/posts/:postId/comments', () => {
    test('should return paginated comments for post', async () => {
      const mockResult = {
        comments: [
          { _id: 'c1', content: 'Great read!', author: { name: 'Bob' } },
        ],
        pagination: {
          page: 1,
          limit: 20,
          totalItems: 1,
          totalPages: 1,
        },
      };

      jest.spyOn(CommentService, 'getCommentsByPost').mockResolvedValue(mockResult);

      const response = await request(app).get('/api/v1/posts/507f1f77bcf86cd799439022/comments');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
    });
  });

  describe('POST /api/v1/posts/:postId/comments', () => {
    test('should return 401 when unauthenticated', async () => {
      const response = await request(app)
        .post('/api/v1/posts/507f1f77bcf86cd799439022/comments')
        .send({ content: 'Nice post!' });

      expect(response.status).toBe(401);
    });

    test('should return 201 when authenticated user posts comment', async () => {
      jest.spyOn(TokenService, 'verifyAccessToken').mockReturnValue({ sub: mockUser._id });
      jest.spyOn(User, 'findById').mockResolvedValue(mockUser);

      const mockComment = {
        _id: 'newcomment123',
        content: 'This is a genuine comment.',
        post: '507f1f77bcf86cd799439022',
        author: mockUser,
      };

      jest.spyOn(CommentService, 'createComment').mockResolvedValue(mockComment);

      const response = await request(app)
        .post('/api/v1/posts/507f1f77bcf86cd799439022/comments')
        .set('Authorization', 'Bearer valid_mock_token')
        .send({ content: 'This is a genuine comment.' });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.comment.content).toBe('This is a genuine comment.');
    });
  });

  describe('DELETE /api/v1/comments/:id', () => {
    test('should return 200 when deleting comment', async () => {
      jest.spyOn(TokenService, 'verifyAccessToken').mockReturnValue({ sub: mockUser._id });
      jest.spyOn(User, 'findById').mockResolvedValue(mockUser);
      jest.spyOn(CommentService, 'deleteComment').mockResolvedValue({ _id: 'c1', isDeleted: true });

      const response = await request(app)
        .delete('/api/v1/comments/c1')
        .set('Authorization', 'Bearer valid_mock_token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('PATCH /api/v1/comments/:id', () => {
    const mockAdminUser = {
      _id: '507f1f77bcf86cd799439000',
      name: 'Admin User',
      email: 'admin@example.com',
      role: 'admin',
      isActive: true,
    };

    const mockOtherUser = {
      _id: '507f1f77bcf86cd799439099',
      name: 'Other User',
      email: 'other@example.com',
      role: 'user',
      isActive: true,
    };

    test('should return 401 when unauthenticated', async () => {
      const response = await request(app)
        .patch('/api/v1/comments/c1')
        .send({ content: 'Updated without auth' });

      expect(response.status).toBe(401);
    });

    test('should return 400 when content validation fails', async () => {
      jest.spyOn(TokenService, 'verifyAccessToken').mockReturnValue({ sub: mockUser._id });
      jest.spyOn(User, 'findById').mockResolvedValue(mockUser);

      const response = await request(app)
        .patch('/api/v1/comments/c1')
        .set('Authorization', 'Bearer valid_mock_token')
        .send({ content: '   ' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test('should return 200 when comment author updates own comment', async () => {
      jest.spyOn(TokenService, 'verifyAccessToken').mockReturnValue({ sub: mockUser._id });
      jest.spyOn(User, 'findById').mockResolvedValue(mockUser);

      const mockUpdated = {
        _id: 'c1',
        content: 'Author updated content',
        author: mockUser,
      };
      jest.spyOn(CommentService, 'updateComment').mockResolvedValue(mockUpdated);

      const response = await request(app)
        .patch('/api/v1/comments/c1')
        .set('Authorization', 'Bearer valid_mock_token')
        .send({ content: 'Author updated content' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.comment.content).toBe('Author updated content');
    });

    test('should return 403 when regular user attempts to update another user\'s comment', async () => {
      jest.spyOn(TokenService, 'verifyAccessToken').mockReturnValue({ sub: mockOtherUser._id });
      jest.spyOn(User, 'findById').mockResolvedValue(mockOtherUser);

      const { ApiError } = await import('../../src/utils/apiError.js');
      jest.spyOn(CommentService, 'updateComment').mockRejectedValue(
        ApiError.forbidden('You do not have permission to modify this comment')
      );

      const response = await request(app)
        .patch('/api/v1/comments/c1')
        .set('Authorization', 'Bearer other_token')
        .send({ content: 'Tampered content attempt' });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });

    test('should return 200 when administrator updates another user\'s comment', async () => {
      jest.spyOn(TokenService, 'verifyAccessToken').mockReturnValue({ sub: mockAdminUser._id });
      jest.spyOn(User, 'findById').mockResolvedValue(mockAdminUser);

      const mockAdminUpdated = {
        _id: 'c1',
        content: 'Moderated comment content by Admin',
        author: mockUser,
      };
      jest.spyOn(CommentService, 'updateComment').mockResolvedValue(mockAdminUpdated);

      const response = await request(app)
        .patch('/api/v1/comments/c1')
        .set('Authorization', 'Bearer admin_token')
        .send({ content: 'Moderated comment content by Admin' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.comment.content).toBe('Moderated comment content by Admin');
    });
  });
});
