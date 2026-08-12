import { pool } from '../config/database';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { fakerEN_IN as faker } from '@faker-js/faker';

// Use a consistent seed for deterministic data generation
faker.seed(12345);

async function batchInsert(client: any, table: string, columns: string[], data: any[][], batchSize = 1000) {
  if (data.length === 0) return;
  console.log(`Inserting ${data.length} records into ${table}...`);
  
  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize);
    const values: any[] = [];
    const placeholders: string[] = [];
    let paramIndex = 1;
    
    for (const row of batch) {
      const rowPlaceholders = [];
      for (const val of row) {
        values.push(val);
        rowPlaceholders.push(`$${paramIndex++}`);
      }
      placeholders.push(`(${rowPlaceholders.join(', ')})`);
    }

    const query = `INSERT INTO ${table} (${columns.join(', ')}) VALUES ${placeholders.join(', ')}`;
    await client.query(query, values);
  }
}

async function seed() {
  const client = await pool.connect();
  try {
    console.log('🌱 Starting high-volume database seed...\n');

    // 1. Run schema.sql
    const schemaPath = path.resolve(__dirname, '../../../database/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');
    await client.query(schema);
    console.log('✅ Schema created successfully\n');

    // Password Hash
    const saltRounds = 10;
    const adminHash = await bcrypt.hash('Admin@123', saltRounds);
    const salesHash = await bcrypt.hash('Admin@123', saltRounds); // Standardizing to one test password for all
    const warehouseHash = await bcrypt.hash('Admin@123', saltRounds);
    const accountsHash = await bcrypt.hash('Admin@123', saltRounds);

    // ==========================================
    // 2. GENERATE USERS (20)
    // ==========================================
    console.log('Generating Users...');
    const usersData: any[][] = [];
    const userIds = { ADMIN: [] as string[], SALES: [] as string[], WAREHOUSE: [] as string[], ACCOUNTS: [] as string[] };
    
    const roleCounts = { ADMIN: 2, SALES: 8, WAREHOUSE: 6, ACCOUNTS: 4 };
    
    for (const [role, count] of Object.entries(roleCounts)) {
      for (let i = 1; i <= count; i++) {
        const id = uuidv4();
        userIds[role as keyof typeof userIds].push(id);
        const name = faker.person.fullName();
        const email = `${role.toLowerCase()}${i}@erp-demo.com`;
        const pass = role === 'ADMIN' ? adminHash : role === 'SALES' ? salesHash : role === 'WAREHOUSE' ? warehouseHash : accountsHash;
        usersData.push([id, name, email, pass, role]);
      }
    }
    
    await batchInsert(client, 'users', ['id', 'name', 'email', 'password_hash', 'role'], usersData);
    console.log('✅ Users inserted.\n');

    const getRandomSalesUser = () => faker.helpers.arrayElement(userIds.SALES);
    const getRandomWarehouseUser = () => faker.helpers.arrayElement(userIds.WAREHOUSE);

    // ==========================================
    // 3. GENERATE CUSTOMERS (10,000)
    // ==========================================
    console.log('Generating Customers...');
    const customersData: any[][] = [];
    const customerIds: string[] = [];
    
    const customerTypes = ['Retail', 'Wholesale', 'Distributor'];
    const customerTypeWeights = [0.45, 0.40, 0.15];
    const customerStatuses = ['Active', 'Lead', 'Inactive'];
    const customerStatusWeights = [0.60, 0.25, 0.15];
    
    const indianCities = [
      'Mumbai', 'Pune', 'Ahmedabad', 'Vadodara', 'Surat', 'Rajkot', 'Delhi', 'Gurugram', 
      'Noida', 'Jaipur', 'Indore', 'Bhopal', 'Nagpur', 'Bengaluru', 'Hyderabad', 
      'Chennai', 'Kolkata', 'Jamshedpur', 'Lucknow', 'Kanpur', 'Patna', 'Ranchi', 
      'Nashik', 'Aurangabad', 'Udaipur'
    ];

    const generateGST = () => {
      const stateCode = faker.number.int({min: 1, max: 37}).toString().padStart(2, '0');
      const pan = faker.string.alpha({length: 5, casing: 'upper'}) + faker.string.numeric(4) + faker.string.alpha({length: 1, casing: 'upper'});
      return `${stateCode}${pan}1Z${faker.string.alphanumeric(1).toUpperCase()}`;
    };

    // Keep track of unique mobile numbers and emails to avoid constraint errors
    const generatedMobiles = new Set<string>();
    const generatedEmails = new Set<string>();
    
    for (let i = 0; i < 10000; i++) {
      const id = uuidv4();
      customerIds.push(id);
      
      const customerName = faker.person.fullName();
      
      let mobile;
      do {
        mobile = `9${faker.string.numeric(9)}`;
      } while(generatedMobiles.has(mobile));
      generatedMobiles.add(mobile);
      
      let email: string | null = null;
      if (faker.datatype.boolean({ probability: 0.8 })) {
        do {
          email = faker.internet.email({ firstName: customerName.split(' ')[0], provider: 'business.in' });
        } while (generatedEmails.has(email));
        generatedEmails.add(email);
      }
      
      const businessName = `${faker.company.name()} ${faker.helpers.arrayElement(['Traders', 'Electronics', 'Hardware', 'Distributors', 'Enterprises', 'Solutions'])}`;
      const hasGst = faker.datatype.boolean({ probability: 0.7 });
      const gstNumber = hasGst ? generateGST() : null;
      
      const type = faker.helpers.weightedArrayElement([
        {weight: 45, value: 'Retail'}, {weight: 40, value: 'Wholesale'}, {weight: 15, value: 'Distributor'}
      ]);
      const status = faker.helpers.weightedArrayElement([
        {weight: 60, value: 'Active'}, {weight: 25, value: 'Lead'}, {weight: 15, value: 'Inactive'}
      ]);
      
      const address = `${faker.location.streetAddress()}, ${faker.helpers.arrayElement(indianCities)}, ${faker.location.state()}, India - ${faker.location.zipCode()}`;
      
      let followUpDate = null;
      if (status !== 'Inactive' && faker.datatype.boolean({ probability: 0.3 })) {
        followUpDate = faker.date.soon({ days: 30 });
      }
      
      const notes = faker.datatype.boolean({ probability: 0.5 }) ? faker.lorem.sentence() : null;
      const createdBy = getRandomSalesUser();
      const createdAt = faker.date.past({ years: 2 });
      
      customersData.push([
        id, customerName, mobile, email, businessName, gstNumber, type, address, 
        status, followUpDate, notes, createdBy, createdAt, createdAt
      ]);
    }
    await batchInsert(client, 'customers', 
      ['id', 'customer_name', 'mobile_number', 'email', 'business_name', 'gst_number', 'customer_type', 'address', 'status', 'follow_up_date', 'notes', 'created_by', 'created_at', 'updated_at'], 
      customersData
    );
    console.log('✅ Customers inserted.\n');

    // ==========================================
    // 4. GENERATE FOLLOW-UPS (25,000)
    // ==========================================
    console.log('Generating Follow-ups...');
    const followupsData: any[][] = [];
    const followUpNotes = [
      'Called customer regarding pending requirement',
      'Follow-up for next order',
      'Customer requested updated pricing',
      'Discussed bulk order',
      'Waiting for purchase confirmation',
      'Customer interested in new product range',
      'Follow-up scheduled for next week',
      'Payment discussion',
      'Requested product catalogue'
    ];

    for (let i = 0; i < 25000; i++) {
      const customerId = faker.helpers.arrayElement(customerIds);
      const note = faker.helpers.arrayElement(followUpNotes) + (faker.datatype.boolean() ? ` - ${faker.lorem.words(3)}` : '');
      const date = faker.date.recent({ days: 180 });
      followupsData.push([uuidv4(), customerId, note, date, getRandomSalesUser(), date]);
    }
    await batchInsert(client, 'customer_followups', ['id', 'customer_id', 'note', 'follow_up_date', 'created_by', 'created_at'], followupsData);
    console.log('✅ Follow-ups inserted.\n');

    // ==========================================
    // 5. GENERATE PRODUCTS (5,000)
    // ==========================================
    console.log('Generating Products...');
    const categories = [
      'Electronics', 'Computer Accessories', 'Mobile Accessories', 'Electrical', 
      'Hardware', 'Office Supplies', 'Stationery', 'Home Appliances', 
      'Kitchen Products', 'Cleaning Supplies', 'Packaging', 'Networking', 
      'Cables', 'Storage Devices', 'Power Accessories', 'LED Lighting', 
      'Tools', 'Safety Equipment'
    ];
    
    const warehouseLocations = [
      'Mumbai Warehouse', 'Pune Warehouse', 'Ahmedabad Warehouse', 
      'Vadodara Warehouse', 'Delhi Warehouse', 'Bengaluru Warehouse', 
      'Hyderabad Warehouse', 'Kolkata Warehouse'
    ];

    type ProductType = {
      id: string;
      name: string;
      sku: string;
      category: string;
      price: number;
      minStock: number;
      location: string;
      openingStock: number;
      currentStock: number;
      createdAt: Date;
    };
    const products: ProductType[] = [];
    const productSkus = new Set<string>();

    const productModifiers = ['Wireless', 'Wired', 'HD', '4K', 'Pro', 'Max', 'Ultra', 'Type-C', 'USB', 'Bluetooth'];
    const productBaseNames = ['Keyboard', 'Mouse', 'Monitor', 'Cable', 'Adapter', 'Router', 'Switch', 'Speaker', 'Headphones', 'Bulb', 'Tool Kit', 'Paper Roll', 'Drive', 'Power Bank'];

    for (let i = 0; i < 5000; i++) {
      let sku;
      do {
        const prefix = faker.string.alpha({length: 3, casing: 'upper'});
        sku = `${prefix}-${faker.string.numeric(6)}`;
      } while (productSkus.has(sku));
      productSkus.add(sku);

      const name = `${faker.helpers.arrayElement(productModifiers)} ${faker.helpers.arrayElement(productBaseNames)} ${faker.string.alphanumeric(3).toUpperCase()}`;
      
      const price = parseFloat(faker.commerce.price({ min: 50, max: 25000 }));
      const minStock = faker.number.int({ min: 5, max: 50 });
      const openingStock = faker.number.int({ min: minStock, max: minStock + 300 }); // initial positive stock
      
      products.push({
        id: uuidv4(),
        name,
        sku,
        category: faker.helpers.arrayElement(categories),
        price,
        minStock,
        location: faker.helpers.arrayElement(warehouseLocations),
        openingStock,
        currentStock: openingStock,
        createdAt: faker.date.past({ years: 2 })
      });
    }
    // We will insert products at the END so we can save the CORRECT current_stock.

    // ==========================================
    // 6. GENERATE CHALLANS & ITEMS & MOVEMENTS
    // ==========================================
    console.log('Generating Challans, Items and simulating Stock Movements...');
    
    const challansData: any[][] = [];
    const challanItemsData: any[][] = [];
    const stockMovementsData: any[][] = [];
    const generatedChallanNumbers = new Set<string>();

    for (let i = 1; i <= 20000; i++) {
      const id = uuidv4();
      
      let cNum;
      do {
        cNum = `CH-2026-${faker.string.numeric(6)}`;
      } while(generatedChallanNumbers.has(cNum));
      generatedChallanNumbers.add(cNum);

      const customerId = faker.helpers.arrayElement(customerIds);
      const status = faker.helpers.weightedArrayElement([
        {weight: 75, value: 'Confirmed'}, {weight: 15, value: 'Draft'}, {weight: 10, value: 'Cancelled'}
      ]);
      const createdBy = getRandomSalesUser();
      const createdAt = faker.date.past({ years: 1 });

      const numItems = faker.number.int({ min: 1, max: 8 });
      let totalQty = 0;

      // Pick random unique products for this challan
      const challanProducts = faker.helpers.arrayElements(products, numItems);

      for (const prod of challanProducts) {
        const qty = faker.number.int({ min: 1, max: 15 });
        totalQty += qty;

        challanItemsData.push([
          uuidv4(), id, prod.id, prod.name, prod.sku, prod.price, qty, createdAt
        ]);

        if (status === 'Confirmed') {
          // Adjust in memory stock
          prod.currentStock -= qty;
          
          // If stock goes negative, inject more opening stock to ensure it never dropped below zero
          if (prod.currentStock < 0) {
            const deficit = Math.abs(prod.currentStock);
            const extraBuffer = faker.number.int({min: 20, max: 100});
            prod.openingStock += (deficit + extraBuffer);
            prod.currentStock = extraBuffer;
          }

          // Create OUT movement
          stockMovementsData.push([
            uuidv4(), prod.id, qty, 'OUT', 'Sales Challan', createdBy, createdAt
          ]);
        }
      }

      challansData.push([
        id, cNum, customerId, totalQty, status, createdBy, createdAt, createdAt
      ]);
    }

    // Generate Opening Stock movements and some random adjustments to reach 50k+ movements
    for (const prod of products) {
      // Opening Stock movement
      const movementDate = faker.date.past({ years: 2, refDate: prod.createdAt });
      stockMovementsData.push([
        uuidv4(), prod.id, prod.openingStock, 'IN', 'Opening Stock', getRandomWarehouseUser(), movementDate
      ]);

      // Add a random stock adjustment to reach >50k total movements and realistic flow
      if (faker.datatype.boolean({ probability: 0.4 })) {
        const adjQty = faker.number.int({ min: 1, max: 20 });
        const isOut = faker.datatype.boolean() && prod.currentStock > adjQty; // Only OUT if enough stock
        
        if (isOut) {
          prod.currentStock -= adjQty;
          stockMovementsData.push([uuidv4(), prod.id, adjQty, 'OUT', 'Stock Adjustment', getRandomWarehouseUser(), faker.date.recent({days: 90})]);
        } else {
          prod.currentStock += adjQty;
          stockMovementsData.push([uuidv4(), prod.id, adjQty, 'IN', 'Purchase', getRandomWarehouseUser(), faker.date.recent({days: 90})]);
        }
      }
    }

    // Now insert the physically consistent products
    const productsData = products.map(p => [
      p.id, p.name, p.sku, p.category, p.price, p.currentStock, p.minStock, p.location, p.createdAt, p.createdAt
    ]);
    
    await batchInsert(client, 'products', 
      ['id', 'product_name', 'sku', 'category', 'unit_price', 'current_stock', 'minimum_stock_quantity', 'warehouse_location', 'created_at', 'updated_at'], 
      productsData
    );
    console.log('✅ Products inserted.\n');

    // Insert Challans
    await batchInsert(client, 'challans', 
      ['id', 'challan_number', 'customer_id', 'total_quantity', 'status', 'created_by', 'created_at', 'updated_at'], 
      challansData
    );
    console.log('✅ Challans inserted.\n');

    // Insert Challan Items
    await batchInsert(client, 'challan_items', 
      ['id', 'challan_id', 'product_id', 'product_name_snapshot', 'sku_snapshot', 'unit_price_snapshot', 'quantity', 'created_at'], 
      challanItemsData
    );
    console.log('✅ Challan Items inserted.\n');

    // Insert Stock Movements
    await batchInsert(client, 'stock_movements', 
      ['id', 'product_id', 'quantity', 'movement_type', 'reason', 'created_by', 'created_at'], 
      stockMovementsData
    );
    console.log('✅ Stock Movements inserted.\n');

    // ==========================================
    // 7. VERIFICATION & SUMMARY
    // ==========================================
    console.log('\n========================================');
    console.log('DATABASE SEED COMPLETE');
    console.log('========================================\n');

    const tables = ['users', 'customers', 'customer_followups', 'products', 'stock_movements', 'challans', 'challan_items'];
    for (const table of tables) {
      const res = await client.query(`SELECT COUNT(*) FROM ${table}`);
      console.log(`${table.padEnd(20)}: ${res.rows[0].count}`);
    }

    const lowStockRes = await client.query('SELECT COUNT(*) FROM products WHERE current_stock <= minimum_stock_quantity');
    const outOfStockRes = await client.query('SELECT COUNT(*) FROM products WHERE current_stock = 0');
    
    const challanDraft = await client.query("SELECT COUNT(*) FROM challans WHERE status = 'Draft'");
    const challanConfirmed = await client.query("SELECT COUNT(*) FROM challans WHERE status = 'Confirmed'");
    const challanCancelled = await client.query("SELECT COUNT(*) FROM challans WHERE status = 'Cancelled'");

    console.log('\nLow Stock Products:  ', lowStockRes.rows[0].count);
    console.log('Out of Stock Products:', outOfStockRes.rows[0].count);
    console.log('Confirmed Challans:  ', challanConfirmed.rows[0].count);
    console.log('Draft Challans:      ', challanDraft.rows[0].count);
    console.log('Cancelled Challans:  ', challanCancelled.rows[0].count);
    console.log('\n========================================\n');

    console.log('📋 Test Credentials (ALL USERS):');
    console.log('   Password for all generated accounts is: Admin@123');
    console.log('   Example accounts:');
    console.log('     admin1@erp-demo.com');
    console.log('     sales1@erp-demo.com');
    console.log('     warehouse1@erp-demo.com');
    console.log('     accounts1@erp-demo.com\n');

  } catch (error) {
    console.error('❌ Seed failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
