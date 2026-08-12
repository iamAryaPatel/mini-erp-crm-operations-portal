# Mini ERP + CRM Operations Portal — Implementation Plan

## Current State Assessment

The project directory at `D:\mini-erp-crm` has **the correct folder structure already scaffolded**, but **every file is empty** (0 bytes). This means:

- ✅ Directory structure matches the spec perfectly
- ❌ No dependencies installed (empty `package.json` files)
- ❌ No configuration (empty `tsconfig.json`, `vite.config.ts`, `.env.example`)
- ❌ No source code (empty `app.ts`, `server.ts`, `App.tsx`, `main.tsx`)
- ❌ No database schema (empty `schema.sql`)
- ❌ No documentation (empty `README.md`, docs)
- ❌ No Postman collection

### Existing Structure (to be preserved)

```
mini-erp-crm/
├── frontend/          ← Vite + React + TypeScript
│   ├── public/
│   └── src/
│       ├── assets/
│       ├── components/{common, forms, layout, tables}
│       ├── pages/{auth, dashboard, customers, products, inventory, challans, users}
│       ├── services/, hooks/, context/, types/, utils/, routes/, styles/
│       ├── App.tsx, main.tsx
├── backend/           ← Express + TypeScript
│   └── src/
│       ├── config/, controllers/, routes/, middleware/
│       ├── services/, models/, repositories/, validations/
│       ├── types/, utils/, db/
│       ├── app.ts, server.ts
├── database/          ← PostgreSQL
│   ├── migrations/
│   ├── seeds/
│   └── schema.sql
├── postman/
├── docs/
├── README.md, .gitignore, package.json
```

No restructuring needed — I will populate these existing files and directories.

---

## Phased Implementation Plan

### Phase 1-2: Project Initialization & Dependencies

