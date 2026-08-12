import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/express.d';
import * as challanService from '../services/challan.service';
import { sendSuccess, sendPaginated, sendError } from '../utils/api-response';

export async function getAll(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { search, status, page, limit } = req.query as {
      search?: string; status?: string; page?: string; limit?: string;
    };
    const result = await challanService.getAllChallans({
      search,
      status,
      page: parseInt(page || '1', 10),
      limit: parseInt(limit || '10', 10),
    });
    sendPaginated(res, result.challans, result.pagination);
  } catch (error) {
    next(error);
  }
}

export async function getById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const challan = await challanService.getChallanById(req.params.id!);
    sendSuccess(res, challan);
  } catch (error) {
    if (error instanceof Error && error.message === 'Challan not found') {
      sendError(res, error.message, 404);
      return;
    }
    next(error);
  }
}

export async function create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const challan = await challanService.createChallan({
      customer_id: req.body.customer_id,
      items: req.body.items,
      created_by: req.user!.id,
    });
    sendSuccess(res, challan, 201);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.startsWith('PRODUCT_NOT_FOUND:')) {
        sendError(res, 'One or more products not found.', 404);
        return;
      }
    }
    next(error);
  }
}

export async function confirm(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const challan = await challanService.confirmChallan(req.params.id!, req.user!.id);
    sendSuccess(res, challan);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Challan not found') {
        sendError(res, error.message, 404);
        return;
      }

      if (error.message.startsWith('INVALID_STATUS:')) {
        sendError(res, error.message.replace('INVALID_STATUS:', ''), 400);
        return;
      }

      // Handle insufficient stock with detailed response
      try {
        const parsed = JSON.parse(error.message);
        if (parsed.code === 'INSUFFICIENT_STOCK') {
          sendError(res, parsed.message, 400, parsed.details);
          return;
        }
      } catch {
        // Not a JSON error, continue
      }
    }
    next(error);
  }
}

export async function cancel(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const challan = await challanService.cancelChallan(req.params.id!, req.user!.id);
    sendSuccess(res, challan);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Challan not found') {
        sendError(res, error.message, 404);
        return;
      }
      if (error.message.startsWith('INVALID_STATUS:')) {
        sendError(res, error.message.replace('INVALID_STATUS:', ''), 400);
        return;
      }
    }
    next(error);
  }
}
