-- ============================================================
-- Mini ERP + CRM — Database Schema
-- PostgreSQL
-- ============================================================

-- Clean up existing tables (in reverse dependency order)
DROP TABLE IF EXISTS challan_items CASCADE;
DROP TABLE IF EXISTS challans CASCADE;
DROP TABLE IF EXISTS stock_movements CASCADE;
DROP TABLE IF EXISTS customer_followups CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ============================================================
-- USERS
-- ============================================================
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          VARCHAR(100)  NOT NULL,
  email         VARCHAR(255)  NOT NULL UNIQUE,
  password_hash VARCHAR(255)  NOT NULL,
  role          VARCHAR(20)   NOT NULL CHECK (role IN ('ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS')),
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ============================================================
-- CUSTOMERS
-- ============================================================
CREATE TABLE customers (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name   VARCHAR(150)  NOT NULL,
  mobile_number   VARCHAR(15)   NOT NULL,
  email           VARCHAR(255),
  business_name   VARCHAR(200)  NOT NULL,
  gst_number      VARCHAR(15),
  customer_type   VARCHAR(20)   NOT NULL CHECK (customer_type IN ('Retail', 'Wholesale', 'Distributor')),
  address         TEXT,
  status          VARCHAR(20)   NOT NULL DEFAULT 'Lead' CHECK (status IN ('Lead', 'Active', 'Inactive')),
  follow_up_date  DATE,
  notes           TEXT,
  created_by      UUID          REFERENCES users(id),
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_customers_business_name ON customers(business_name);
CREATE INDEX idx_customers_mobile_number ON customers(mobile_number);
CREATE INDEX idx_customers_status ON customers(status);
CREATE INDEX idx_customers_customer_type ON customers(customer_type);

-- ============================================================
-- CUSTOMER FOLLOW-UPS
-- ============================================================
CREATE TABLE customer_followups (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id     UUID          NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  note            TEXT          NOT NULL,
  follow_up_date  DATE,
  created_by      UUID          REFERENCES users(id),
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_followups_customer_id ON customer_followups(customer_id);

-- ============================================================
-- PRODUCTS
-- ============================================================
CREATE TABLE products (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_name            VARCHAR(200)    NOT NULL,
  sku                     VARCHAR(50)     NOT NULL UNIQUE,
  category                VARCHAR(100)    NOT NULL,
  unit_price              NUMERIC(12, 2)  NOT NULL CHECK (unit_price >= 0),
  current_stock           INTEGER         NOT NULL DEFAULT 0 CHECK (current_stock >= 0),
  minimum_stock_quantity  INTEGER         NOT NULL DEFAULT 0 CHECK (minimum_stock_quantity >= 0),
  warehouse_location      VARCHAR(100),
  created_at              TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_category ON products(category);

-- ============================================================
-- STOCK MOVEMENTS
-- ============================================================
CREATE TABLE stock_movements (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id      UUID          NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity        INTEGER       NOT NULL CHECK (quantity > 0),
  movement_type   VARCHAR(5)    NOT NULL CHECK (movement_type IN ('IN', 'OUT')),
  reason          VARCHAR(255)  NOT NULL,
  created_by      UUID          REFERENCES users(id),
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_stock_movements_product_id ON stock_movements(product_id);

-- ============================================================
-- CHALLANS
-- ============================================================
CREATE TABLE challans (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challan_number  VARCHAR(20)   NOT NULL UNIQUE,
  customer_id     UUID          NOT NULL REFERENCES customers(id),
  total_quantity  INTEGER       NOT NULL DEFAULT 0 CHECK (total_quantity >= 0),
  status          VARCHAR(20)   NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Confirmed', 'Cancelled')),
  created_by      UUID          REFERENCES users(id),
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_challans_challan_number ON challans(challan_number);
CREATE INDEX idx_challans_customer_id ON challans(customer_id);
CREATE INDEX idx_challans_status ON challans(status);

-- ============================================================
-- CHALLAN ITEMS
-- ============================================================
CREATE TABLE challan_items (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challan_id            UUID            NOT NULL REFERENCES challans(id) ON DELETE CASCADE,
  product_id            UUID            NOT NULL REFERENCES products(id),
  product_name_snapshot VARCHAR(200)    NOT NULL,
  sku_snapshot          VARCHAR(50)     NOT NULL,
  unit_price_snapshot   NUMERIC(12, 2)  NOT NULL,
  quantity              INTEGER         NOT NULL CHECK (quantity > 0),
  created_at            TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_challan_items_challan_id ON challan_items(challan_id);
