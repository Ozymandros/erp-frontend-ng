import { PERMISSION_MODULES, PERMISSION_ACTIONS, createPermission, RoutePermission } from '../constants/permissions';
import { APP_ROUTES, APP_PATHS } from '../constants/routes.constants';

export const ROUTE_PERMISSIONS: Record<string, RoutePermission> = {
  [APP_PATHS.USERS.ROOT]: createPermission(PERMISSION_MODULES.USERS, PERMISSION_ACTIONS.READ),
  [`/${APP_ROUTES.USERS.DETAIL}`]: createPermission(PERMISSION_MODULES.USERS, PERMISSION_ACTIONS.READ),
  [APP_PATHS.ROLES.ROOT]: createPermission(PERMISSION_MODULES.ROLES, PERMISSION_ACTIONS.READ),
  [`/${APP_ROUTES.ROLES.DETAIL}`]: createPermission(PERMISSION_MODULES.ROLES, PERMISSION_ACTIONS.READ),
  [APP_PATHS.PERMISSIONS.ROOT]: createPermission(PERMISSION_MODULES.PERMISSIONS, PERMISSION_ACTIONS.READ),
  [APP_PATHS.INVENTORY.PRODUCTS]: createPermission(PERMISSION_MODULES.INVENTORY, PERMISSION_ACTIONS.READ),
  [`/${APP_ROUTES.INVENTORY.PRODUCT_DETAIL}`]: createPermission(PERMISSION_MODULES.INVENTORY, PERMISSION_ACTIONS.READ),
  [APP_PATHS.INVENTORY.WAREHOUSES]: createPermission(PERMISSION_MODULES.INVENTORY, PERMISSION_ACTIONS.READ),
  [`/${APP_ROUTES.INVENTORY.WAREHOUSE_DETAIL}`]: createPermission(PERMISSION_MODULES.INVENTORY, PERMISSION_ACTIONS.READ),
  [APP_PATHS.INVENTORY.WAREHOUSE_STOCKS]: createPermission(PERMISSION_MODULES.INVENTORY, PERMISSION_ACTIONS.READ),
  [APP_PATHS.INVENTORY.TRANSACTIONS]: createPermission(PERMISSION_MODULES.INVENTORY, PERMISSION_ACTIONS.READ),
  [APP_PATHS.INVENTORY.STOCK_OPERATIONS]: createPermission(PERMISSION_MODULES.INVENTORY, PERMISSION_ACTIONS.CREATE),
  [APP_PATHS.SALES.CUSTOMERS]: createPermission(PERMISSION_MODULES.SALES, PERMISSION_ACTIONS.READ),
  [`/${APP_ROUTES.SALES.CUSTOMER_DETAIL}`]: createPermission(PERMISSION_MODULES.SALES, PERMISSION_ACTIONS.READ),
  [APP_PATHS.SALES.ORDERS]: createPermission(PERMISSION_MODULES.SALES, PERMISSION_ACTIONS.READ),
  [`/${APP_ROUTES.SALES.ORDER_DETAIL}`]: createPermission(PERMISSION_MODULES.SALES, PERMISSION_ACTIONS.READ),
  [APP_PATHS.PURCHASING.SUPPLIERS]: createPermission(PERMISSION_MODULES.PURCHASING, PERMISSION_ACTIONS.READ),
  [`/${APP_ROUTES.PURCHASING.SUPPLIER_DETAIL}`]: createPermission(PERMISSION_MODULES.PURCHASING, PERMISSION_ACTIONS.READ),
  [APP_PATHS.PURCHASING.ORDERS]: createPermission(PERMISSION_MODULES.PURCHASING, PERMISSION_ACTIONS.READ),
  [`/${APP_ROUTES.PURCHASING.ORDER_DETAIL}`]: createPermission(PERMISSION_MODULES.PURCHASING, PERMISSION_ACTIONS.READ),
};

export function getRoutePermission(path: string): RoutePermission | undefined {
  // Try exact match first
  if (ROUTE_PERMISSIONS[path]) {
    return ROUTE_PERMISSIONS[path];
  }
  // Try matching dynamic routes (e.g., /users/:id -> /users)
  for (const [routePath, permission] of Object.entries(ROUTE_PERMISSIONS)) {
    if (routePath.includes(':id')) {
      const basePath = routePath.split('/:id')[0];
      if (path.startsWith(basePath + '/')) {
        return permission;
      }
    }
  }
  return undefined;
}

