import { Request } from 'express';

export interface AuthUser {
  id: string;
  role: UserRole;
}

export type UserRole = 'ADMIN' | 'SALES' | 'WAREHOUSE' | 'ACCOUNTS';

export interface AuthenticatedRequest extends Request<{ id?: string }> {
  user?: AuthUser;
}
