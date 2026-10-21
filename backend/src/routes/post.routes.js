import { Router } from 'express';
import PostController from '../controllers/post.controller.js';
import CommentController from '../controllers/comment.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  createPostSchema,
  updatePostSchema,
  queryPostSchema,
} from '../validators/post.validator.js';
import {
  createCommentSchema,
  queryCommentSchema,
} from '../validators/comment.validator.js';

const router = Router();

// Public Post Retrieval
router.get('/', validate(queryPostSchema, 'query'), asyncHandler(PostController.getPosts));
router.get('/slug/:slug', asyncHandler(PostController.getPostBySlug));
router.get('/:id', asyncHandler(PostController.getPostById));

// Authenticated Post Mutations
router.post(
  '/',
  authenticate,
  validate(createPostSchema, 'body'),
  asyncHandler(PostController.createPost)
);

router.patch(
  '/:id',
  authenticate,
  validate(updatePostSchema, 'body'),
  asyncHandler(PostController.updatePost)
);

router.delete('/:id', authenticate, asyncHandler(PostController.deletePost));

// Nested Post Comments Endpoints
router.get(
  '/:postId/comments',
  validate(queryCommentSchema, 'query'),
  asyncHandler(CommentController.getCommentsByPost)
);

router.post(
  '/:postId/comments',
  authenticate,
  validate(createCommentSchema, 'body'),
  asyncHandler(CommentController.createComment)
);

export default router;