export interface NavItemConfig {
  title: string;
  href?: string;
  icon: string; // Material/ng-zorro icon name
  permission?: RoutePermission;
  children?: NavItemConfig[];
}

export const NAV_ITEMS_CONFIG: NavItemConfig[] = [
  {
    title: 'Dashboard',
    href: APP_PATHS.DASHBOARD,
    icon: 'appstore',
  },
  {
    title: 'Auth',
    icon: 'safety-certificate',
    children: [
      {
        title: 'Users',
        href: APP_PATHS.USERS.ROOT,
        icon: 'team',
        permission: createPermission(PERMISSION_MODULES.USERS, PERMISSION_ACTIONS.READ),
      },
      {
        title: 'Roles',
        href: APP_PATHS.ROLES.ROOT,
        icon: 'safety-certificate',
        permission: createPermission(PERMISSION_MODULES.ROLES, PERMISSION_ACTIONS.READ),
      },
      {
        title: 'Permissions',
        href: APP_PATHS.PERMISSIONS.ROOT,
        icon: 'key',
        permission: createPermission(PERMISSION_MODULES.PERMISSIONS, PERMISSION_ACTIONS.READ),
      },
    ]
  },
  {
    title: 'Inventory',
    icon: 'inbox',
    children: [
      {
        title: 'Products',
        href: APP_PATHS.INVENTORY.PRODUCTS,
        icon: 'inbox',
        permission: createPermission(PERMISSION_MODULES.INVENTORY, PERMISSION_ACTIONS.READ),
      },
      {
        title: 'Warehouses',
        href: APP_PATHS.INVENTORY.WAREHOUSES,
        icon: 'home',
        permission: createPermission(PERMISSION_MODULES.INVENTORY, PERMISSION_ACTIONS.READ),
      },
      {
        title: 'Warehouse Stocks',
        href: APP_PATHS.INVENTORY.WAREHOUSE_STOCKS,
        icon: 'line-chart',
        permission: createPermission(PERMISSION_MODULES.INVENTORY, PERMISSION_ACTIONS.READ),
      },
      {
        title: 'Transactions',
        href: APP_PATHS.INVENTORY.TRANSACTIONS,
        icon: 'file-text',
        permission: createPermission(PERMISSION_MODULES.INVENTORY, PERMISSION_ACTIONS.READ),
      },
      {
        title: 'Stock Operations',
        href: APP_PATHS.INVENTORY.STOCK_OPERATIONS,
        icon: 'sync',
        permission: createPermission(PERMISSION_MODULES.INVENTORY, PERMISSION_ACTIONS.CREATE),
      },
    ]
  },
  {
    title: 'Sales',
    icon: 'dollar',
    children: [
      {
        title: 'Customers',
        href: APP_PATHS.SALES.CUSTOMERS,
        icon: 'dollar',
        permission: createPermission(PERMISSION_MODULES.SALES, PERMISSION_ACTIONS.READ),
      },
      {
        title: 'Sales Orders',
        href: APP_PATHS.SALES.ORDERS,
        icon: 'shopping-cart',
        permission: createPermission(PERMISSION_MODULES.SALES, PERMISSION_ACTIONS.READ),
      },
    ]
  },
  {
    title: 'Purchasing',
    icon: 'shopping',
    children: [
      {
        title: 'Suppliers',
        href: APP_PATHS.PURCHASING.SUPPLIERS,
        icon: 'team',
        permission: createPermission(PERMISSION_MODULES.PURCHASING, PERMISSION_ACTIONS.READ),
      },
      {
        title: 'Purchase Orders',
        href: APP_PATHS.PURCHASING.ORDERS,
        icon: 'shopping',
        permission: createPermission(PERMISSION_MODULES.PURCHASING, PERMISSION_ACTIONS.READ),
      },
    ]
  },
  {
    title: 'Orders',
    icon: 'ordered-list',
    children: [
      {
        title: 'Orders',
        href: APP_PATHS.SALES.ORDERS, // Reusing sales orders for generic "Orders" group as in image
        icon: 'ordered-list',
        permission: createPermission(PERMISSION_MODULES.SALES, PERMISSION_ACTIONS.READ),
      }
    ]
  }
];
