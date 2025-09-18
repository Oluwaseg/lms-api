import { NextFunction, Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { ResponseHandler } from './response.handler';

export const validateRequest = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const validationErrors = errors.array().map((error) => {
      if (error.type === 'field') {
        return {
          field: error.path,
          message: error.msg,
        };
      }

      return {
        field: 'unknown',
        message: error.msg,
      };
    });

    return res
      .status(400)
      .json(ResponseHandler.error('Validation failed', 400, validationErrors));
  }
  next();
};
