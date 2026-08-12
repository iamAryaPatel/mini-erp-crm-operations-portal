import { pool } from '../config/database';

export interface FollowUpRow {
  id: string;
  customer_id: string;
  note: string;
  follow_up_date: Date | null;
  created_by: string | null;
  created_at: Date;
  creator_name?: string;
}

export async function findByCustomerId(customerId: string): Promise<FollowUpRow[]> {
  const result = await pool.query<FollowUpRow>(
    `SELECT cf.*, u.name as creator_name
     FROM customer_followups cf
     LEFT JOIN users u ON cf.created_by = u.id
     WHERE cf.customer_id = $1
     ORDER BY cf.created_at DESC`,
    [customerId]
  );
  return result.rows;
}

export async function create(data: {
  customer_id: string;
  note: string;
  follow_up_date?: Date | null;
  created_by?: string;
}): Promise<FollowUpRow> {
  const result = await pool.query<FollowUpRow>(
    `INSERT INTO customer_followups (customer_id, note, follow_up_date, created_by)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [data.customer_id, data.note, data.follow_up_date || null, data.created_by || null]
  );
  return result.rows[0];
}
