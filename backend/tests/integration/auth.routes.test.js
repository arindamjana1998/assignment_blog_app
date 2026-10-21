import { jest, describe, test, expect, beforeEach } from '@jest/globals';
import request from 'supertest';
import app from '../../src/app.js';
import AuthService from '../../src/services/auth.service.js';
import TokenService from '../../src/services/token.service.js';
import User from '../../src/models/user.model.js';
import { ApiError } from '../../src/utils/apiError.js';

describe('Auth Routes Integration Tests (/api/v1/auth)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/v1/auth/register', () => {
    test('should reject registration if payload is missing or invalid', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'not-an-email',
          password: '123', // too short
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body).toHaveProperty('errors');
    });

    test('should register user and return 201 on valid input', async () => {
      const mockCreatedUser = {
        _id: '507f1f77bcf86cd799439011',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'user',
        isActive: true,
      };

      jest.spyOn(AuthService, 'register').mockResolvedValue(mockCreatedUser);

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'John Doe',
          email: 'john@example.com',
          password: 'Password123!',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe('john@example.com');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    test('should return 401 on invalid credentials', async () => {
      jest.spyOn(AuthService, 'login').mockImplementation(() => {
        throw ApiError.unauthorized('Invalid email or password');
      });

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'wrong@example.com',
          password: 'WrongPassword123!',
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid email or password');
    });

    test('should return 200, tokens, and HttpOnly refresh cookie on valid login', async () => {
      const mockAuthResult = {
        user: { _id: 'user123', name: 'John Doe', email: 'john@example.com', role: 'user' },
        accessToken: 'mock_jwt_access_token',
        refreshToken: 'mock_jwt_refresh_token',
      };

      jest.spyOn(AuthService, 'login').mockResolvedValue(mockAuthResult);

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'john@example.com',
          password: 'CorrectPassword123!',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.accessToken).toBe('mock_jwt_access_token');
      // Verify Set-Cookie header contains refreshToken
      const cookies = response.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies[0]).toContain('refreshToken=');
      expect(cookies[0]).toContain('HttpOnly');
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    test('should return 200 and clear refresh cookie', async () => {
      jest.spyOn(AuthService, 'logout').mockResolvedValue(true);

      const response = await request(app)
        .post('/api/v1/auth/logout')
        .set('Cookie', ['refreshToken=mock_token_to_clear']);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      const cookies = response.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies[0]).toContain('refreshToken=;');
    });

    test('should resolve authenticated user on logout when token is provided', async () => {
      jest.spyOn(AuthService, 'logout').mockResolvedValue(true);
      const mockUser = {
        _id: '507f1f77bcf86cd799439011',
        name: 'Logged Out Admin',
        email: 'admin@example.com',
        role: 'admin',
        isActive: true,
      };

      jest.spyOn(TokenService, 'verifyAccessToken').mockReturnValue({ sub: mockUser._id });
      jest.spyOn(User, 'findById').mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/api/v1/auth/logout')
        .set('Authorization', 'Bearer valid_mock_token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });


  describe('GET /api/v1/auth/me', () => {
    test('should return 401 if no Authorization header provided', async () => {
      const response = await request(app).get('/api/v1/auth/me');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    test('should return 200 with user profile when valid token provided', async () => {
      const mockUser = {
        _id: '507f1f77bcf86cd799439011',
        name: 'Authenticated User',
        email: 'auth@example.com',
        role: 'user',
        isActive: true,
      };

      jest.spyOn(TokenService, 'verifyAccessToken').mockReturnValue({ sub: mockUser._id });
      jest.spyOn(User, 'findById').mockResolvedValue(mockUser);

      const response = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', 'Bearer valid_mock_token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.name).toBe('Authenticated User');
    });
  });
});
