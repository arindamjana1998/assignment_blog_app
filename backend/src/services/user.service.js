import bcrypt from 'bcryptjs';
import User from '../models/user.model.js';
import env from '../config/env.js';
import { ApiError } from '../utils/apiError.js';
import { MESSAGES } from '../constants/messages.js';

export class UserService {
  /**
   * Get current user profile
   * @param {string} userId
   * @returns {Promise<User>}
   */
  static async getProfile(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw ApiError.notFound(MESSAGES.USER_NOT_FOUND);
    }
    return user;
  }

  /**
   * Update profile (name, avatar, and optional password change)
   * @param {string} userId
   * @param {object} updateData
   * @returns {Promise<User>}
   */
  static async updateProfile(userId, updateData) {
    const user = await User.findById(userId).select('+passwordHash');
    if (!user) {
      throw ApiError.notFound(MESSAGES.USER_NOT_FOUND);
    }

    if (updateData.name) {
      user.name = updateData.name.trim();
    }

    if (updateData.avatar !== undefined) {
      user.avatar = updateData.avatar || null;
    }

    // Handle password change if requested
    if (updateData.newPassword) {
      if (!user.passwordHash) {
        throw ApiError.badRequest('Cannot change password on accounts created via OAuth without a local password.');
      }

      const isCurrentValid = await user.comparePassword(updateData.currentPassword);
      if (!isCurrentValid) {
        throw ApiError.badRequest('Current password is incorrect');
      }

      user.passwordHash = await bcrypt.hash(updateData.newPassword, env.SECURITY.BCRYPT_SALT_ROUNDS);
    }

    await user.save();
    return user.toJSON();
  }
}

export default UserService;
