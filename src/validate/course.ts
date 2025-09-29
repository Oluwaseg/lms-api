import { z } from 'zod';

export const courseCreateSchema = z.object({
  body: z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    priceCents: z.number().min(0).optional(),
    currency: z.string().min(3).optional(),
    thumbnailUrl: z.string().url(),
    shortVideoUrl: z.string().url().optional(),
    images: z.array(z.string().url()).optional(),
  }),
});

export const courseUpdateSchema = z.object({
  body: z.object({
    title: z.string().min(1).optional(),
    description: z.string().optional(),
    priceCents: z.number().min(0).optional(),
    currency: z.string().min(3).optional(),
    status: z.enum(['draft', 'published', 'archived']).optional(),
  }),
});

export const coursePublishSchema = z.object({
  body: z
    .object({
      // publishing may accept an optional publish flag, but currently it's implicit
    })
    .optional(),
});
