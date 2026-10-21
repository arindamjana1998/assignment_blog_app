import bcrypt from 'bcryptjs';
import User from '../models/user.model.js';
import TokenService from './token.service.js';
import env from '../config/env.js';
import { ApiError } from '../utils/apiError.js';
import { MESSAGES } from '../constants/messages.js';
import { ROLES } from '../constants/roles.js';

export class AuthService {
  /**
   * Register a new user with email and password
   * Explicitly ensures the role cannot be elevated to admin during public registration.
   *
   * @param {object} input - { name, email, password }
   * @returns {Promise<User>}
   */
  static async register({ name, email, password }) {
    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      throw ApiError.conflict(MESSAGES.USER_ALREADY_EXISTS);
    }

    // Hash password with configured salt rounds
    const passwordHash = await bcrypt.hash(password, env.SECURITY.BCRYPT_SALT_ROUNDS);

    // Create user with default role 'user'
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      role: ROLES.USER, // Enforce default user role; prevent privilege escalation
      oauthProvider: {
        provider: 'local',
        providerId: null,
      },
    });

    return user;
  }

  /**
   * Authenticate user with email and password
   *
   * @param {object} input - { email, password }
   * @returns {Promise<{ user: User, accessToken: string, refreshToken: string }>}
   */
  static async login({ email, password }) {
    const normalizedEmail = email.toLowerCase().trim();

    // Explicitly select passwordHash which is hidden by default
    const user = await User.findOne({ email: normalizedEmail }).select('+passwordHash');

    if (!user) {
      throw ApiError.unauthorized(MESSAGES.INVALID_CREDENTIALS);
    }

    if (!user.isActive) {
      throw ApiError.forbidden(MESSAGES.ACCOUNT_INACTIVE);
    }

    // Check if user registered via OAuth and has no password
    if (!user.passwordHash) {
      throw ApiError.badRequest(
        `This account is registered via ${user.oauthProvider?.provider || 'OAuth'}. Please log in using that provider.`
      );
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw ApiError.unauthorized(MESSAGES.INVALID_CREDENTIALS);
    }

    // Issue tokens
    const accessToken = TokenService.generateAccessToken(user);
    const refreshToken = TokenService.generateRefreshToken(user);

    // Persist refresh token hash
    await TokenService.saveRefreshToken(user._id, refreshToken);

    return {
      user: user.toJSON(),
      accessToken,
      refreshToken,
    };
  }

  /**
   * Refresh access token via token rotation
   *
   * @param {string} rawRefreshToken
   * @returns {Promise<{ user: User, accessToken: string, refreshToken: string }>}
   */
  static async refresh(rawRefreshToken) {
    return await TokenService.rotateRefreshToken(rawRefreshToken);
  }

  /**
   * Log out user by revoking the refresh token
   *
   * @param {string} rawRefreshToken
   * @returns {Promise<boolean>}
   */
  static async logout(rawRefreshToken) {
    if (!rawRefreshToken) {
      return true;
    }
    return await TokenService.revokeRefreshToken(rawRefreshToken);
  }

  /**
   * Find or create user for OAuth (Google / Facebook)
   *
   * @param {object} profile - { provider, providerId, email, name, avatar }
   * @returns {Promise<User>}
   */
  static async findOrCreateOAuthUser({ provider, providerId, email, name, avatar }) {
    // 1. Search by provider and providerId
    let user = await User.findOne({
      'oauthProvider.provider': provider,
      'oauthProvider.providerId': providerId,
    });

    if (user) {
      if (!user.isActive) {
        throw ApiError.forbidden(MESSAGES.ACCOUNT_INACTIVE);
      }
      return user;
    }

    // 2. Search by email if email was provided by OAuth
    if (email) {
      const normalizedEmail = email.toLowerCase().trim();
      user = await User.findOne({ email: normalizedEmail });

      if (user) {
        if (!user.isActive) {
          throw ApiError.forbidden(MESSAGES.ACCOUNT_INACTIVE);
        }
        // Link OAuth details to existing user
        user.oauthProvider = {
          provider,
          providerId,
        };
        if (!user.avatar && avatar) {
          user.avatar = avatar;
        }
        await user.save();
        return user;
      }
    }

    // 3. Create new user via OAuth
    const fallbackEmail = email ? email.toLowerCase().trim() : `${provider}_${providerId}@oauth.local`;
    user = await User.create({
      name: name || `${provider} User`,
      email: fallbackEmail,
      role: ROLES.USER,
      avatar: avatar || null,
      isActive: true,
      oauthProvider: {
        provider,
        providerId,
      },
    });

    return user;
  }
}

export default AuthService;
