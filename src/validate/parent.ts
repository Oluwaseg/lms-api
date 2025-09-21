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
