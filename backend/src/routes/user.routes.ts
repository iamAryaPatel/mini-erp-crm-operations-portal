import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import * as userRepo from '../repositories/user.repository';
import { sendSuccess } from '../utils/api-response';
import { AuthenticatedRequest } from '../types/express.d';
import { Response, NextFunction } from 'express';

const router = Router();

router.use(authenticate);

// Get current user profile
router.get('/me', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const user = await userRepo.findById(req.user!.id);
    sendSuccess(res, user);
  } catch (error) {
    next(error);
  }
});

// List all users (admin only)
router.get('/', requireRole('ADMIN'), async (_req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const users = await userRepo.findAll();
    sendSuccess(res, users);
  } catch (error) {
    next(error);
  }
});

export default router;
