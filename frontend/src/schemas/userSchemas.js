import { z } from 'zod';

export const updateProfileSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, 'Name must be at least 2 characters')
      .max(60, 'Name cannot exceed 60 characters')
      .optional()
      .or(z.literal('')),
    avatar: z
      .string()
      .trim()
      .url('Please enter a valid URL for avatar image')
      .optional()
      .or(z.literal('')),
    currentPassword: z.string().optional().or(z.literal('')),
    newPassword: z
      .string()
      .min(6, 'New password must be at least 6 characters')
      .optional()
      .or(z.literal('')),
  })
  .refine(
    (data) => {
      if (data.newPassword && !data.currentPassword) {
        return false;
      }
      return true;
    },
    {
      message: 'Current password is required to set a new password',
      path: ['currentPassword'],
    }
  );

export default {
  updateProfileSchema,
};
