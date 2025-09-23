import { z } from 'zod';

export const parentRegisterSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(6),
  }),
});

export const parentLoginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1),
  }),
});

export const linkChildSchema = z.object({
  body: z.object({
    childCode: z.string().min(1),
    relationship: z.string().optional(),
  }),
});

export const createChildSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    email: z.string().email().optional(),
  }),
});

// Schema for updating parent profile (email cannot be changed here)
export const parentUpdateSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    // additional profile fields can be added here but email is explicitly disallowed
  }),
});

export const parentChangePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(6),
  }),
});
