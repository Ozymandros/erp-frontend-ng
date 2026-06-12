// API Gateway routing constants based on legacy Ocelot configuration
// Gateway Base URL: http://localhost:5000 (without /api suffix)

const AUTH_SERVICE_BASE = "/auth/api";
const INVENTORY_SERVICE_BASE = "/inventory/api/inventory";
const ORDERS_SERVICE_BASE = "/orders/api";
const SALES_SERVICE_BASE = "/sales/api/sales";
const PURCHASING_SERVICE_BASE = "/purchasing/api/purchasing";
const CRM_SERVICE_BASE = "/crm/api/crm";
const BILLING_SERVICE_BASE = "/billing/api/billing";
const AUDIT_SERVICE_BASE = "/audit/api/audit";

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
  SUPPLIERS: `${PURCHASING_SERVICE_BASE}/suppliers`,
  SUPPLIER_BY_ID: (id: string) => `${PURCHASING_SERVICE_BASE}/suppliers/${id}`,
} as const;

export const ORDERS_ENDPOINTS = {
  BASE: `${ORDERS_SERVICE_BASE}/orders`,
  BY_ID: (id: string) => `${ORDERS_SERVICE_BASE}/orders/${id}`,
} as const;

export const CRM_ENDPOINTS = {
  LEADS: `${CRM_SERVICE_BASE}/leads`,
  LEAD_BY_ID: (id: string) => `${CRM_SERVICE_BASE}/leads/${id}`,
  LEAD_QUALIFY: (id: string) => `${CRM_SERVICE_BASE}/leads/${id}/qualify`,
  OPPORTUNITIES: `${CRM_SERVICE_BASE}/opportunities`,
  OPPORTUNITY_BY_ID: (id: string) => `${CRM_SERVICE_BASE}/opportunities/${id}`,
  OPPORTUNITY_FORECAST: `${CRM_SERVICE_BASE}/opportunities/forecast`,
  OPPORTUNITY_FORECAST_BY_ID: (id: string) => `${CRM_SERVICE_BASE}/opportunities/${id}/forecast`,
  OPPORTUNITY_MOVE_STAGE: (id: string) => `${CRM_SERVICE_BASE}/opportunities/${id}/move-stage`,
  OPPORTUNITY_MARK_WON: (id: string) => `${CRM_SERVICE_BASE}/opportunities/${id}/mark-won`,
  OPPORTUNITY_MARK_LOST: (id: string) => `${CRM_SERVICE_BASE}/opportunities/${id}/mark-lost`,
  OPPORTUNITY_LINES: (id: string) => `${CRM_SERVICE_BASE}/opportunities/${id}/lines`,
  OPPORTUNITY_LINE_BY_ID: (id: string, lineId: string) =>
    `${CRM_SERVICE_BASE}/opportunities/${id}/lines/${lineId}`,
  ACTIVITIES: `${CRM_SERVICE_BASE}/activities`,
  ACTIVITY_BY_ID: (id: string) => `${CRM_SERVICE_BASE}/activities/${id}`,
  ACTIVITY_COMPLETE: (id: string) => `${CRM_SERVICE_BASE}/activities/${id}/complete`,
  ACCOUNTS: `${CRM_SERVICE_BASE}/accounts`,
  ACCOUNT_BY_ID: (id: string) => `${CRM_SERVICE_BASE}/accounts/${id}`,
  ACCOUNT_OWNER: (id: string) => `${CRM_SERVICE_BASE}/accounts/${id}/owner`,
  CONTACTS: `${CRM_SERVICE_BASE}/contacts`,
  CONTACT_BY_ID: (id: string) => `${CRM_SERVICE_BASE}/contacts/${id}`,
  ACCOUNT_CONTACTS: (accountId: string) => `${CRM_SERVICE_BASE}/accounts/${accountId}/contacts`,
  CONTACT_SET_PRIMARY: (accountId: string, contactId: string) =>
    `${CRM_SERVICE_BASE}/accounts/${accountId}/contacts/${contactId}/set-primary`,
} as const;

export const BILLING_ENDPOINTS = {
  INVOICES: `${BILLING_SERVICE_BASE}/invoices`,
  INVOICE_BY_ID: (id: string) => `${BILLING_SERVICE_BASE}/invoices/${id}`,
  INVOICES_BY_CUSTOMER: (customerId: string) => `${BILLING_SERVICE_BASE}/invoices/customer/${customerId}`,
  INVOICES_BY_ORDER: (orderId: string) => `${BILLING_SERVICE_BASE}/invoices/order/${orderId}`,
  INVOICES_EXPORT_XLSX: `${BILLING_SERVICE_BASE}/invoices/export-xlsx`,
  INVOICES_EXPORT_PDF: `${BILLING_SERVICE_BASE}/invoices/export-pdf`,
  INVOICE_ISSUE: (id: string) => `${BILLING_SERVICE_BASE}/invoices/${id}/issue`,
  INVOICE_PAYMENTS: (id: string) => `${BILLING_SERVICE_BASE}/invoices/${id}/payments`,
  INVOICE_CANCEL: (id: string) => `${BILLING_SERVICE_BASE}/invoices/${id}/cancel`,
  INVOICE_CREDIT_NOTES: (id: string) => `${BILLING_SERVICE_BASE}/invoices/${id}/credit-notes`,
  CREDIT_NOTES: `${BILLING_SERVICE_BASE}/credit-notes`,
  CREDIT_NOTE_BY_ID: (id: string) => `${BILLING_SERVICE_BASE}/credit-notes/${id}`,
  CREDIT_NOTES_BY_INVOICE: (invoiceId: string) => `${BILLING_SERVICE_BASE}/credit-notes/invoice/${invoiceId}`,
  CREDIT_NOTES_EXPORT_XLSX: `${BILLING_SERVICE_BASE}/credit-notes/export-xlsx`,
  CREDIT_NOTES_EXPORT_PDF: `${BILLING_SERVICE_BASE}/credit-notes/export-pdf`,
  PAYMENTS: `${BILLING_SERVICE_BASE}/payments`,
  PAYMENT_BY_ID: (id: string) => `${BILLING_SERVICE_BASE}/payments/${id}`,
  PAYMENTS_BY_INVOICE: (invoiceId: string) => `${BILLING_SERVICE_BASE}/payments/invoice/${invoiceId}`,
  PAYMENTS_EXPORT_XLSX: `${BILLING_SERVICE_BASE}/payments/export-xlsx`,
  PAYMENTS_EXPORT_PDF: `${BILLING_SERVICE_BASE}/payments/export-pdf`,
} as const;

export const AUDIT_ENDPOINTS = {
  ENTITY_CHANGES: `${AUDIT_SERVICE_BASE}/entity-changes`,
  BY_ID: (id: string) => `${AUDIT_SERVICE_BASE}/entity-changes/${id}`,
  BY_ENTITY: (entityName: string, entityId: string) =>
    `${AUDIT_SERVICE_BASE}/entity-changes/by-entity/${encodeURIComponent(entityName)}/${entityId}`,
} as const;
