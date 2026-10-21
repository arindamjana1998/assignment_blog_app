import { jest, describe, test, expect, beforeEach } from '@jest/globals';
import CommentService from '../../../src/services/comment.service.js';
import Comment from '../../../src/models/comment.model.js';
import Post from '../../../src/models/post.model.js';
import { ApiError } from '../../../src/utils/apiError.js';

describe('CommentService Unit Tests', () => {
  const authorId = '507f1f77bcf86cd799439011';
  const otherUserId = '507f1f77bcf86cd799439099';
  const postId = '507f1f77bcf86cd799439022';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createComment', () => {
    test('should throw 404 if post does not exist', async () => {
      jest.spyOn(Post, 'findOne').mockResolvedValue(null);

      await expect(
        CommentService.createComment({
          postId,
          authorId,
          content: 'Nice article!',
        })
      ).rejects.toThrow(ApiError);
    });

    test('should create comment and populate author if post exists', async () => {
      jest.spyOn(Post, 'findOne').mockResolvedValue({ _id: postId, isDeleted: false });
      const mockComment = {
        _id: 'comment123',
        content: 'Nice article!',
        post: postId,
        author: authorId,
        populate: jest.fn().mockResolvedValue({
          _id: 'comment123',
          content: 'Nice article!',
          author: { name: 'Alice' },
        }),
      };
      jest.spyOn(Comment, 'create').mockResolvedValue(mockComment);

      const result = await CommentService.createComment({
        postId,
        authorId,
        content: '  Nice article!  ',
      });

      expect(result.content).toBe('Nice article!');
      expect(Comment.create).toHaveBeenCalledWith(
        expect.objectContaining({
          content: 'Nice article!',
          post: postId,
          author: authorId,
          isDeleted: false,
        })
      );
    });
  });

  describe('updateComment', () => {
    test('should throw 403 if user is not author or admin', async () => {
      const mockComment = {
        _id: 'comment123',
        author: authorId,
        isDeleted: false,
      };
      jest.spyOn(Comment, 'findById').mockResolvedValue(mockComment);

      await expect(
        CommentService.updateComment('comment123', 'Updated', { _id: otherUserId, role: 'user' })
      ).rejects.toThrow(ApiError);
    });

    test('should allow owner to update comment content', async () => {
      const mockComment = {
        _id: 'comment123',
        author: authorId,
        content: 'Old comment',
        isDeleted: false,
        save: jest.fn().mockResolvedValue(true),
        populate: jest.fn().mockResolvedValue({ _id: 'comment123', content: 'Updated comment' }),
      };
      jest.spyOn(Comment, 'findById').mockResolvedValue(mockComment);

      const result = await CommentService.updateComment(
        'comment123',
        'Updated comment',
        { _id: authorId, role: 'user' }
      );

      expect(mockComment.content).toBe('Updated comment');
      expect(mockComment.save).toHaveBeenCalled();
    });

    test('should allow admin to update another user\'s comment content', async () => {
      const mockComment = {
        _id: 'comment123',
        author: authorId,
        content: 'Old comment by regular user',
        isDeleted: false,
        save: jest.fn().mockResolvedValue(true),
        populate: jest.fn().mockResolvedValue({ _id: 'comment123', content: 'Moderated by Admin' }),
      };
      jest.spyOn(Comment, 'findById').mockResolvedValue(mockComment);

      const result = await CommentService.updateComment(
        'comment123',
        'Moderated by Admin',
        { _id: otherUserId, role: 'admin' }
      );

      expect(mockComment.content).toBe('Moderated by Admin');
      expect(mockComment.save).toHaveBeenCalled();
    });

    test('should throw 404 if comment is not found or is deleted', async () => {
      jest.spyOn(Comment, 'findById').mockResolvedValue(null);

      await expect(
        CommentService.updateComment('nonexistent', 'Content', { _id: authorId, role: 'user' })
      ).rejects.toThrow(ApiError);
    });
  });

  describe('deleteComment', () => {
    test('should allow owner or admin to delete comment', async () => {
      const mockComment = {
        _id: 'comment123',
        author: authorId,
        isDeleted: false,
        deletedAt: null,
        save: jest.fn().mockResolvedValue(true),
      };
      jest.spyOn(Comment, 'findById').mockResolvedValue(mockComment);

      const result = await CommentService.deleteComment('comment123', { _id: authorId, role: 'user' });

      expect(result.isDeleted).toBe(true);
      expect(result.deletedAt).toBeInstanceOf(Date);
      expect(mockComment.save).toHaveBeenCalled();
    });
  });
});
