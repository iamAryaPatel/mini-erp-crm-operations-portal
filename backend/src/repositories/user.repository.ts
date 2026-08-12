import { pool } from '../config/database';

export interface UserRow {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: string;
  created_at: Date;
  updated_at: Date;
}

export async function findByEmail(email: string): Promise<UserRow | null> {
  const result = await pool.query<UserRow>(
    'SELECT id, name, email, password_hash, role, created_at, updated_at FROM users WHERE email = $1',
    [email]
  );
  return result.rows[0] || null;
}

export async function findById(id: string): Promise<Omit<UserRow, 'password_hash'> | null> {
  const result = await pool.query(
    'SELECT id, name, email, role, created_at, updated_at FROM users WHERE id = $1',
    [id]
  );
  return result.rows[0] || null;
}

export async function findAll(): Promise<Omit<UserRow, 'password_hash'>[]> {
  const result = await pool.query(
    'SELECT id, name, email, role, created_at, updated_at FROM users ORDER BY created_at DESC'
  );
  return result.rows;
}
