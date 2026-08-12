export type UserRole = 'ADMIN' | 'SALES' | 'WAREHOUSE' | 'ACCOUNTS';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Customer {
  id: string;
  customer_name: string;
  mobile_number: string;
  email: string | null;
  business_name: string;
  gst_number: string | null;
  customer_type: 'Retail' | 'Wholesale' | 'Distributor';
  address: string | null;
  status: 'Lead' | 'Active' | 'Inactive';
  follow_up_date: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface FollowUp {
  id: string;
  customer_id: string;
  note: string;
  follow_up_date: string | null;
  created_by: string | null;
  creator_name: string | null;
  created_at: string;
}

export interface Product {
  id: string;
  product_name: string;
  sku: string;
  category: string;
  unit_price: number;
  current_stock: number;
  minimum_stock_quantity: number;
  warehouse_location: string | null;
  created_at: string;
  updated_at: string;
}

export interface StockMovement {
  id: string;
  product_id: string;
  quantity: number;
  movement_type: 'IN' | 'OUT';
  reason: string;
  created_by: string | null;
  created_at: string;
  product_name?: string;
  sku?: string;
  creator_name?: string;
}

export interface Challan {
  id: string;
  challan_number: string;
  customer_id: string;
  total_quantity: number;
  status: 'Draft' | 'Confirmed' | 'Cancelled';
  created_by: string | null;
  created_at: string;
  updated_at: string;
  customer_name?: string;
  business_name?: string;
  creator_name?: string;
  items?: ChallanItem[];
}

export interface ChallanItem {
  id: string;
  challan_id: string;
  product_id: string;
  product_name_snapshot: string;
  sku_snapshot: string;
  unit_price_snapshot: number;
  quantity: number;
  created_at: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  pagination?: PaginationMeta;
  message?: string;
  details?: unknown;
}

export interface DashboardStats {
  customers: { total: number; active: number; leads: number };
  products: { total: number; total_stock: number };
  challans: { draft: number; confirmed: number; cancelled: number };
  lowStockCount: number;
  recentChallans: Challan[];
  recentMovements: StockMovement[];
}
