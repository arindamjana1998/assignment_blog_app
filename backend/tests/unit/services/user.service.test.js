import { jest, describe, test, expect, beforeEach } from '@jest/globals';
import bcrypt from 'bcryptjs';
import UserService from '../../../src/services/user.service.js';
import User from '../../../src/models/user.model.js';
import { ApiError } from '../../../src/utils/apiError.js';

describe('UserService Unit Tests', () => {
  const userId = '507f1f77bcf86cd799439011';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getProfile', () => {
    test('should throw 404 if user not found', async () => {
      jest.spyOn(User, 'findById').mockResolvedValue(null);

      await expect(UserService.getProfile(userId)).rejects.toThrow(ApiError);
    });

    test('should return user document if found', async () => {
      const mockUser = { _id: userId, name: 'Alice', email: 'alice@example.com' };
      jest.spyOn(User, 'findById').mockResolvedValue(mockUser);

      const user = await UserService.getProfile(userId);
      expect(user).toEqual(mockUser);
    });
  });

  describe('updateProfile', () => {
    test('should update name and avatar', async () => {
      const mockUser = {
        _id: userId,
        name: 'Old Name',
        avatar: null,
        save: jest.fn().mockResolvedValue(true),
        toJSON: jest.fn().mockReturnValue({ _id: userId, name: 'New Name', avatar: 'https://avatar.com/1.png' }),
      };

      const mockQuery = { select: jest.fn().mockResolvedValue(mockUser) };
      jest.spyOn(User, 'findById').mockReturnValue(mockQuery);

      const result = await UserService.updateProfile(userId, {
        name: 'New Name',
        avatar: 'https://avatar.com/1.png',
      });

      expect(mockUser.name).toBe('New Name');
      expect(mockUser.avatar).toBe('https://avatar.com/1.png');
      expect(mockUser.save).toHaveBeenCalled();
      expect(result.name).toBe('New Name');
    });

    test('should throw error if updating password with wrong current password', async () => {
      const mockUser = {
        _id: userId,
        passwordHash: 'existing_hash',
        comparePassword: jest.fn().mockResolvedValue(false),
      };

      const mockQuery = { select: jest.fn().mockResolvedValue(mockUser) };
      jest.spyOn(User, 'findById').mockReturnValue(mockQuery);

      await expect(
        UserService.updateProfile(userId, {
          currentPassword: 'WrongPassword',
          newPassword: 'NewPassword123!',
        })
      ).rejects.toThrow(/Current password is incorrect/);
    });

    test('should hash new password when current password is valid', async () => {
      const mockUser = {
        _id: userId,
        passwordHash: 'existing_hash',
        comparePassword: jest.fn().mockResolvedValue(true),
        save: jest.fn().mockResolvedValue(true),
        toJSON: jest.fn().mockReturnValue({ _id: userId, name: 'Alice' }),
      };

      const mockQuery = { select: jest.fn().mockResolvedValue(mockUser) };
      jest.spyOn(User, 'findById').mockReturnValue(mockQuery);
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('newly_hashed_password');

      await UserService.updateProfile(userId, {
        currentPassword: 'CorrectPassword123!',
        newPassword: 'BrandNewPassword123!',
      });

      expect(mockUser.passwordHash).toBe('newly_hashed_password');
      expect(mockUser.save).toHaveBeenCalled();
    });
  });
});
