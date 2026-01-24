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
  EXPORT_XLSX: `${AUTH_SERVICE_BASE}/users/export-xlsx`,
  EXPORT_PDF: `${AUTH_SERVICE_BASE}/users/export-pdf`,
} as const;

export const ROLES_ENDPOINTS = {
  BASE: `${AUTH_SERVICE_BASE}/roles`,
  PAGINATED: `${AUTH_SERVICE_BASE}/roles/paginated`,
  BY_ID: (id: string) => `${AUTH_SERVICE_BASE}/roles/${id}`,
  PERMISSIONS: (id: string) => `${AUTH_SERVICE_BASE}/roles/${id}/permissions`,
  EXPORT_XLSX: `${AUTH_SERVICE_BASE}/roles/export-xlsx`,
  EXPORT_PDF: `${AUTH_SERVICE_BASE}/roles/export-pdf`,
} as const;

export const PERMISSIONS_ENDPOINTS = {
  BASE: `${AUTH_SERVICE_BASE}/permissions`,
  PAGINATED: `${AUTH_SERVICE_BASE}/permissions/paginated`,
  CHECK: `${AUTH_SERVICE_BASE}/permissions/check`,
  BY_ID: (id: string) => `${AUTH_SERVICE_BASE}/permissions/${id}`,
  EXPORT_XLSX: `${AUTH_SERVICE_BASE}/permissions/export-xlsx`,
  EXPORT_PDF: `${AUTH_SERVICE_BASE}/permissions/export-pdf`,
} as const;

export const INVENTORY_ENDPOINTS = {
  PRODUCTS: `${INVENTORY_SERVICE_BASE}/products`,
  PRODUCT_PAGINATED: `${INVENTORY_SERVICE_BASE}/products/paginated`,
  PRODUCT_BY_ID: (id: string) => `${INVENTORY_SERVICE_BASE}/products/${id}`,
  PRODUCTS_EXPORT_XLSX: `${INVENTORY_SERVICE_BASE}/products/export-xlsx`,
  PRODUCTS_EXPORT_PDF: `${INVENTORY_SERVICE_BASE}/products/export-pdf`,
  WAREHOUSES: `${INVENTORY_SERVICE_BASE}/warehouses`,
  WAREHOUSE_PAGINATED: `${INVENTORY_SERVICE_BASE}/warehouses/paginated`,
  WAREHOUSE_BY_ID: (id: string) => `${INVENTORY_SERVICE_BASE}/warehouses/${id}`,
  WAREHOUSES_EXPORT_XLSX: `${INVENTORY_SERVICE_BASE}/warehouses/export-xlsx`,
  WAREHOUSES_EXPORT_PDF: `${INVENTORY_SERVICE_BASE}/warehouses/export-pdf`,
  WAREHOUSE_STOCKS: `${INVENTORY_SERVICE_BASE}/warehouse-stocks`,
  WAREHOUSE_STOCKS_EXPORT_XLSX: `${INVENTORY_SERVICE_BASE}/warehouse-stocks/export-xlsx`,
  WAREHOUSE_STOCKS_EXPORT_PDF: `${INVENTORY_SERVICE_BASE}/warehouse-stocks/export-pdf`,
  TRANSACTIONS: `${INVENTORY_SERVICE_BASE}/transactions`,
  TRANSACTION_PAGINATED: `${INVENTORY_SERVICE_BASE}/transactions/paginated`,
  TRANSACTIONS_EXPORT_XLSX: `${INVENTORY_SERVICE_BASE}/transactions/export-xlsx`,
  TRANSACTIONS_EXPORT_PDF: `${INVENTORY_SERVICE_BASE}/transactions/export-pdf`,
  STOCK_OPERATIONS: `${INVENTORY_SERVICE_BASE}/stock-operations`,
} as const;

export const SALES_ENDPOINTS = {
  CUSTOMERS: `${SALES_SERVICE_BASE}/customers`,
  CUSTOMER_BY_ID: (id: string) => `${SALES_SERVICE_BASE}/customers/${id}`,
  CUSTOMERS_EXPORT_XLSX: `${SALES_SERVICE_BASE}/customers/export-xlsx`,
  CUSTOMERS_EXPORT_PDF: `${SALES_SERVICE_BASE}/customers/export-pdf`,
  ORDERS: `${SALES_SERVICE_BASE}/orders`,
  ORDER_BY_ID: (id: string) => `${SALES_SERVICE_BASE}/orders/${id}`,
  ORDERS_EXPORT_XLSX: `${SALES_SERVICE_BASE}/orders/export-xlsx`,
  ORDERS_EXPORT_PDF: `${SALES_SERVICE_BASE}/orders/export-pdf`,
  CREATE_QUOTE: `${SALES_SERVICE_BASE}/orders/quote`,
  CONFIRM_QUOTE: (id: string) => `${SALES_SERVICE_BASE}/orders/quote/${id}/confirm`,
  CHECK_STOCK: `${SALES_SERVICE_BASE}/orders/check-stock`,
} as const;

export const PURCHASING_ENDPOINTS = {
  ORDERS: `${PURCHASING_SERVICE_BASE}/orders`,
  ORDER_BY_ID: (id: string) => `${PURCHASING_SERVICE_BASE}/orders/${id}`,
  APPROVE: (id: string) => `${PURCHASING_SERVICE_BASE}/orders/${id}/approve`,
  RECEIVE: (id: string) => `${PURCHASING_SERVICE_BASE}/orders/${id}/receive`,
  EXPORT_XLSX: `${PURCHASING_SERVICE_BASE}/orders/export-xlsx`,
  EXPORT_PDF: `${PURCHASING_SERVICE_BASE}/orders/export-pdf`,
} as const;

export const ORDERS_ENDPOINTS = {
  BASE: `${ORDERS_SERVICE_BASE}/orders`,
  BY_ID: (id: string) => `${ORDERS_SERVICE_BASE}/orders/${id}`,
} as const;
