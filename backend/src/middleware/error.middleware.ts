import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/api-response';
import { env } from '../config/env';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error('Error:', err.message);

  if (env.NODE_ENV === 'development') {
    console.error(err.stack);
  }

  // Handle specific error types
  if (err.message.includes('duplicate key value')) {
    sendError(res, 'A record with this value already exists.', 409);
    return;
  }

  if (err.message.includes('violates foreign key constraint')) {
    sendError(res, 'Referenced record does not exist.', 400);
    return;
  }

  if (err.message.includes('violates check constraint')) {
    sendError(res, 'Invalid value provided.', 422);
    return;
  }

  sendError(
    res,
    env.NODE_ENV === 'production'
      ? 'An unexpected error occurred.'
      : err.message,
    500
  );
}
