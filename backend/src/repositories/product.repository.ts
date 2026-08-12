import { pool } from '../config/database';

export interface ProductRow {
  id: string;
  product_name: string;
  sku: string;
  category: string;
  unit_price: number;
  current_stock: number;
  minimum_stock_quantity: number;
  warehouse_location: string | null;
  created_at: Date;
  updated_at: Date;
}

interface FindAllParams {
  search?: string;
  category?: string;
  low_stock?: boolean;
  page: number;
  limit: number;
}

export async function findAll(params: FindAllParams): Promise<{ rows: ProductRow[]; total: number }> {
  const { search, category, low_stock, page, limit } = params;
  const conditions: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;

  if (search) {
    conditions.push(`(product_name ILIKE $${paramIndex} OR sku ILIKE $${paramIndex})`);
    values.push(`%${search}%`);
    paramIndex++;
  }

  if (category) {
    conditions.push(`category = $${paramIndex}`);
    values.push(category);
    paramIndex++;
  }

  if (low_stock) {
    conditions.push(`current_stock <= minimum_stock_quantity`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const countResult = await pool.query(
    `SELECT COUNT(*) FROM products ${whereClause}`,
    values
  );
  const total = parseInt(countResult.rows[0].count, 10);

  const offset = (page - 1) * limit;
  const dataResult = await pool.query<ProductRow>(
    `SELECT * FROM products ${whereClause} ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
    [...values, limit, offset]
  );

  return { rows: dataResult.rows, total };
}

export async function findById(id: string): Promise<ProductRow | null> {
  const result = await pool.query<ProductRow>('SELECT * FROM products WHERE id = $1', [id]);
  return result.rows[0] || null;
}

export async function findBySku(sku: string): Promise<ProductRow | null> {
  const result = await pool.query<ProductRow>('SELECT * FROM products WHERE sku = $1', [sku]);
  return result.rows[0] || null;
}

export async function create(data: Partial<ProductRow>): Promise<ProductRow> {
  const result = await pool.query<ProductRow>(
    `INSERT INTO products (product_name, sku, category, unit_price, current_stock, minimum_stock_quantity, warehouse_location)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [
      data.product_name,
      data.sku,
      data.category,
      data.unit_price,
      data.current_stock || 0,
      data.minimum_stock_quantity || 0,
      data.warehouse_location || null,
    ]
  );
  return result.rows[0];
}

export async function update(id: string, data: Partial<ProductRow>): Promise<ProductRow | null> {
  const fields: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;

  const updatableFields: (keyof ProductRow)[] = [
    'product_name', 'sku', 'category', 'unit_price',
    'minimum_stock_quantity', 'warehouse_location',
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

  const result = await pool.query<ProductRow>(
    `UPDATE products SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
    values
  );
  return result.rows[0] || null;
}

export async function getCategories(): Promise<string[]> {
  const result = await pool.query('SELECT DISTINCT category FROM products ORDER BY category');
  return result.rows.map((r: { category: string }) => r.category);
}
