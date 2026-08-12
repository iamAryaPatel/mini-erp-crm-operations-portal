# Mini ERP + CRM Operations Portal

A full-stack operations portal for wholesale and distribution teams. It brings customer relationships, product inventory, delivery challans, and business reporting into a single role-aware workspace.

## Highlights

- Role-based access for Admin, Sales, Warehouse, and Accounts users
- Customer CRM with lead status, follow-ups, and contact details
- Product catalogue and stock movement tracking
- Low-stock visibility and inventory controls
- Sales challan creation, confirmation, and item-level history
- Dashboard metrics for operational monitoring
- JWT authentication, request validation, rate limiting, and security headers

## Tech stack

- Frontend: React, TypeScript, Vite, React Router, Axios, Lucide
- Backend: Node.js, Express, TypeScript, PostgreSQL
- Authentication: JSON Web Tokens and bcrypt password hashing

## Getting started

### Prerequisites

- Node.js 20 or later
- PostgreSQL 14 or later

### Install and configure

1. Install the dependencies:

   ```bash
   npm run install:all
   ```

2. Create a PostgreSQL database named `mini_erp_crm`.

3. Copy the environment templates and update `DATABASE_URL` and `JWT_SECRET` as appropriate:

   ```bash
   copy backend\.env.example backend\.env
   copy frontend\.env.example frontend\.env
   ```

4. Seed the database. This recreates the schema and loads demo data:

   ```bash
   npm run db:seed
   ```

5. Start the API and web application in separate terminals:

   ```bash
   npm run dev:backend
   npm run dev:frontend
   ```

Open [http://localhost:5173](http://localhost:5173). The API health endpoint is available at `http://localhost:5000/api/health`.

## Demo access

Use any seeded account with the password `Admin@123`:

| Role | Email |
| --- | --- |
| Admin | `admin1@erp-demo.com` |
| Sales | `sales1@erp-demo.com` |
| Warehouse | `warehouse1@erp-demo.com` |
| Accounts | `accounts1@erp-demo.com` |

Demo credentials are intended for local development only. Set a strong, unique `JWT_SECRET` before deployment.

## Available scripts

| Command | Purpose |
| --- | --- |
| `npm run dev:frontend` | Run the Vite frontend on port 5173 |
| `npm run dev:backend` | Run the Express API on port 5000 |
| `npm run build:frontend` | Type-check and build the frontend |
| `npm run build:backend` | Build the backend TypeScript source |
| `npm run db:seed` | Recreate the schema and seed demo data |

## Project structure

```text
frontend/   React user interface
backend/    Express REST API and database seed script
database/   PostgreSQL schema
docs/       Project documentation
postman/    API collection
```

## License

No license has been selected yet. Add one before distributing or accepting external contributions.
