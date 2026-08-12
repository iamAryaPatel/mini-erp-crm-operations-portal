import { Response, NextFunction } from 'express';
import { AuthenticatedRequest, UserRole } from '../types/express.d';
import { sendError } from '../utils/api-response';

export function requireRole(...allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, 'Authentication required.', 401);
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      sendError(res, 'You do not have permission to access this resource.', 403);
      return;
    }

    next();
  };
}
