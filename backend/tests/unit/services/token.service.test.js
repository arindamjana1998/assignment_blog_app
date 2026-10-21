import { jest, describe, test, expect, beforeEach } from '@jest/globals';
import jwt from 'jsonwebtoken';
import TokenService from '../../../src/services/token.service.js';
import RefreshToken from '../../../src/models/refreshToken.model.js';
import User from '../../../src/models/user.model.js';
import { ApiError } from '../../../src/utils/apiError.js';
import env from '../../../src/config/env.js';

describe('TokenService Unit Tests', () => {
  const mockUser = {
    _id: '507f1f77bcf86cd799439011',
    name: 'Alice Johnson',
    email: 'alice@example.com',
    role: 'user',
    isActive: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('hashToken should create SHA-256 hash string', () => {
    const hash = TokenService.hashToken('sample-token-123');
    expect(typeof hash).toBe('string');
    expect(hash.length).toBe(64);
  });

  test('generateAccessToken and verifyAccessToken should generate and decode valid claims', () => {
    const token = TokenService.generateAccessToken(mockUser);
    expect(typeof token).toBe('string');

    const decoded = TokenService.verifyAccessToken(token);
    expect(decoded.sub).toBe(mockUser._id);
    expect(decoded.email).toBe(mockUser.email);
    expect(decoded.role).toBe(mockUser.role);
  });

  test('verifyAccessToken should throw 401 on tampered token', () => {
    expect(() => {
      TokenService.verifyAccessToken('invalid.token.signature');
    }).toThrow(ApiError);
  });

  test('generateRefreshToken should sign token with refresh secret', () => {
    const token = TokenService.generateRefreshToken(mockUser);
    const decoded = jwt.verify(token, env.JWT.REFRESH_SECRET);
    expect(decoded.sub).toBe(mockUser._id);
    expect(decoded.jti).toBeDefined();
  });

  test('rotateRefreshToken should throw 400 if token is missing', async () => {
    await expect(TokenService.rotateRefreshToken(null)).rejects.toThrow(ApiError);
  });

  test('rotateRefreshToken should detect token reuse attack and revoke all user tokens', async () => {
    const rawToken = TokenService.generateRefreshToken(mockUser);
    const mockTokenDoc = {
      tokenHash: TokenService.hashToken(rawToken),
      user: mockUser._id,
      isRevoked: true, // Already revoked!
      save: jest.fn(),
    };

    jest.spyOn(RefreshToken, 'findOne').mockResolvedValue(mockTokenDoc);
    const updateManySpy = jest.spyOn(RefreshToken, 'updateMany').mockResolvedValue({ modifiedCount: 3 });

    await expect(TokenService.rotateRefreshToken(rawToken)).rejects.toThrow(
      /Security alert: Attempted reuse/
    );

    expect(updateManySpy).toHaveBeenCalledWith({ user: mockUser._id }, { isRevoked: true });
  });

  test('rotateRefreshToken should rotate valid token successfully', async () => {
    const rawToken = TokenService.generateRefreshToken(mockUser);
    const mockTokenDoc = {
      tokenHash: TokenService.hashToken(rawToken),
      user: mockUser._id,
      isRevoked: false,
      replacedByTokenHash: null,
      save: jest.fn().mockResolvedValue(true),
    };

    jest.spyOn(RefreshToken, 'findOne').mockResolvedValue(mockTokenDoc);
    jest.spyOn(RefreshToken, 'create').mockResolvedValue({ _id: 'newTokenDoc123' });
    jest.spyOn(User, 'findById').mockResolvedValue(mockUser);

    const result = await TokenService.rotateRefreshToken(rawToken);

    expect(result.accessToken).toBeDefined();
    expect(result.refreshToken).toBeDefined();
    expect(result.user).toEqual(mockUser);
    expect(mockTokenDoc.isRevoked).toBe(true);
    expect(mockTokenDoc.replacedByTokenHash).toBeDefined();
    expect(mockTokenDoc.save).toHaveBeenCalled();
  });

  test('revokeRefreshToken should mark token as revoked', async () => {
    const mockDoc = {
      isRevoked: false,
      save: jest.fn().mockResolvedValue(true),
    };
    jest.spyOn(RefreshToken, 'findOne').mockResolvedValue(mockDoc);

    const res = await TokenService.revokeRefreshToken('token123');
    expect(res).toBe(true);
    expect(mockDoc.isRevoked).toBe(true);
    expect(mockDoc.save).toHaveBeenCalled();
  });
});
