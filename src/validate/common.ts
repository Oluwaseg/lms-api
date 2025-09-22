import { z } from 'zod';

export const emailBodySchema = z.object({
  body: z.object({
    email: z.string().email(),
  }),
});

export default {};
