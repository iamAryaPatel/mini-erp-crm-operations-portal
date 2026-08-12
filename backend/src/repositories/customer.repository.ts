import { pool } from '../config/database';

export interface CustomerRow {
  id: string;
  customer_name: string;
  mobile_number: string;
  email: string | null;
  business_name: string;
  gst_number: string | null;
  customer_type: string;
  address: string | null;
  status: string;
  follow_up_date: Date | null;
  notes: string | null;
  created_by: string | null;
  created_at: Date;
  updated_at: Date;
}

interface FindAllParams {
  search?: string;
  status?: string;
  customer_type?: string;
  page: number;
  limit: number;
}

export async function findAll(params: FindAllParams): Promise<{ rows: CustomerRow[]; total: number }> {
  const { search, status, customer_type, page, limit } = params;
  const conditions: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;

  if (search) {
    conditions.push(
      `(customer_name ILIKE $${paramIndex} OR business_name ILIKE $${paramIndex} OR mobile_number ILIKE $${paramIndex})`
    );
    values.push(`%${search}%`);
    paramIndex++;
  }

  if (status) {
    conditions.push(`status = $${paramIndex}`);
    values.push(status);
    paramIndex++;
  }

  if (customer_type) {
    conditions.push(`customer_type = $${paramIndex}`);
    values.push(customer_type);
    paramIndex++;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const countResult = await pool.query(
    `SELECT COUNT(*) FROM customers ${whereClause}`,
    values
  );
  const total = parseInt(countResult.rows[0].count, 10);

  const offset = (page - 1) * limit;
  const dataResult = await pool.query<CustomerRow>(
    `SELECT * FROM customers ${whereClause} ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
    [...values, limit, offset]
  );

  return { rows: dataResult.rows, total };
}

export async function findById(id: string): Promise<CustomerRow | null> {
  const result = await pool.query<CustomerRow>(
    'SELECT * FROM customers WHERE id = $1',
    [id]
  );
  return result.rows[0] || null;
}

export async function create(data: Partial<CustomerRow>): Promise<CustomerRow> {
  const result = await pool.query<CustomerRow>(
    `INSERT INTO customers (customer_name, mobile_number, email, business_name, gst_number, customer_type, address, status, follow_up_date, notes, created_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
     RETURNING *`,
    [
      data.customer_name,
      data.mobile_number,
      data.email || null,
      data.business_name,
      data.gst_number || null,
      data.customer_type,
      data.address || null,
      data.status || 'Lead',
      data.follow_up_date || null,
      data.notes || null,
      data.created_by || null,
    ]
  );
  return result.rows[0];
}

export async function update(id: string, data: Partial<CustomerRow>): Promise<CustomerRow | null> {
  const fields: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;

  const updatableFields: (keyof CustomerRow)[] = [
    'customer_name', 'mobile_number', 'email', 'business_name',
    'gst_number', 'customer_type', 'address', 'status',
    'follow_up_date', 'notes',
  ];

  for (const field of updatableFields) {
    if (data[field] !== undefined) {
      fields.push(`${field} = $${paramIndex}`);
      values.push(data[field]);
      paramIndex++;
    }
  }

  if (fields.length === 0) return findById(id);

  fields.push(`updated_at = NOW()`);
  values.push(id);

  const result = await pool.query<CustomerRow>(
    `UPDATE customers SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
    values
  );
  return result.rows[0] || null;
}

export async function deleteById(id: string): Promise<boolean> {
  const result = await pool.query('DELETE FROM customers WHERE id = $1', [id]);
  return (result.rowCount ?? 0) > 0;
}
