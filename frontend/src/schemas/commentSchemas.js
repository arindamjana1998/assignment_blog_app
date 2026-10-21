import { z } from 'zod';

export const commentFormSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, 'Comment cannot be empty')
    .max(1500, 'Comment cannot exceed 1500 characters'),
});

export default {
  commentFormSchema,
};
