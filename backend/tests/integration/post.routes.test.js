import { jest, describe, test, expect, beforeEach } from '@jest/globals';
import request from 'supertest';
import app from '../../src/app.js';
import PostService from '../../src/services/post.service.js';
import TokenService from '../../src/services/token.service.js';
import User from '../../src/models/user.model.js';

describe('Post Routes Integration Tests (/api/v1/posts)', () => {
  const mockUser = {
    _id: '507f1f77bcf86cd799439011',
    name: 'Author Name',
    email: 'author@example.com',
    role: 'user',
    isActive: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/v1/posts', () => {
    test('should return paginated list of posts', async () => {
      const mockResult = {
        posts: [
          { _id: 'post1', title: 'First Post', slug: 'first-post', content: 'Content 1' },
          { _id: 'post2', title: 'Second Post', slug: 'second-post', content: 'Content 2' },
        ],
        pagination: {
          page: 1,
          limit: 10,
          totalItems: 2,
          totalPages: 1,
        },
      };

      jest.spyOn(PostService, 'getPosts').mockResolvedValue(mockResult);

      const response = await request(app).get('/api/v1/posts');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.pagination).toEqual(mockResult.pagination);
    });
  });

  describe('GET /api/v1/posts/slug/:slug', () => {
    test('should return single post by slug', async () => {
      const mockPost = {
        _id: 'post1',
        title: 'Unique Article',
        slug: 'unique-article',
        content: 'Full post content',
      };

      jest.spyOn(PostService, 'getPostBySlug').mockResolvedValue(mockPost);

      const response = await request(app).get('/api/v1/posts/slug/unique-article');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.post.slug).toBe('unique-article');
    });
  });

  describe('POST /api/v1/posts', () => {
    test('should return 401 if unauthenticated', async () => {
      const response = await request(app)
        .post('/api/v1/posts')
        .send({
          title: 'My New Post',
          content: 'My post content must be long enough.',
        });

      expect(response.status).toBe(401);
    });

    test('should return 201 when authenticated user creates post', async () => {
      jest.spyOn(TokenService, 'verifyAccessToken').mockReturnValue({ sub: mockUser._id });
      jest.spyOn(User, 'findById').mockResolvedValue(mockUser);

      const mockCreated = {
        _id: 'newpost123',
        title: 'Valid Title Here',
        slug: 'valid-title-here',
        content: 'Long and detailed valid post content.',
        author: mockUser,
      };

      jest.spyOn(PostService, 'createPost').mockResolvedValue(mockCreated);

      const response = await request(app)
        .post('/api/v1/posts')
        .set('Authorization', 'Bearer valid_mock_token')
        .send({
          title: 'Valid Title Here',
          content: 'Long and detailed valid post content.',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.post.title).toBe('Valid Title Here');
    });
  });

  describe('DELETE /api/v1/posts/:id', () => {
    test('should soft-delete post when authorized', async () => {
      jest.spyOn(TokenService, 'verifyAccessToken').mockReturnValue({ sub: mockUser._id });
      jest.spyOn(User, 'findById').mockResolvedValue(mockUser);
      jest.spyOn(PostService, 'deletePost').mockResolvedValue({ _id: 'post123', isDeleted: true });

      const response = await request(app)
        .delete('/api/v1/posts/post123')
        .set('Authorization', 'Bearer valid_mock_token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });
});
