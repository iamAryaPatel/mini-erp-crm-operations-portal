import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/express.d';
import * as customerService from '../services/customer.service';
import { sendSuccess, sendPaginated, sendError } from '../utils/api-response';

export async function getAll(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { search, status, customer_type, page, limit } = req.query as {
      search?: string; status?: string; customer_type?: string; page?: string; limit?: string;
    };
    const result = await customerService.getAllCustomers({
      search,
      status,
      customer_type,
      page: parseInt(page || '1', 10),
      limit: parseInt(limit || '10', 10),
    });
    sendPaginated(res, result.customers, result.pagination);
  } catch (error) {
    next(error);
  }
}

export async function getById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const customer = await customerService.getCustomerById(req.params.id!);
    sendSuccess(res, customer);
  } catch (error) {
    if (error instanceof Error && error.message === 'Customer not found') {
      sendError(res, error.message, 404);
      return;
    }
    next(error);
  }
}

export async function create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const customer = await customerService.createCustomer({
      ...req.body,
      created_by: req.user?.id,
    });
    sendSuccess(res, customer, 201);
  } catch (error) {
    next(error);
  }
}

export async function update(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const customer = await customerService.updateCustomer(req.params.id!, req.body);
    sendSuccess(res, customer);
  } catch (error) {
    if (error instanceof Error && error.message === 'Customer not found') {
      sendError(res, error.message, 404);
      return;
    }
    next(error);
  }
}

export async function remove(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    await customerService.deleteCustomer(req.params.id!);
    sendSuccess(res, { message: 'Customer deleted successfully' });
  } catch (error) {
    if (error instanceof Error && error.message === 'Customer not found') {
      sendError(res, error.message, 404);
      return;
    }
    next(error);
  }
}

export async function getFollowUps(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const followUps = await customerService.getFollowUps(req.params.id!);
    sendSuccess(res, followUps);
  } catch (error) {
    if (error instanceof Error && error.message === 'Customer not found') {
      sendError(res, error.message, 404);
      return;
    }
    next(error);
  }
}

export async function addFollowUp(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const followUp = await customerService.addFollowUp(
      req.params.id!,
      req.body.note,
      req.body.follow_up_date || null,
      req.user!.id
    );
    sendSuccess(res, followUp, 201);
  } catch (error) {
    if (error instanceof Error && error.message === 'Customer not found') {
      sendError(res, error.message, 404);
      return;
    }
    next(error);
  }
}
