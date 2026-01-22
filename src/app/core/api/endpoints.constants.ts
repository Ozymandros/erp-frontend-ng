// API Gateway routing constants based on legacy Ocelot configuration
// Gateway Base URL: http://localhost:5000 (without /api suffix)

const AUTH_SERVICE_BASE = "/auth/api";
const INVENTORY_SERVICE_BASE = "/inventory/api/inventory";
const ORDERS_SERVICE_BASE = "/orders/api";
const SALES_SERVICE_BASE = "/sales/api/sales";
const PURCHASING_SERVICE_BASE = "/purchasing/api/purchasing";

export const AUTH_ENDPOINTS = {
  LOGIN: `${AUTH_SERVICE_BASE}/auth/login`,
  REGISTER: `${AUTH_SERVICE_BASE}/auth/register`,
  REFRESH: `${AUTH_SERVICE_BASE}/auth/refresh`,
  LOGOUT: `${AUTH_SERVICE_BASE}/auth/logout`,
} as const;

export const USERS_ENDPOINTS = {
  BASE: `${AUTH_SERVICE_BASE}/users`,
  ME: `${AUTH_SERVICE_BASE}/users/me`,
  PAGINATED: `${AUTH_SERVICE_BASE}/users/paginated`,
  BY_ID: (id: string) => `${AUTH_SERVICE_BASE}/users/${id}`,
  ROLES: (id: string) => `${AUTH_SERVICE_BASE}/users/${id}/roles`,
} as const;

export const ROLES_ENDPOINTS = {
  BASE: `${AUTH_SERVICE_BASE}/roles`,
  PAGINATED: `${AUTH_SERVICE_BASE}/roles/paginated`,
  BY_ID: (id: string) => `${AUTH_SERVICE_BASE}/roles/${id}`,
  PERMISSIONS: (id: string) => `${AUTH_SERVICE_BASE}/roles/${id}/permissions`,
} as const;

export const PERMISSIONS_ENDPOINTS = {
  BASE: `${AUTH_SERVICE_BASE}/permissions`,
  PAGINATED: `${AUTH_SERVICE_BASE}/permissions/paginated`,
  CHECK: `${AUTH_SERVICE_BASE}/permissions/check`,
  BY_ID: (id: string) => `${AUTH_SERVICE_BASE}/permissions/${id}`,
} as const;

export const INVENTORY_ENDPOINTS = {
  PRODUCTS: `${INVENTORY_SERVICE_BASE}/products`,
  PRODUCT_PAGINATED: `${INVENTORY_SERVICE_BASE}/products/paginated`,
  PRODUCT_BY_ID: (id: string) => `${INVENTORY_SERVICE_BASE}/products/${id}`,
  WAREHOUSES: `${INVENTORY_SERVICE_BASE}/warehouses`,
  WAREHOUSE_PAGINATED: `${INVENTORY_SERVICE_BASE}/warehouses/paginated`,
  WAREHOUSE_BY_ID: (id: string) => `${INVENTORY_SERVICE_BASE}/warehouses/${id}`,
  WAREHOUSE_STOCKS: `${INVENTORY_SERVICE_BASE}/warehouse-stocks`,
  TRANSACTIONS: `${INVENTORY_SERVICE_BASE}/transactions`,
  TRANSACTION_PAGINATED: `${INVENTORY_SERVICE_BASE}/transactions/paginated`,
  STOCK_OPERATIONS: `${INVENTORY_SERVICE_BASE}/stock-operations`,
} as const;

export const SALES_ENDPOINTS = {
  CUSTOMERS: `${SALES_SERVICE_BASE}/customers`,
  CUSTOMER_BY_ID: (id: string) => `${SALES_SERVICE_BASE}/customers/${id}`,
  ORDERS: `${SALES_SERVICE_BASE}/orders`,
  ORDER_BY_ID: (id: string) => `${SALES_SERVICE_BASE}/orders/${id}`,
} as const;

export const PURCHASING_ENDPOINTS = {
  ORDERS: `${PURCHASING_SERVICE_BASE}/orders`,
  ORDER_BY_ID: (id: string) => `${PURCHASING_SERVICE_BASE}/orders/${id}`,
} as const;

export const ORDERS_ENDPOINTS = {
  BASE: `${ORDERS_SERVICE_BASE}/orders`,
  BY_ID: (id: string) => `${ORDERS_SERVICE_BASE}/orders/${id}`,
} as const;
