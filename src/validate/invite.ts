import { z } from 'zod';

export const validateInviteSchema = z.object({
  query: z.object({ token: z.string().min(1) }),
});

export const acceptInviteSchema = z.object({
  body: z.object({
    token: z.string().min(1),
    password: z.string().min(6),
  }),
});
