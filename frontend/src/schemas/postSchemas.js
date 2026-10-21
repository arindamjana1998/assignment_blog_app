import { z } from 'zod';

export const postFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, 'Title must be at least 3 characters')
    .max(180, 'Title cannot exceed 180 characters'),
  content: z
    .string()
    .trim()
    .min(5, 'Content must be at least 5 characters'),
});

export default {
  postFormSchema,
};
