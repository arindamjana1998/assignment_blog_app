import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import env from '../config/env.js';
import RefreshToken from '../models/refreshToken.model.js';
import User from '../models/user.model.js';
import { ApiError } from '../utils/apiError.js';
import { MESSAGES } from '../constants/messages.js';

export class TokenService {
  /**
   * Deterministic SHA-256 hash for secure token storage
   * @param {string} token
   * @returns {string}
   */
  static hashToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  /**
   * Generate short-lived JWT Access Token
   * @param {object} user - User document
   * @returns {string}
   */
  static generateAccessToken(user) {
    const payload = {
      sub: user._id.toString(),
      role: user.role,
      email: user.email,
    };

    return jwt.sign(payload, env.JWT.ACCESS_SECRET, {
      expiresIn: env.JWT.ACCESS_EXPIRES_IN,
    });
  }

  /**
   * Generate long-lived JWT Refresh Token
   * @param {object} user - User document
   * @returns {string}
   */
  static generateRefreshToken(user) {
    const payload = {
      sub: user._id.toString(),
      jti: crypto.randomBytes(16).toString('hex'), // Unique token identifier
    };

    return jwt.sign(payload, env.JWT.REFRESH_SECRET, {
      expiresIn: env.JWT.REFRESH_EXPIRES_IN,
    });
  }

  /**
   * Save refresh token hash into database with TTL
   * @param {string|mongoose.Types.ObjectId} userId
   * @param {string} rawRefreshToken
   * @returns {Promise<RefreshToken>}
   */
  static async saveRefreshToken(userId, rawRefreshToken) {
    const decoded = jwt.decode(rawRefreshToken);
    const expiresAt = decoded && decoded.exp ? new Date(decoded.exp * 1000) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const tokenHash = this.hashToken(rawRefreshToken);

    return await RefreshToken.create({
      tokenHash,
      user: userId,
      expiresAt,
      isRevoked: false,
    });
  }

  /**
   * Verify an Access Token
   * @param {string} token
   * @returns {object} Decoded payload
   */
  static verifyAccessToken(token) {
    try {
      return jwt.verify(token, env.JWT.ACCESS_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        throw ApiError.unauthorized(MESSAGES.TOKEN_EXPIRED);
      }
      throw ApiError.unauthorized(MESSAGES.TOKEN_INVALID);
    }
  }

  /**
   * Rotate a refresh token: verifies old token, checks reuse, issues new token pair
   * @param {string} rawRefreshToken
   * @returns {Promise<{ accessToken: string, refreshToken: string, user: User }>}
   */
  static async rotateRefreshToken(rawRefreshToken) {
    if (!rawRefreshToken) {
      throw ApiError.badRequest(MESSAGES.REFRESH_TOKEN_REQUIRED);
    }

    const tokenHash = this.hashToken(rawRefreshToken);
    const tokenDoc = await RefreshToken.findOne({ tokenHash });

    if (!tokenDoc) {
      throw ApiError.unauthorized(MESSAGES.REFRESH_TOKEN_INVALID);
    }

    // Reuse detection: If token was already revoked or replaced, invalidate all tokens for user!
    if (tokenDoc.isRevoked || tokenDoc.replacedByTokenHash) {
      await RefreshToken.updateMany({ user: tokenDoc.user }, { isRevoked: true });
      throw ApiError.unauthorized(
        'Security alert: Attempted reuse of an invalidated refresh token. All active sessions have been revoked.'
      );
    }

    // Verify token cryptographic signature
    let decoded;
    try {
      decoded = jwt.verify(rawRefreshToken, env.JWT.REFRESH_SECRET);
    } catch (err) {
      tokenDoc.isRevoked = true;
      await tokenDoc.save();
      throw ApiError.unauthorized(MESSAGES.REFRESH_TOKEN_INVALID);
    }

    // Verify user exists and is active
    const user = await User.findById(tokenDoc.user);
    if (!user || !user.isActive) {
      tokenDoc.isRevoked = true;
      await tokenDoc.save();
      throw ApiError.unauthorized(MESSAGES.ACCOUNT_INACTIVE);
    }

    // Generate new token pair
    const newAccessToken = this.generateAccessToken(user);
    const newRefreshToken = this.generateRefreshToken(user);
    const newTokenHash = this.hashToken(newRefreshToken);

    // Save new refresh token
    const newDecoded = jwt.decode(newRefreshToken);
    const newExpiresAt = newDecoded && newDecoded.exp ? new Date(newDecoded.exp * 1000) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await RefreshToken.create({
      tokenHash: newTokenHash,
      user: user._id,
      expiresAt: newExpiresAt,
      isRevoked: false,
    });

    // Mark previous token as revoked and record replacement
    tokenDoc.isRevoked = true;
    tokenDoc.replacedByTokenHash = newTokenHash;
    await tokenDoc.save();

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      user,
    };
  }

  /**
   * Revoke a refresh token on logout
   * @param {string} rawRefreshToken
   * @returns {Promise<boolean>}
   */
  static async revokeRefreshToken(rawRefreshToken) {
    if (!rawRefreshToken) return false;
    const tokenHash = this.hashToken(rawRefreshToken);
    const tokenDoc = await RefreshToken.findOne({ tokenHash });
    if (tokenDoc) {
      tokenDoc.isRevoked = true;
      await tokenDoc.save();
      return true;
    }
    return false;
  }
}

export default TokenService;
