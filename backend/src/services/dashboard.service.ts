import { pool } from '../config/database';

export async function getDashboardStats() {
  const [customersResult, productsResult, challansResult, lowStockResult, recentChallansResult, recentMovementsResult] =
    await Promise.all([
      pool.query(`
        SELECT
          COUNT(*)::int as total,
          COUNT(CASE WHEN status = 'Active' THEN 1 END)::int as active,
          COUNT(CASE WHEN status = 'Lead' THEN 1 END)::int as leads
        FROM customers
      `),
      pool.query(`
        SELECT
          COUNT(*)::int as total,
          COALESCE(SUM(current_stock), 0)::int as total_stock
        FROM products
      `),
      pool.query(`
        SELECT
          COUNT(CASE WHEN status = 'Draft' THEN 1 END)::int as draft,
          COUNT(CASE WHEN status = 'Confirmed' THEN 1 END)::int as confirmed,
          COUNT(CASE WHEN status = 'Cancelled' THEN 1 END)::int as cancelled
        FROM challans
      `),
      pool.query(`
        SELECT COUNT(*)::int as count
        FROM products
        WHERE current_stock <= minimum_stock_quantity
      `),
      pool.query(`
        SELECT c.id, c.challan_number, c.total_quantity, c.status, c.created_at,
               cust.customer_name, cust.business_name
        FROM challans c
        LEFT JOIN customers cust ON c.customer_id = cust.id
        ORDER BY c.created_at DESC
        LIMIT 5
      `),
      pool.query(`
        SELECT sm.id, sm.quantity, sm.movement_type, sm.reason, sm.created_at,
               p.product_name, p.sku
        FROM stock_movements sm
        LEFT JOIN products p ON sm.product_id = p.id
        ORDER BY sm.created_at DESC
        LIMIT 5
      `),
    ]);

  return {
    customers: customersResult.rows[0],
    products: productsResult.rows[0],
    challans: challansResult.rows[0],
    lowStockCount: lowStockResult.rows[0].count,
    recentChallans: recentChallansResult.rows,
    recentMovements: recentMovementsResult.rows,
  };
}
