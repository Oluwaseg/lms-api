import { NextFunction, Request, Response } from 'express';
import { AppError } from './app.error';
import { ResponseHandler } from './response.handler';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', error);

  if (error instanceof AppError) {
    return res
      .status(error.statusCode)
      .json(
        ResponseHandler.error(
          error.message,
          error.statusCode,
          error.field
            ? [{ field: error.field, message: error.message }]
            : undefined
        )
      );
  }

  // TypeORM errors
  if (error.name === 'QueryFailedError') {
    return res
      .status(400)
      .json(
        ResponseHandler.error('Database operation failed', 400, [
          { message: 'Invalid operation' },
        ])
      );
  }

  // Default error
  return res
    .status(500)
    .json(
      ResponseHandler.error('Internal server error', 500, [
        { message: 'Something went wrong' },
      ])
    );
};
