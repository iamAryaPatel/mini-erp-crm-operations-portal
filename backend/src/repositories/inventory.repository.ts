import { pool } from '../config/database';
import { PoolClient } from 'pg';

export interface StockMovementRow {
  id: string;
  product_id: string;
  quantity: number;
  movement_type: string;
  reason: string;
  created_by: string | null;
  created_at: Date;
  product_name?: string;
  sku?: string;
  creator_name?: string;
}

interface FindAllParams {
  product_id?: string;
  movement_type?: string;
  page: number;
  limit: number;
}

export async function findAll(params: FindAllParams): Promise<{ rows: StockMovementRow[]; total: number }> {
  const { product_id, movement_type, page, limit } = params;
  const conditions: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;

  if (product_id) {
    conditions.push(`sm.product_id = $${paramIndex}`);
    values.push(product_id);
    paramIndex++;
  }

  if (movement_type) {
    conditions.push(`sm.movement_type = $${paramIndex}`);
    values.push(movement_type);
    paramIndex++;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const countResult = await pool.query(
    `SELECT COUNT(*) FROM stock_movements sm ${whereClause}`,
    values
  );
  const total = parseInt(countResult.rows[0].count, 10);

  const offset = (page - 1) * limit;
  const dataResult = await pool.query<StockMovementRow>(
    `SELECT sm.*, p.product_name, p.sku, u.name as creator_name
     FROM stock_movements sm
     LEFT JOIN products p ON sm.product_id = p.id
     LEFT JOIN users u ON sm.created_by = u.id
     ${whereClause}
     ORDER BY sm.created_at DESC
     LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
    [...values, limit, offset]
  );

  return { rows: dataResult.rows, total };
}

export async function createWithClient(
  client: PoolClient,
  data: {
    product_id: string;
    quantity: number;
    movement_type: string;
    reason: string;
    created_by?: string;
  }
): Promise<StockMovementRow> {
  const result = await client.query<StockMovementRow>(
    `INSERT INTO stock_movements (product_id, quantity, movement_type, reason, created_by)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [data.product_id, data.quantity, data.movement_type, data.reason, data.created_by || null]
  );
  return result.rows[0];
}

export async function create(data: {
  product_id: string;
  quantity: number;
  movement_type: string;
  reason: string;
  created_by?: string;
}): Promise<StockMovementRow> {
  const result = await pool.query<StockMovementRow>(
    `INSERT INTO stock_movements (product_id, quantity, movement_type, reason, created_by)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [data.product_id, data.quantity, data.movement_type, data.reason, data.created_by || null]
  );
  return result.rows[0];
}
