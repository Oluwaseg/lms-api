import { z } from 'zod';

export const studentRegisterSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(6),
  }),
});

export const studentLoginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1),
  }),
});

// Schema for updating student profile (email cannot be changed here)
export const studentUpdateSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
  }),
});

export const studentChangePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(6),
  }),
});
