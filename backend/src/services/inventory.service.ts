import { pool } from '../config/database';
import * as inventoryRepo from '../repositories/inventory.repository';
import * as productRepo from '../repositories/product.repository';

export async function getInventoryStats() {
  const result = await pool.query(`
    SELECT
      COUNT(*)::int as total_products,
      COALESCE(SUM(current_stock), 0)::int as total_stock,
      COUNT(CASE WHEN current_stock <= minimum_stock_quantity THEN 1 END)::int as low_stock_count
    FROM products
  `);
  return result.rows[0];
}

export async function getLowStockProducts() {
  const result = await pool.query(
    `SELECT * FROM products WHERE current_stock <= minimum_stock_quantity ORDER BY current_stock ASC`
  );
  return result.rows;
}

export async function getMovements(params: {
  product_id?: string;
  movement_type?: string;
  page: number;
  limit: number;
}) {
  const { rows, total } = await inventoryRepo.findAll(params);
  return {
    movements: rows,
    pagination: {
      page: params.page,
      limit: params.limit,
      total,
      totalPages: Math.ceil(total / params.limit),
    },
  };
}

export async function addStockMovement(data: {
  product_id: string;
  quantity: number;
  movement_type: string;
  reason: string;
  created_by: string;
}) {
  const product = await productRepo.findById(data.product_id);
  if (!product) {
    throw new Error('Product not found');
  }

  if (data.movement_type === 'OUT') {
    if (product.current_stock < data.quantity) {
      throw new Error('INSUFFICIENT_STOCK');
    }
  }

  // Use a transaction for stock update + movement record
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const stockChange = data.movement_type === 'IN' ? data.quantity : -data.quantity;
    await client.query(
      'UPDATE products SET current_stock = current_stock + $1, updated_at = NOW() WHERE id = $2',
      [stockChange, data.product_id]
    );

    const movement = await inventoryRepo.createWithClient(client, data);

    await client.query('COMMIT');
    return movement;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