#### Backend (`backend/`)
- **[MODIFY]** [package.json](file:///D:/mini-erp-crm/backend/package.json) — dependencies: `express`, `pg`, `bcryptjs`, `jsonwebtoken`, `helmet`, `cors`, `express-rate-limit`, `joi` (validation), `dotenv`, `uuid`. Dev deps: `typescript`, `tsx`, `@types/*`, `nodemon`.
- **[MODIFY]** [tsconfig.json](file:///D:/mini-erp-crm/backend/tsconfig.json) — strict TypeScript config targeting ES2020, CommonJS output.
- **[MODIFY]** [.env.example](file:///D:/mini-erp-crm/backend/.env.example) — `PORT`, `NODE_ENV`, `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `FRONTEND_URL`

#### Frontend (`frontend/`)
- **[MODIFY]** [package.json](file:///D:/mini-erp-crm/frontend/package.json) — dependencies: `react`, `react-dom`, `react-router-dom`, `axios`, `react-hot-toast`. Dev deps: `typescript`, `vite`, `@vitejs/plugin-react`, `@types/*`.
- **[MODIFY]** [tsconfig.json](file:///D:/mini-erp-crm/frontend/tsconfig.json) — strict React TypeScript config.
- **[MODIFY]** [vite.config.ts](file:///D:/mini-erp-crm/frontend/vite.config.ts) — React plugin, proxy for API dev.
- **[MODIFY]** [.env.example](file:///D:/mini-erp-crm/frontend/.env.example) — `VITE_API_URL`

#### Root
- **[MODIFY]** [package.json](file:///D:/mini-erp-crm/package.json) — workspace scripts for running both frontend and backend.
- **[MODIFY]** [.gitignore](file:///D:/mini-erp-crm/.gitignore) — node_modules, .env, dist, etc.

---

### Phase 3-6: Database Design & Schema

#### [MODIFY] [schema.sql](file:///D:/mini-erp-crm/database/schema.sql)

7 tables with proper constraints:

| Table | Key Design Decisions |
|-------|---------------------|
| `users` | `role` as PostgreSQL `CHECK` constraint (ADMIN, SALES, WAREHOUSE, ACCOUNTS). `password_hash` never returned in queries. |
| `customers` | `customer_type` CHECK (Retail, Wholesale, Distributor). `status` CHECK (Lead, Active, Inactive). Optional `gst_number`. `created_by` FK → users. |
| `customer_followups` | FK → customers, FK → users (created_by). Tracks follow-up notes with dates. |
| `products` | Unique `sku`. `current_stock` CHECK ≥ 0. `minimum_stock_quantity` for low-stock alerts. |
| `stock_movements` | `movement_type` CHECK (IN, OUT). FK → products, FK → users. Immutable audit trail. |
| `challans` | Auto-generated `challan_number` (CH-YYYY-NNNN format). `status` CHECK (Draft, Confirmed, Cancelled). FK → customers, FK → users. |
| `challan_items` | Snapshot fields: `product_name_snapshot`, `sku_snapshot`, `unit_price_snapshot`. FK → challans, FK → products. |

Indexes on: `customers.business_name`, `customers.mobile_number`, `customers.status`, `products.sku`, `products.category`, `challans.challan_number`, `challans.customer_id`, `stock_movements.product_id`.

#### [NEW] `database/seeds/seed.ts`
- Seed 4 users (one per role) with bcrypt-hashed passwords
- Seed ~5 customers with varied types and statuses
- Seed ~8 products with varied stock levels (some low-stock)
- Seed a few stock movements

---

### Phase 7-8: Authentication & Authorization

#### Backend files:
- **[NEW]** `backend/src/config/database.ts` — pg Pool with `DATABASE_URL`
- **[NEW]** `backend/src/config/env.ts` — centralized env validation
- **[NEW]** `backend/src/middleware/auth.middleware.ts` — JWT verification, attaches user to `req`
- **[NEW]** `backend/src/middleware/role.middleware.ts` — `requireRole(...roles)` factory
- **[NEW]** `backend/src/middleware/error.middleware.ts` — centralized error handler
- **[NEW]** `backend/src/middleware/validate.middleware.ts` — Joi schema validation middleware
- **[NEW]** `backend/src/controllers/auth.controller.ts` — login endpoint
- **[NEW]** `backend/src/services/auth.service.ts` — password verification, JWT generation
- **[NEW]** `backend/src/repositories/user.repository.ts` — user DB queries
- **[NEW]** `backend/src/validations/auth.validation.ts` — login schema
- **[NEW]** `backend/src/routes/auth.routes.ts` — POST /api/auth/login
- **[NEW]** `backend/src/types/express.d.ts` — extend Express Request with user
- **[NEW]** `backend/src/utils/api-response.ts` — consistent response helpers

---

### Phase 9-13: Business Modules (Backend)

#### Customer Module
- **[NEW]** `controllers/customer.controller.ts` — CRUD + search/filter/pagination
- **[NEW]** `services/customer.service.ts` — business logic
- **[NEW]** `repositories/customer.repository.ts` — parameterized SQL queries
- **[NEW]** `validations/customer.validation.ts` — Joi schemas
- **[NEW]** `routes/customer.routes.ts` — RESTful routes with auth + role middleware
- **[NEW]** `controllers/followup.controller.ts` — create/list follow-ups
- **[NEW]** `services/followup.service.ts`
- **[NEW]** `repositories/followup.repository.ts`

#### Product Module
- Same pattern: controller → service → repository → validation → routes
- Duplicate SKU detection (409 Conflict)

#### Inventory Module
- **[NEW]** `controllers/inventory.controller.ts` — stats, movements, add movement
- **[NEW]** `services/inventory.service.ts` — low-stock logic, stock adjustment with movement record
- **[NEW]** `repositories/inventory.repository.ts`

#### Challan Module (Critical Business Logic)
- **[NEW]** `controllers/challan.controller.ts` — create, list, get, confirm, cancel
- **[NEW]** `services/challan.service.ts` — **THE** critical service:
  - Draft creation: no stock change
  - Confirmation: PostgreSQL transaction → check all items → verify stock → deduct → create OUT movements → update status → COMMIT/ROLLBACK
  - Cancellation: transaction → reverse stock → create IN movements (if already confirmed)
  - Insufficient stock: proper error with product details
- **[NEW]** `repositories/challan.repository.ts`
- **[NEW]** `validations/challan.validation.ts`

#### Dashboard
- **[NEW]** `controllers/dashboard.controller.ts` — aggregated stats from DB
- **[NEW]** `services/dashboard.service.ts`

---

### Phase 14-22: Frontend Implementation

#### Layout & Design System
- **[NEW]** `styles/variables.css` — CSS custom properties (colors, spacing, typography, shadows)
- **[NEW]** `styles/global.css` — base reset, typography, responsive utilities
- **[NEW]** `components/layout/Sidebar.tsx` — role-aware navigation
- **[NEW]** `components/layout/Topbar.tsx` — user info, logout
- **[NEW]** `components/layout/Layout.tsx` — sidebar + topbar + content wrapper
- **[NEW]** `components/common/` — StatusBadge, LoadingSpinner, EmptyState, ErrorState, ConfirmDialog, Toast, Pagination
- **[NEW]** `components/tables/DataTable.tsx` — reusable sortable/filterable table
- **[NEW]** `components/forms/` — FormInput, FormSelect, FormTextarea, SearchBar

#### Auth & Context
- **[NEW]** `context/AuthContext.tsx` — JWT storage, user state, login/logout
- **[NEW]** `services/api.ts` — Axios instance with interceptors (auth header, error handling)
- **[NEW]** `routes/ProtectedRoute.tsx` — redirect if unauthenticated
- **[NEW]** `routes/RoleRoute.tsx` — redirect if unauthorized role

#### Pages
- **[NEW]** `pages/auth/LoginPage.tsx` — professional login form
- **[NEW]** `pages/dashboard/DashboardPage.tsx` — stats cards + tables
- **[NEW]** `pages/customers/CustomerListPage.tsx` — search, filter, paginate
- **[NEW]** `pages/customers/CustomerFormPage.tsx` — create/edit
- **[NEW]** `pages/customers/CustomerDetailPage.tsx` — info + follow-ups
- **[NEW]** `pages/products/ProductListPage.tsx` — search, filter, low-stock indicators
- **[NEW]** `pages/products/ProductFormPage.tsx` — create/edit with SKU validation
- **[NEW]** `pages/inventory/InventoryPage.tsx` — summary + stock table + movements
- **[NEW]** `pages/challans/ChallanListPage.tsx` — list with status filters
- **[NEW]** `pages/challans/ChallanCreatePage.tsx` — dynamic product rows, confirm dialog
- **[NEW]** `pages/challans/ChallanDetailPage.tsx` — snapshot data display, actions

---

### Phase 23-27: Testing, Documentation, Deployment

- **[MODIFY]** [README.md](file:///D:/mini-erp-crm/README.md) — full professional documentation
- **[MODIFY]** [docs/architecture.md](file:///D:/mini-erp-crm/docs/architecture.md)
- **[MODIFY]** [docs/database-design.md](file:///D:/mini-erp-crm/docs/database-design.md)
- **[MODIFY]** [docs/api-documentation.md](file:///D:/mini-erp-crm/docs/api-documentation.md)
- **[MODIFY]** [Mini-ERP-CRM.postman_collection.json](file:///D:/mini-erp-crm/postman/Mini-ERP-CRM.postman_collection.json)

---

## Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| **`pg` (raw SQL) over an ORM** | Assignment requires demonstrating SQL knowledge. Parameterized queries prevent injection. Repository pattern keeps SQL isolated. |
| **Joi for validation** | Mature, expressive, widely used in Express projects. Reusable schemas. |
| **CSS custom properties (no Tailwind)** | Per project rules. Clean, maintainable, interview-explainable. |
| **Axios with interceptors** | Centralized auth header injection and error handling. |
| **Challan number generation** | `CH-YYYY-NNNN` using MAX query + 1, within the confirmation transaction to avoid gaps. |
| **Stock snapshot in challan_items** | Preserves historical accuracy. Old challans show original product data even after product updates. |
| **CHECK constraint for stock ≥ 0** | Database-level protection against negative stock, in addition to application-level checks. |

---

## Open Questions

> [!IMPORTANT]
> **PostgreSQL Availability**: Do you already have PostgreSQL installed locally? If not, I'll include instructions for installing it. Alternatively, you can use a free cloud instance (Neon, Supabase, etc.) during development.

> [!IMPORTANT]
> **Test Credentials**: I plan to use the following seeded test accounts. Please confirm these are acceptable:
> - `admin@erp.com` / `Admin@123` (ADMIN)
> - `sales@erp.com` / `Sales@123` (SALES)
> - `warehouse@erp.com` / `Warehouse@123` (WAREHOUSE)
> - `accounts@erp.com` / `Accounts@123` (ACCOUNTS)

> [!NOTE]
> **Challan Cancellation**: The spec says "if cancellation logic is not implemented, document it as a known limitation." I plan to **implement it** with proper stock reversal (IN movements) inside a transaction. If a challan is still Draft, cancellation simply sets status to Cancelled with no stock change.

## Verification Plan

### Automated Tests
- Backend will be tested via the Postman collection
- I will manually verify all critical flows listed in the spec

### Manual Verification
- Start backend → verify DB connection
- Run seed script → verify users/customers/products
- Test login for all 4 roles
- Test full customer CRUD + follow-ups
- Test product CRUD + duplicate SKU rejection
- Test stock movements (IN/OUT)
- Test challan creation → draft (stock unchanged) → confirm (stock reduced) → verify movement records
- Test insufficient stock rejection
- Test product snapshot preservation
- Test role-based access (403 on unauthorized endpoints)
- Test frontend responsiveness at multiple viewport sizes
