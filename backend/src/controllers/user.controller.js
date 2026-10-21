import UserService from '../services/user.service.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { MESSAGES } from '../constants/messages.js';

export class UserController {
  /**
   * Get current user profile
   * GET /api/v1/users/me
   */
  static async getMe(req, res) {
    const user = await UserService.getProfile(req.user._id);
    return ApiResponse.success(res, MESSAGES.PROFILE_RETRIEVED, { user });
  }

  /**
   * Update current user profile
   * PATCH /api/v1/users/me
   */
  static async updateMe(req, res) {
    const updatedUser = await UserService.updateProfile(req.user._id, req.body);
    return ApiResponse.success(res, MESSAGES.PROFILE_UPDATED, { user: updatedUser });
  }
}

export default UserController;
