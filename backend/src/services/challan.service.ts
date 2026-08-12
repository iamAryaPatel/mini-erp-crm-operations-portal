import { pool } from '../config/database';
import * as challanRepo from '../repositories/challan.repository';
import * as productRepo from '../repositories/product.repository';
import * as inventoryRepo from '../repositories/inventory.repository';

interface CreateChallanInput {
  customer_id: string;
  items: Array<{ product_id: string; quantity: number }>;
  created_by: string;
}

export async function getAllChallans(params: {
  search?: string;
  status?: string;
  page: number;
  limit: number;
}) {
  const { rows, total } = await challanRepo.findAll(params);
  return {
    challans: rows,
    pagination: {
      page: params.page,
      limit: params.limit,
      total,
      totalPages: Math.ceil(total / params.limit),
    },
  };
}

export async function getChallanById(id: string) {
  const challan = await challanRepo.findById(id);
  if (!challan) {
    throw new Error('Challan not found');
  }
  const items = await challanRepo.findItemsByChallanId(id);
  return { ...challan, items };
}

/**
 * Create a new challan as Draft.
 * IMPORTANT: Draft creation does NOT affect stock.
 * Stock is only affected when the challan is confirmed.
 */
export async function createChallan(input: CreateChallanInput) {
  // Merge duplicate product entries (combine quantities)
  const mergedItems = new Map<string, number>();
  for (const item of input.items) {
    const existing = mergedItems.get(item.product_id) || 0;
    mergedItems.set(item.product_id, existing + item.quantity);
  }

  // Validate all products exist and fetch snapshot data
  const productSnapshots: Array<{
    product_id: string;
    product_name: string;
    sku: string;
    unit_price: number;
    quantity: number;
    current_stock: number;
  }> = [];

  for (const [productId, quantity] of mergedItems) {
    const product = await productRepo.findById(productId);
    if (!product) {
      throw new Error(`PRODUCT_NOT_FOUND:${productId}`);
    }
    productSnapshots.push({
      product_id: productId,
      product_name: product.product_name,
      sku: product.sku,
      unit_price: Number(product.unit_price),
      quantity,
      current_stock: product.current_stock,
    });
  }

  const totalQuantity = productSnapshots.reduce((sum, p) => sum + p.quantity, 0);

  // Create challan and items in a transaction
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const challanNumber = await challanRepo.generateChallanNumber();

    const challan = await challanRepo.createWithClient(client, {
      challan_number: challanNumber,
      customer_id: input.customer_id,
      total_quantity: totalQuantity,
      status: 'Draft',
      created_by: input.created_by,
    });

    const items = [];
    for (const snapshot of productSnapshots) {
      const item = await challanRepo.createItemWithClient(client, {
        challan_id: challan.id,
        product_id: snapshot.product_id,
        product_name_snapshot: snapshot.product_name,
        sku_snapshot: snapshot.sku,
        unit_price_snapshot: snapshot.unit_price,
        quantity: snapshot.quantity,
      });
      items.push(item);
    }

    await client.query('COMMIT');
    return { ...challan, items };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * CRITICAL BUSINESS LOGIC: Confirm a challan.
 *
 * This operation is ATOMIC (PostgreSQL transaction):
 * 1. Verify challan exists and is in Draft status
 * 2. Load all challan items
 * 3. Check stock availability for EVERY item
 * 4. If ANY product has insufficient stock → ROLLBACK → return error
 * 5. Reduce stock for each product
 * 6. Create OUT stock movement records
 * 7. Update challan status to Confirmed
 * 8. COMMIT
 *
 * Stock must NEVER become negative.
 */
export async function confirmChallan(challanId: string, userId: string) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Load challan with row lock to prevent concurrent confirmation
    const challanResult = await client.query(
      'SELECT * FROM challans WHERE id = $1 FOR UPDATE',
      [challanId]
    );
    const challan = challanResult.rows[0];

    if (!challan) {
      throw new Error('Challan not found');
    }

    // 2. Verify challan is in Draft status
    if (challan.status !== 'Draft') {
      throw new Error(`INVALID_STATUS:Cannot confirm a challan with status "${challan.status}". Only Draft challans can be confirmed.`);
    }

    // 3. Load all challan items
    const itemsResult = await client.query(
      'SELECT * FROM challan_items WHERE challan_id = $1',
      [challanId]
    );
    const items = itemsResult.rows;

    if (items.length === 0) {
      throw new Error('Challan has no items');
    }

    // 4. Check stock for EVERY item and lock product rows
    for (const item of items) {
      const productResult = await client.query(
        'SELECT id, product_name, current_stock FROM products WHERE id = $1 FOR UPDATE',
        [item.product_id]
      );
      const product = productResult.rows[0];

      if (!product) {
        throw new Error(`Product ${item.product_id} no longer exists`);
      }

      if (product.current_stock < item.quantity) {
        throw new Error(
          JSON.stringify({
            code: 'INSUFFICIENT_STOCK',
            message: 'Insufficient stock',
            details: {
              productId: product.id,
              productName: product.product_name,
              available: product.current_stock,
              requested: item.quantity,
            },
          })
        );
      }
    }

    // 5 & 6. Reduce stock and create stock movement records
    for (const item of items) {
      await client.query(
        'UPDATE products SET current_stock = current_stock - $1, updated_at = NOW() WHERE id = $2',
        [item.quantity, item.product_id]
      );

      await inventoryRepo.createWithClient(client, {
        product_id: item.product_id,
        quantity: item.quantity,
        movement_type: 'OUT',
        reason: `Sales Challan ${challan.challan_number}`,
        created_by: userId,
      });
    }

    // 7. Update challan status
    await challanRepo.updateStatusWithClient(client, challanId, 'Confirmed');

    // 8. COMMIT
    await client.query('COMMIT');

    // Return updated challan
    return getChallanById(challanId);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Cancel a challan.
 *
 * If the challan is Draft → simply set status to Cancelled (no stock change).
 * If the challan is Confirmed → reverse stock (create IN movements) within a transaction.
 */
export async function cancelChallan(challanId: string, userId: string) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const challanResult = await client.query(
      'SELECT * FROM challans WHERE id = $1 FOR UPDATE',
      [challanId]
    );
    const challan = challanResult.rows[0];

    if (!challan) {
      throw new Error('Challan not found');
    }

    if (challan.status === 'Cancelled') {
      throw new Error('INVALID_STATUS:Challan is already cancelled.');
    }

    // If confirmed, reverse stock
    if (challan.status === 'Confirmed') {
      const itemsResult = await client.query(
        'SELECT * FROM challan_items WHERE challan_id = $1',
        [challanId]
      );

      for (const item of itemsResult.rows) {
        // Add stock back
        await client.query(
          'UPDATE products SET current_stock = current_stock + $1, updated_at = NOW() WHERE id = $2',
          [item.quantity, item.product_id]
        );

        // Create IN movement for reversal
        await inventoryRepo.createWithClient(client, {
          product_id: item.product_id,
          quantity: item.quantity,
          movement_type: 'IN',
          reason: `Cancelled Challan ${challan.challan_number}`,
          created_by: userId,
        });
      }
    }

    await challanRepo.updateStatusWithClient(client, challanId, 'Cancelled');
    await client.query('COMMIT');

    return getChallanById(challanId);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
