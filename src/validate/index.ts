import { NextFunction, Request, Response } from 'express';
import { ZodTypeAny } from 'zod';

export const validate =
  (schema: ZodTypeAny) => (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse({
      body: req.body,
      params: req.params,
      query: req.query,
    });
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: result.error.issues,
      });
    }
    // attach parsed data
    (req as any).validated = result.data;
    return next();
  };

// Re-export individual schemas to keep imports convenient
export * from './auth';
export * from './common';
export * from './instructor';
export * from './invite';
export * from './parent';
export * from './student';
