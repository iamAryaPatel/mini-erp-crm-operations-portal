import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/express.d';
import * as productService from '../services/product.service';
import { sendSuccess, sendPaginated, sendError } from '../utils/api-response';

export async function getAll(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { search, category, low_stock, page, limit } = req.query as {
      search?: string; category?: string; low_stock?: string; page?: string; limit?: string;
    };
    const result = await productService.getAllProducts({
      search,
      category,
      low_stock: low_stock === 'true',
      page: parseInt(page || '1', 10),
      limit: parseInt(limit || '10', 10),
    });
    sendPaginated(res, result.products, result.pagination);
  } catch (error) {
    next(error);
  }
}

export async function getById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const product = await productService.getProductById(req.params.id!);
    sendSuccess(res, product);
  } catch (error) {
    if (error instanceof Error && error.message === 'Product not found') {
      sendError(res, error.message, 404);
      return;
    }
    next(error);
  }
}

export async function create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const product = await productService.createProduct(req.body);
    sendSuccess(res, product, 201);
  } catch (error) {
    if (error instanceof Error && error.message === 'DUPLICATE_SKU') {
      sendError(res, 'A product with this SKU already exists.', 409);
      return;
    }
    next(error);
  }
}

export async function update(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const product = await productService.updateProduct(req.params.id!, req.body);
    sendSuccess(res, product);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Product not found') {
        sendError(res, error.message, 404);
        return;
      }
      if (error.message === 'DUPLICATE_SKU') {
        sendError(res, 'A product with this SKU already exists.', 409);
        return;
      }
    }
    next(error);
  }
}

export async function getCategories(_req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const categories = await productService.getCategories();
    sendSuccess(res, categories);
  } catch (error) {
    next(error);
  }
}
