import { z } from 'zod';

export const createPostSchema = z.object({
  title: z
    .string({ required_error: 'Title is required' })
    .trim()
    .min(3, 'Title must be at least 3 characters')
    .max(180, 'Title cannot exceed 180 characters'),
  content: z
    .string({ required_error: 'Content is required' })
    .trim()
    .min(5, 'Content must be at least 5 characters'),
});

export const updatePostSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, 'Title must be at least 3 characters')
    .max(180, 'Title cannot exceed 180 characters')
    .optional(),
  content: z
    .string()
    .trim()
    .min(5, 'Content must be at least 5 characters')
    .optional(),
});

export const queryPostSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().trim().optional(),
  author: z.string().trim().optional(),
  sort: z.enum(['createdAt', 'updatedAt', 'title']).default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
});

export default {
  createPostSchema,
  updatePostSchema,
  queryPostSchema,
};
