# Architecture

## Overview

The Mini ERP + CRM Operations Portal is a full-stack web application designed for wholesale and distribution teams. It unifies customer relationship management, product inventory, delivery challans, and operational reporting into a single, cohesive platform.

The system is built on a standard 3-tier architecture:
1. **Frontend (Client)**: A single-page application (SPA) built with React and Vite.
2. **Backend (API)**: A RESTful API built with Node.js and Express.
3. **Database**: A PostgreSQL relational database.

## Technology Stack

### Frontend
*   **Framework**: React 18
*   **Build Tool**: Vite
*   **Language**: TypeScript
*   **Routing**: React Router DOM
*   **HTTP Client**: Axios
*   **Styling**: Pure CSS with Variables
*   **Icons**: Lucide React

### Backend
*   **Runtime**: Node.js 20+
*   **Framework**: Express.js
*   **Language**: TypeScript
*   **Database Client**: `pg` (node-postgres)
*   **Authentication**: JSON Web Tokens (JWT)
*   **Password Hashing**: bcrypt

### Database
*   **Engine**: PostgreSQL 14+

## High-Level Data Flow

1.  The **Frontend** application (React SPA) runs in the user's browser.
2.  User interactions trigger HTTP requests (via Axios) to the **Backend API**.
3.  The API routes the request through middleware (authentication, authorization, payload validation).
4.  Controllers handle the business logic and interact with Repositories.
5.  Repositories execute SQL queries against the **PostgreSQL Database**.
6.  Data is returned through the layers back to the client as JSON responses.

## Authentication and Security

*   **JWT-based Auth**: Stateless authentication using JSON Web Tokens. Tokens are issued on login and sent in the `Authorization` header for subsequent requests.
*   **Role-Based Access Control (RBAC)**: Users are assigned specific roles (`ADMIN`, `SALES`, `WAREHOUSE`, `ACCOUNTS`), which dictate their permissions and the UI features they can access.
*   **Password Security**: User passwords are encrypted using `bcrypt` before storage.

## Project Structure

```text
mini-erp-crm/
├── backend/                  # Node.js + Express API
│   ├── src/
│   │   ├── config/           # Environment and DB config
│   │   ├── controllers/      # Request handlers
│   │   ├── db/               # Database setup and seed scripts
│   │   ├── middleware/       # Auth and validation middleware
│   │   ├── repositories/     # Data access layer (SQL queries)
│   │   ├── routes/           # API route definitions
│   │   ├── services/         # Business logic layer
│   │   ├── types/            # TypeScript type definitions
│   │   ├── utils/            # Helper functions
│   │   ├── validations/      # Request validation schemas (e.g. Zod/Joi)
│   │   ├── app.ts            # Express app initialization
│   │   └── server.ts         # Server entry point
│   └── package.json
│
├── frontend/                 # React + Vite Client
│   ├── src/
│   │   ├── components/       # Reusable UI components (Layout, Sidebar, etc.)
│   │   ├── context/          # React Context providers (Auth, Theme)
│   │   ├── pages/            # View components mapping to routes
│   │   ├── routes/           # Application routing and Protected Routes
│   │   ├── services/         # API client functions (Axios)
│   │   ├── styles/           # Global CSS and CSS variables
│   │   ├── types/            # TypeScript interfaces
│   │   ├── App.tsx           # Root component
│   │   └── main.tsx          # Application entry point
│   ├── index.html
│   └── package.json
│
├── database/                 # SQL schemas
│   └── schema.sql
├── docs/                     # Project documentation
├── postman/                  # Postman collection for API testing
└── README.md
```
