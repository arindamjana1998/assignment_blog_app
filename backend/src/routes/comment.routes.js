import { Router } from 'express';
import CommentController from '../controllers/comment.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { updateCommentSchema } from '../validators/comment.validator.js';

const router = Router();

// Comment Mutation Operations
router.patch(
  '/:id',
  authenticate,
  validate(updateCommentSchema, 'body'),
  asyncHandler(CommentController.updateComment)
);

router.delete('/:id', authenticate, asyncHandler(CommentController.deleteComment));

export default router;
