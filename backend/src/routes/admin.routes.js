import { Router } from 'express';
import AdminController from '../controllers/admin.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/rbac.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  adminUpdateUserSchema,
  adminQueryUsersSchema,
  adminQueryPostsSchema,
  adminUpdatePostSchema,
  adminQueryCommentsSchema,
} from '../validators/admin.validator.js';
import { updateCommentSchema } from '../validators/comment.validator.js';

const router = Router();

// Protect all admin endpoints with authentication and admin role requirement
router.use(authenticate, requireAdmin);

// 1. Dashboard Metrics
router.get('/dashboard', asyncHandler(AdminController.getDashboard));

// 2. User Management
router.get('/users', validate(adminQueryUsersSchema, 'query'), asyncHandler(AdminController.getUsers));
router.get('/users/:id', asyncHandler(AdminController.getUserById));
router.patch('/users/:id', validate(adminUpdateUserSchema, 'body'), asyncHandler(AdminController.updateUser));
router.delete('/users/:id', asyncHandler(AdminController.deleteUser));

// 3. Post Management
router.get('/posts', validate(adminQueryPostsSchema, 'query'), asyncHandler(AdminController.getPosts));
router.patch('/posts/:id', validate(adminUpdatePostSchema, 'body'), asyncHandler(AdminController.updatePost));
router.delete('/posts/:id', asyncHandler(AdminController.deletePost));

// 4. Comment Management
router.get('/comments', validate(adminQueryCommentsSchema, 'query'), asyncHandler(AdminController.getComments));
router.patch('/comments/:id', validate(updateCommentSchema, 'body'), asyncHandler(AdminController.updateComment));
router.delete('/comments/:id', asyncHandler(AdminController.deleteComment));

// 5. User Activity Logs
router.get('/activity-logs', asyncHandler(AdminController.getActivityLogs));

export default router;
