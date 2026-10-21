import { z } from 'zod';

export const createCommentSchema = z.object({
  content: z
    .string({ required_error: 'Comment content is required' })
    .trim()
    .min(1, 'Comment cannot be empty')
    .max(1500, 'Comment cannot exceed 1500 characters'),
});

export const updateCommentSchema = z.object({
  content: z
    .string({ required_error: 'Comment content is required' })
    .trim()
    .min(1, 'Comment cannot be empty')
    .max(1500, 'Comment cannot exceed 1500 characters'),
});

export const queryCommentSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export default {
  createCommentSchema,
  updateCommentSchema,
  queryCommentSchema,
};
