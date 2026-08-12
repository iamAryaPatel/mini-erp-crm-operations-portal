import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/express.d';
import * as dashboardService from '../services/dashboard.service';
import { sendSuccess } from '../utils/api-response';

export async function getStats(_req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const stats = await dashboardService.getDashboardStats();
    sendSuccess(res, stats);
  } catch (error) {
    next(error);
  }
}
