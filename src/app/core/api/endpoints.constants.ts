// API Endpoints Constants
export const AUTH_ENDPOINTS = {
  LOGIN: '/auth/api/auth/login',
  REGISTER: '/auth/api/auth/register',
  REFRESH: '/auth/api/auth/refresh',
  LOGOUT: '/auth/api/auth/logout',
} as const;

export const USERS_ENDPOINTS = {
  BASE: '/auth/api/users',
  ME: '/auth/api/users/me',
  BY_ID: (id: string) => `/auth/api/users/${id}`,
  ROLES: (id: string) => `/auth/api/users/${id}/roles`,
} as const;

export const ROLES_ENDPOINTS = {
  BASE: '/auth/api/roles',
  BY_ID: (id: string) => `/auth/api/roles/${id}`,
  PERMISSIONS: (id: string) => `/auth/api/roles/${id}/permissions`,
} as const;

export const PERMISSIONS_ENDPOINTS = {
  BASE: '/auth/api/permissions',
  CHECK: '/auth/api/permissions/check',
  BY_ID: (id: string) => `/auth/api/permissions/${id}`,
} as const;

export const INVENTORY_ENDPOINTS = {
  PRODUCTS: '/inventory/api/inventory/products',
  PRODUCT_BY_ID: (id: string) => `/inventory/api/inventory/products/${id}`,
  WAREHOUSES: '/inventory/api/inventory/warehouses',
  WAREHOUSE_BY_ID: (id: string) => `/inventory/api/inventory/warehouses/${id}`,
  WAREHOUSE_STOCKS: '/inventory/api/inventory/warehouse-stocks',
  TRANSACTIONS: '/inventory/api/inventory/transactions',
  STOCK_OPERATIONS: '/inventory/api/inventory/stock-operations',
} as const;

export const SALES_ENDPOINTS = {
  CUSTOMERS: '/sales/api/sales/customers',
  CUSTOMER_BY_ID: (id: string) => `/sales/api/sales/customers/${id}`,
  ORDERS: '/sales/api/sales/orders',
  ORDER_BY_ID: (id: string) => `/sales/api/sales/orders/${id}`,
} as const;

export const PURCHASING_ENDPOINTS = {
  ORDERS: '/purchasing/api/purchasing/orders',
  ORDER_BY_ID: (id: string) => `/purchasing/api/purchasing/orders/${id}`,
} as const;
