import { jest, describe, test, expect, beforeEach } from '@jest/globals';
import bcrypt from 'bcryptjs';
import AuthService from '../../../src/services/auth.service.js';
import User from '../../../src/models/user.model.js';
import TokenService from '../../../src/services/token.service.js';
import { ApiError } from '../../../src/utils/apiError.js';

describe('AuthService Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    test('should throw conflict error if email already exists', async () => {
      jest.spyOn(User, 'findOne').mockResolvedValue({ _id: 'existing123', email: 'test@example.com' });

      await expect(
        AuthService.register({
          name: 'Existing User',
          email: 'test@example.com',
          password: 'Password123!',
        })
      ).rejects.toThrow(ApiError);
    });

    test('should hash password and create user with default role user', async () => {
      jest.spyOn(User, 'findOne').mockResolvedValue(null);
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashed_secret_password');
      jest.spyOn(User, 'create').mockImplementation(async (data) => ({
        _id: 'newuser123',
        ...data,
      }));

      const user = await AuthService.register({
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: 'SecurePassword123!',
      });

      expect(user.role).toBe('user');
      expect(user.passwordHash).toBe('hashed_secret_password');
      expect(user.email).toBe('jane@example.com');
      expect(User.create).toHaveBeenCalledWith(
        expect.objectContaining({
          role: 'user',
          passwordHash: 'hashed_secret_password',
        })
      );
    });
  });

  describe('login', () => {
    test('should throw 401 if user is not found', async () => {
      const mockQuery = { select: jest.fn().mockResolvedValue(null) };
      jest.spyOn(User, 'findOne').mockReturnValue(mockQuery);

      await expect(
        AuthService.login({ email: 'unknown@example.com', password: 'Password123!' })
      ).rejects.toThrow(ApiError);
    });

    test('should throw 403 if user account is deactivated', async () => {
      const mockUser = {
        _id: 'user123',
        email: 'inactive@example.com',
        isActive: false,
      };
      const mockQuery = { select: jest.fn().mockResolvedValue(mockUser) };
      jest.spyOn(User, 'findOne').mockReturnValue(mockQuery);

      await expect(
        AuthService.login({ email: 'inactive@example.com', password: 'Password123!' })
      ).rejects.toThrow(ApiError);
    });

    test('should throw 401 if password does not match', async () => {
      const mockUser = {
        _id: 'user123',
        email: 'active@example.com',
        isActive: true,
        passwordHash: 'some_hash',
        comparePassword: jest.fn().mockResolvedValue(false),
      };
      const mockQuery = { select: jest.fn().mockResolvedValue(mockUser) };
      jest.spyOn(User, 'findOne').mockReturnValue(mockQuery);

      await expect(
        AuthService.login({ email: 'active@example.com', password: 'WrongPassword' })
      ).rejects.toThrow(ApiError);
    });

    test('should generate tokens and return user data on successful credentials', async () => {
      const mockUser = {
        _id: 'user123',
        name: 'Jane Doe',
        email: 'active@example.com',
        isActive: true,
        passwordHash: 'valid_hash',
        comparePassword: jest.fn().mockResolvedValue(true),
        toJSON: jest.fn().mockReturnValue({ _id: 'user123', name: 'Jane Doe', email: 'active@example.com' }),
      };
      const mockQuery = { select: jest.fn().mockResolvedValue(mockUser) };
      jest.spyOn(User, 'findOne').mockReturnValue(mockQuery);
      jest.spyOn(TokenService, 'generateAccessToken').mockReturnValue('mock_access_token');
      jest.spyOn(TokenService, 'generateRefreshToken').mockReturnValue('mock_refresh_token');
      jest.spyOn(TokenService, 'saveRefreshToken').mockResolvedValue(true);

      const result = await AuthService.login({
        email: 'active@example.com',
        password: 'ValidPassword123!',
      });

      expect(result.accessToken).toBe('mock_access_token');
      expect(result.refreshToken).toBe('mock_refresh_token');
      expect(result.user.email).toBe('active@example.com');
      expect(TokenService.saveRefreshToken).toHaveBeenCalledWith('user123', 'mock_refresh_token');
    });
  });

  describe('logout', () => {
    test('should revoke token if token provided', async () => {
      jest.spyOn(TokenService, 'revokeRefreshToken').mockResolvedValue(true);

      const res = await AuthService.logout('raw_token_xyz');
      expect(res).toBe(true);
      expect(TokenService.revokeRefreshToken).toHaveBeenCalledWith('raw_token_xyz');
    });
  });
});
