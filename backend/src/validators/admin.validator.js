import { z } from 'zod';
import { ROLE_LIST } from '../constants/roles.js';

export const adminUpdateUserSchema = z.object({
  role: z.enum(ROLE_LIST).optional(),
  isActive: z.boolean().optional(),
}).refine((data) => data.role !== undefined || data.isActive !== undefined, {
  message: 'Must provide either role or isActive to update user',
});

export const adminQueryUsersSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().trim().optional(),
  role: z.enum(ROLE_LIST).optional(),
  isActive: z
    .enum(['true', 'false'])
    .transform((val) => val === 'true')
    .optional(),
});

export const adminQueryPostsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().trim().optional(),
  author: z.string().trim().optional(),
  isDeleted: z
    .enum(['true', 'false'])
    .transform((val) => val === 'true')
    .optional(),
});

export const adminUpdatePostSchema = z.object({
  title: z.string().trim().min(3).max(180).optional(),
  content: z.string().trim().min(5).optional(),
  isDeleted: z.boolean().optional(),
});

export const adminQueryCommentsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  post: z.string().trim().optional(),
  author: z.string().trim().optional(),
});

export default {
  adminUpdateUserSchema,
  adminQueryUsersSchema,
  adminQueryPostsSchema,
  adminUpdatePostSchema,
  adminQueryCommentsSchema,
};
