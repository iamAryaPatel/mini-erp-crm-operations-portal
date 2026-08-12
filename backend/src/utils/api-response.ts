import { Response } from 'express';

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function sendSuccess(res: Response, data: unknown, statusCode = 200): void {
  res.status(statusCode).json({
    success: true,
    data,
  });
}

export function sendPaginated(
  res: Response,
  data: unknown[],
  pagination: PaginationMeta,
  statusCode = 200
): void {
  res.status(statusCode).json({
    success: true,
    data,
    pagination,
  });
}

export function sendError(
  res: Response,
  message: string,
  statusCode = 400,
  details?: unknown
): void {
  const response: { success: false; message: string; details?: unknown } = {
    success: false,
    message,
  };
  if (details) {
    response.details = details;
  }
  res.status(statusCode).json(response);
}
