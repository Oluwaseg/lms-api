import { z } from 'zod';

export const instructorRegisterSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(6),
  }),
});

export const instructorLoginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1),
  }),
});

// Schema for updating instructor profile (email cannot be changed here)
export const instructorUpdateSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
  }),
});

export const instructorChangePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(6),
  }),
});
