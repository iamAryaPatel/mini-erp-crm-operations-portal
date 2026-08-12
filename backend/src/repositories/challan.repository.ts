import { pool } from '../config/database';
import { PoolClient } from 'pg';

export interface ChallanRow {
  id: string;
  challan_number: string;
  customer_id: string;
  total_quantity: number;
  status: string;
  created_by: string | null;
  created_at: Date;
  updated_at: Date;
  customer_name?: string;
  business_name?: string;
  creator_name?: string;
}

export interface ChallanItemRow {
  id: string;
  challan_id: string;
  product_id: string;
  product_name_snapshot: string;
  sku_snapshot: string;
  unit_price_snapshot: number;
  quantity: number;
  created_at: Date;
}

interface FindAllParams {
  search?: string;
  status?: string;
  page: number;
  limit: number;
}

export async function findAll(params: FindAllParams): Promise<{ rows: ChallanRow[]; total: number }> {
  const { search, status, page, limit } = params;
  const conditions: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;

  if (search) {
    conditions.push(
      `(c.challan_number ILIKE $${paramIndex} OR cust.customer_name ILIKE $${paramIndex} OR cust.business_name ILIKE $${paramIndex})`
    );
    values.push(`%${search}%`);
    paramIndex++;
  }

  if (status) {
    conditions.push(`c.status = $${paramIndex}`);
    values.push(status);
    paramIndex++;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const countResult = await pool.query(
    `SELECT COUNT(*) FROM challans c LEFT JOIN customers cust ON c.customer_id = cust.id ${whereClause}`,
    values
  );
  const total = parseInt(countResult.rows[0].count, 10);

  const offset = (page - 1) * limit;
  const dataResult = await pool.query<ChallanRow>(
    `SELECT c.*, cust.customer_name, cust.business_name, u.name as creator_name
     FROM challans c
     LEFT JOIN customers cust ON c.customer_id = cust.id
     LEFT JOIN users u ON c.created_by = u.id
     ${whereClause}
     ORDER BY c.created_at DESC
     LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
    [...values, limit, offset]
  );

  return { rows: dataResult.rows, total };
}

export async function findById(id: string): Promise<ChallanRow | null> {
  const result = await pool.query<ChallanRow>(
    `SELECT c.*, cust.customer_name, cust.business_name, u.name as creator_name
     FROM challans c
     LEFT JOIN customers cust ON c.customer_id = cust.id
     LEFT JOIN users u ON c.created_by = u.id
     WHERE c.id = $1`,
    [id]
  );
  return result.rows[0] || null;
}

export async function findItemsByChallanId(challanId: string): Promise<ChallanItemRow[]> {
  const result = await pool.query<ChallanItemRow>(
    'SELECT * FROM challan_items WHERE challan_id = $1 ORDER BY created_at',
    [challanId]
  );
  return result.rows;
}

export async function generateChallanNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const result = await pool.query(
    `SELECT challan_number FROM challans
     WHERE challan_number LIKE $1
     ORDER BY challan_number DESC LIMIT 1`,
    [`CH-${year}-%`]
  );

  let nextNum = 1;
  if (result.rows.length > 0) {
    const lastNumber = result.rows[0].challan_number;
    const parts = lastNumber.split('-');
    nextNum = parseInt(parts[2], 10) + 1;
  }

  return `CH-${year}-${String(nextNum).padStart(4, '0')}`;
}

export async function createWithClient(
  client: PoolClient,
  data: {
    challan_number: string;
    customer_id: string;
    total_quantity: number;
    status: string;
    created_by: string;
  }
): Promise<ChallanRow> {
  const result = await client.query<ChallanRow>(
    `INSERT INTO challans (challan_number, customer_id, total_quantity, status, created_by)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [data.challan_number, data.customer_id, data.total_quantity, data.status, data.created_by]
  );
  return result.rows[0];
}

export async function createItemWithClient(
  client: PoolClient,
  data: {
    challan_id: string;
    product_id: string;
    product_name_snapshot: string;
    sku_snapshot: string;
    unit_price_snapshot: number;
    quantity: number;
  }
): Promise<ChallanItemRow> {
  const result = await client.query<ChallanItemRow>(
    `INSERT INTO challan_items (challan_id, product_id, product_name_snapshot, sku_snapshot, unit_price_snapshot, quantity)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [
      data.challan_id,
      data.product_id,
      data.product_name_snapshot,
      data.sku_snapshot,
      data.unit_price_snapshot,
      data.quantity,
    ]
  );
  return result.rows[0];
}

export async function updateStatusWithClient(
  client: PoolClient,
  id: string,
  status: string
): Promise<ChallanRow> {
  const result = await client.query<ChallanRow>(
    `UPDATE challans SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
    [status, id]
  );
  return result.rows[0];
}
