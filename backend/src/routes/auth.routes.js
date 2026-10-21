import { Router } from 'express';
import AuthController from '../controllers/auth.controller.js';
import { authenticate, optionalAuthenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { authLimiter } from '../middleware/rateLimiter.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
} from '../validators/auth.validator.js';

const router = Router();

// 1. User Registration (Public, Rate-Limited, Validated)
router.post(
  '/register',
  authLimiter,
  validate(registerSchema, 'body'),
  asyncHandler(AuthController.register)
);

// 2. User Login (Public, Rate-Limited, Validated)
router.post(
  '/login',
  authLimiter,
  validate(loginSchema, 'body'),
  asyncHandler(AuthController.login)
);

// 3. Refresh Access Token (Public, Supports Cookie or Body)
router.post(
  '/refresh',
  validate(refreshTokenSchema, 'body'),
  asyncHandler(AuthController.refresh)
);

// 4. Logout (Public/Authenticated, Clears Cookie & Revokes Token)
router.post('/logout', optionalAuthenticate, asyncHandler(AuthController.logout));


// 5. Current Authenticated User (Protected)
router.get('/me', authenticate, asyncHandler(AuthController.getMe));

// 6. Google OAuth 2.0 Flow
router.get('/google', AuthController.googleAuth);
router.get('/google/callback', AuthController.googleCallback);

// 7. Facebook OAuth 2.0 Flow
router.get('/facebook', AuthController.facebookAuth);
router.get('/facebook/callback', AuthController.facebookCallback);

export default router;
