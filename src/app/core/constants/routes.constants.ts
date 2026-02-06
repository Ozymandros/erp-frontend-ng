export const APP_ROUTES = {
  AUTH: {
    LOGIN: 'login',
    REGISTER: 'register',
  },
  DASHBOARD: '',
  PROFILE: 'profile',
  USERS: {
    ROOT: 'users',
    DETAIL: 'users/:id',
  },
  ROLES: {
    ROOT: 'roles',
    DETAIL: 'roles/:id',
  },
  PERMISSIONS: {
    ROOT: 'permissions',
  },
  INVENTORY: {
    PRODUCTS: 'inventory/products',
    PRODUCT_DETAIL: 'inventory/products/:id',
    WAREHOUSES: 'inventory/warehouses',
    WAREHOUSE_DETAIL: 'inventory/warehouses/:id',
    WAREHOUSE_STOCKS: 'inventory/warehouse-stocks',
    TRANSACTIONS: 'inventory/transactions',
    STOCK_OPERATIONS: 'inventory/stock-operations',
  },
  SALES: {
    CUSTOMERS: 'sales/customers',
    CUSTOMER_DETAIL: 'sales/customers/:id',
    ORDERS: 'sales/orders',
    ORDER_DETAIL: 'sales/orders/:id',
  },
  PURCHASING: {
    SUPPLIERS: 'purchasing/suppliers',
    SUPPLIER_DETAIL: 'purchasing/suppliers/:id',
    ORDERS: 'purchasing/orders',
    ORDER_DETAIL: 'purchasing/orders/:id',
  },
} as const;

export const APP_PATHS = {
  AUTH: {
    LOGIN: `/${APP_ROUTES.AUTH.LOGIN}`,
    REGISTER: `/${APP_ROUTES.AUTH.REGISTER}`,
  },
  DASHBOARD: '/',
  PROFILE: `/${APP_ROUTES.PROFILE}`,
  USERS: {
    ROOT: `/${APP_ROUTES.USERS.ROOT}`,
    DETAIL: (id: string) => `/${APP_ROUTES.USERS.ROOT}/${id}`,
  },
  ROLES: {
    ROOT: `/${APP_ROUTES.ROLES.ROOT}`,
    DETAIL: (id: string) => `/${APP_ROUTES.ROLES.ROOT}/${id}`,
  },
  PERMISSIONS: {
    ROOT: `/${APP_ROUTES.PERMISSIONS.ROOT}`,
  },
  INVENTORY: {
    PRODUCTS: `/${APP_ROUTES.INVENTORY.PRODUCTS}`,
    PRODUCT_DETAIL: (id: string) => `/${APP_ROUTES.INVENTORY.PRODUCTS}/${id}`,
    WAREHOUSES: `/${APP_ROUTES.INVENTORY.WAREHOUSES}`,
    WAREHOUSE_DETAIL: (id: string) => `/${APP_ROUTES.INVENTORY.WAREHOUSES}/${id}`,
    WAREHOUSE_STOCKS: `/${APP_ROUTES.INVENTORY.WAREHOUSE_STOCKS}`,
    TRANSACTIONS: `/${APP_ROUTES.INVENTORY.TRANSACTIONS}`,
    STOCK_OPERATIONS: `/${APP_ROUTES.INVENTORY.STOCK_OPERATIONS}`,
  },
  SALES: {
    CUSTOMERS: `/${APP_ROUTES.SALES.CUSTOMERS}`,
    CUSTOMER_DETAIL: (id: string) => `/${APP_ROUTES.SALES.CUSTOMERS}/${id}`,
    ORDERS: `/${APP_ROUTES.SALES.ORDERS}`,
    ORDER_DETAIL: (id: string) => `/${APP_ROUTES.SALES.ORDERS}/${id}`,
  },
  PURCHASING: {
    SUPPLIERS: `/${APP_ROUTES.PURCHASING.SUPPLIERS}`,
    SUPPLIER_DETAIL: (id: string) => `/${APP_ROUTES.PURCHASING.SUPPLIERS}/${id}`,
    ORDERS: `/${APP_ROUTES.PURCHASING.ORDERS}`,
    ORDER_DETAIL: (id: string) => `/${APP_ROUTES.PURCHASING.ORDERS}/${id}`,
  },
} as const;
