import { jest, describe, test, expect, beforeEach } from '@jest/globals';
import PostService from '../../../src/services/post.service.js';
import Post from '../../../src/models/post.model.js';
import { ApiError } from '../../../src/utils/apiError.js';

describe('PostService Unit Tests', () => {
  const authorId = '507f1f77bcf86cd799439011';
  const otherUserId = '507f1f77bcf86cd799439099';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createPost', () => {
    test('should generate unique slug and create post', async () => {
      // Post.findOne returns null so base slug is immediately free
      jest.spyOn(Post, 'findOne').mockResolvedValue(null);

      const mockCreatedPost = {
        _id: 'post123',
        title: 'Test Article Title',
        slug: 'test-article-title',
        content: 'Article content goes here.',
        author: authorId,
        populate: jest.fn().mockResolvedValue({
          _id: 'post123',
          title: 'Test Article Title',
          slug: 'test-article-title',
          author: { _id: authorId, name: 'Alice' },
        }),
      };
      jest.spyOn(Post, 'create').mockResolvedValue(mockCreatedPost);

      const post = await PostService.createPost({
        title: 'Test Article Title',
        content: 'Article content goes here.',
        authorId,
      });

      expect(post.title).toBe('Test Article Title');
      expect(post.slug).toBe('test-article-title');
      expect(Post.create).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Test Article Title',
          author: authorId,
          isDeleted: false,
        })
      );
    });
  });

  describe('getPostBySlug', () => {
    test('should return post if exists and is not deleted', async () => {
      const mockPost = { _id: 'post123', slug: 'my-slug', isDeleted: false };
      const mockQuery = { populate: jest.fn().mockResolvedValue(mockPost) };
      jest.spyOn(Post, 'findOne').mockReturnValue(mockQuery);

      const post = await PostService.getPostBySlug('my-slug');
      expect(post).toEqual(mockPost);
      expect(Post.findOne).toHaveBeenCalledWith({ slug: 'my-slug', isDeleted: false });
    });

    test('should throw 404 if post by slug not found', async () => {
      const mockQuery = { populate: jest.fn().mockResolvedValue(null) };
      jest.spyOn(Post, 'findOne').mockReturnValue(mockQuery);

      await expect(PostService.getPostBySlug('non-existent')).rejects.toThrow(ApiError);
    });
  });

  describe('updatePost', () => {
    test('should throw 403 if user is not author and not admin', async () => {
      const mockPost = {
        _id: 'post123',
        title: 'Original Title',
        author: authorId,
        isDeleted: false,
      };
      jest.spyOn(Post, 'findById').mockResolvedValue(mockPost);

      await expect(
        PostService.updatePost('post123', { title: 'New Title' }, { _id: otherUserId, role: 'user' })
      ).rejects.toThrow(ApiError);
    });

    test('should allow owner to update post title and content', async () => {
      const mockPost = {
        _id: 'post123',
        title: 'Original Title',
        author: authorId,
        content: 'Old content',
        isDeleted: false,
        save: jest.fn().mockResolvedValue(true),
        populate: jest.fn().mockResolvedValue({
          _id: 'post123',
          title: 'Updated Title',
        }),
      };
      jest.spyOn(Post, 'findById').mockResolvedValue(mockPost);
      jest.spyOn(Post, 'findOne').mockResolvedValue(null); // for slug check

      const updated = await PostService.updatePost(
        'post123',
        { title: 'Updated Title', content: 'New content' },
        { _id: authorId, role: 'user' }
      );

      expect(mockPost.title).toBe('Updated Title');
      expect(mockPost.content).toBe('New content');
      expect(mockPost.save).toHaveBeenCalled();
    });
  });

  describe('deletePost', () => {
    test('should soft-delete post and set deletedAt', async () => {
      const mockPost = {
        _id: 'post123',
        author: authorId,
        isDeleted: false,
        deletedAt: null,
        save: jest.fn().mockResolvedValue(true),
      };
      jest.spyOn(Post, 'findById').mockResolvedValue(mockPost);

      const deleted = await PostService.deletePost('post123', { _id: authorId, role: 'user' });

      expect(deleted.isDeleted).toBe(true);
      expect(deleted.deletedAt).toBeInstanceOf(Date);
      expect(mockPost.save).toHaveBeenCalled();
    });
  });
});
