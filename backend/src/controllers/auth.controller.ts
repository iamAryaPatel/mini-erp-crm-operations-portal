import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service';
import { sendSuccess, sendError } from '../utils/api-response';

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    sendSuccess(res, result);
  } catch (error) {
    if (error instanceof Error && error.message === 'Invalid email or password') {
      sendError(res, error.message, 401);
      return;
    }
    next(error);
  }
}
