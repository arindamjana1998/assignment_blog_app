import { Router } from 'express';
import UserController from '../controllers/user.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { updateProfileSchema } from '../validators/user.validator.js';

const router = Router();

// Current user profile operations
router.get('/me', authenticate, asyncHandler(UserController.getMe));
router.patch('/me', authenticate, validate(updateProfileSchema, 'body'), asyncHandler(UserController.updateMe));

export default router;
