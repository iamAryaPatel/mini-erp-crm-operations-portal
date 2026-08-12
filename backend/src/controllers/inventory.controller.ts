import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/express.d';
import * as inventoryService from '../services/inventory.service';
import { sendSuccess, sendPaginated, sendError } from '../utils/api-response';

export async function getStats(_req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const stats = await inventoryService.getInventoryStats();
    sendSuccess(res, stats);
  } catch (error) {
    next(error);
  }
}

export async function getLowStock(_req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const products = await inventoryService.getLowStockProducts();
    sendSuccess(res, products);
  } catch (error) {
    next(error);
  }
}

export async function getMovements(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { product_id, movement_type, page, limit } = req.query as {
      product_id?: string; movement_type?: string; page?: string; limit?: string;
    };
    const result = await inventoryService.getMovements({
      product_id,
      movement_type,
      page: parseInt(page || '1', 10),
      limit: parseInt(limit || '20', 10),
    });
    sendPaginated(res, result.movements, result.pagination);
  } catch (error) {
    next(error);
  }
}

export async function addMovement(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const movement = await inventoryService.addStockMovement({
      ...req.body,
      created_by: req.user!.id,
    });
    sendSuccess(res, movement, 201);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Product not found') {
        sendError(res, error.message, 404);
        return;
      }
      if (error.message === 'INSUFFICIENT_STOCK') {
        sendError(res, 'Insufficient stock for this operation.', 400);
        return;
      }
    }
    next(error);
  }
}
