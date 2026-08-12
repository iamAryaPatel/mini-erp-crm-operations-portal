import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AuthenticatedRequest, AuthUser } from '../types/express.d';
import { sendError } from '../utils/api-response';

export function authenticate(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    sendError(res, 'Authentication required. Please provide a valid token.', 401);
    return;
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    sendError(res, 'Authentication required. Please provide a valid token.', 401);
    return;
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as AuthUser;
    req.user = {
      id: decoded.id,
      role: decoded.role,
    };
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      sendError(res, 'Token has expired. Please log in again.', 401);
      return;
    }
    sendError(res, 'Invalid authentication token.', 401);
  }
}
