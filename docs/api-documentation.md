# API Documentation

## Base URL
`/api`

## Authentication

All protected routes require a Bearer token in the Authorization header:
`Authorization: Bearer <token>`

### Endpoints

#### `POST /auth/login`
Authenticates a user and returns a JWT.
- **Body**: `{ "email": "...", "password": "..." }`
- **Response**: `{ "token": "...", "user": { ... } }`

#### `GET /auth/me`
Returns the currently authenticated user's profile.

---

## Customers

#### `GET /customers`
Returns a list of all customers. Supports pagination and filtering.

#### `GET /customers/:id`
Returns details of a specific customer, including their follow-up history.

#### `POST /customers`
Creates a new customer.
- **Body**: `{ customer_name, mobile_number, business_name, customer_type, ... }`

#### `PUT /customers/:id`
Updates an existing customer.

#### `DELETE /customers/:id`
Deletes a customer.

#### `POST /customers/:id/followups`
Adds a follow-up note to a customer.
- **Body**: `{ note, follow_up_date }`

---

## Products

#### `GET /products`
Returns a list of products.

#### `GET /products/:id`
Returns details of a specific product.

#### `POST /products`
Creates a new product in the catalog.
- **Body**: `{ product_name, sku, category, unit_price, minimum_stock_quantity, ... }`

#### `PUT /products/:id`
Updates an existing product.

#### `DELETE /products/:id`
Deletes a product.

---

## Inventory

#### `GET /inventory/low-stock`
Returns a list of products where `current_stock` is less than or equal to `minimum_stock_quantity`.

#### `GET /inventory/movements`
Returns a history of stock movements (IN/OUT).

#### `POST /inventory/movement`
Records a stock movement, updating the product's `current_stock`.
- **Body**: `{ product_id, quantity, movement_type: 'IN' | 'OUT', reason }`

---

## Challans

#### `GET /challans`
Returns a list of all challans.

#### `GET /challans/:id`
Returns a specific challan including its line items.

#### `POST /challans`
Generates a new challan.
- **Body**: `{ customer_id, items: [{ product_id, quantity }] }`

#### `PUT /challans/:id/status`
Updates the status of a challan (e.g., from `Draft` to `Confirmed`).
- **Body**: `{ status }`

---

## Dashboard

#### `GET /dashboard/stats`
Returns aggregated statistics for the main dashboard (e.g., total customers, low stock count, active challans, recent activities).

---

## Users

#### `GET /users`
Returns a list of system users. (Requires Admin role)

#### `POST /users`
Creates a new user. (Requires Admin role)
- **Body**: `{ name, email, password, role }`
