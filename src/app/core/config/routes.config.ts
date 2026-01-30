import { PERMISSION_MODULES, PERMISSION_ACTIONS, createPermission, RoutePermission } from '../constants/permissions';

export const ROUTE_PERMISSIONS: Record<string, RoutePermission> = {
  '/users': createPermission(PERMISSION_MODULES.USERS, PERMISSION_ACTIONS.READ),
  '/users/:id': createPermission(PERMISSION_MODULES.USERS, PERMISSION_ACTIONS.READ),
  '/roles': createPermission(PERMISSION_MODULES.ROLES, PERMISSION_ACTIONS.READ),
  '/roles/:id': createPermission(PERMISSION_MODULES.ROLES, PERMISSION_ACTIONS.READ),
  '/permissions': createPermission(PERMISSION_MODULES.PERMISSIONS, PERMISSION_ACTIONS.READ),
  '/inventory/products': createPermission(PERMISSION_MODULES.INVENTORY, PERMISSION_ACTIONS.READ),
  '/inventory/products/:id': createPermission(PERMISSION_MODULES.INVENTORY, PERMISSION_ACTIONS.READ),
  '/inventory/warehouses': createPermission(PERMISSION_MODULES.INVENTORY, PERMISSION_ACTIONS.READ),
  '/inventory/warehouses/:id': createPermission(PERMISSION_MODULES.INVENTORY, PERMISSION_ACTIONS.READ),
  '/inventory/warehouse-stocks': createPermission(PERMISSION_MODULES.INVENTORY, PERMISSION_ACTIONS.READ),
  '/inventory/transactions': createPermission(PERMISSION_MODULES.INVENTORY, PERMISSION_ACTIONS.READ),
  '/inventory/stock-operations': createPermission(PERMISSION_MODULES.INVENTORY, PERMISSION_ACTIONS.CREATE),
  '/sales/customers': createPermission(PERMISSION_MODULES.SALES, PERMISSION_ACTIONS.READ),
  '/sales/customers/:id': createPermission(PERMISSION_MODULES.SALES, PERMISSION_ACTIONS.READ),
  '/sales/orders': createPermission(PERMISSION_MODULES.SALES, PERMISSION_ACTIONS.READ),
  '/sales/orders/:id': createPermission(PERMISSION_MODULES.SALES, PERMISSION_ACTIONS.READ),
  '/purchasing/suppliers': createPermission(PERMISSION_MODULES.PURCHASING, PERMISSION_ACTIONS.READ),
  '/purchasing/suppliers/:id': createPermission(PERMISSION_MODULES.PURCHASING, PERMISSION_ACTIONS.READ),
  '/purchasing/orders': createPermission(PERMISSION_MODULES.PURCHASING, PERMISSION_ACTIONS.READ),
  '/purchasing/orders/:id': createPermission(PERMISSION_MODULES.PURCHASING, PERMISSION_ACTIONS.READ),
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
  href: string;
  icon: string; // Material/ng-zorro icon name
  permission?: RoutePermission;
}

export const NAV_ITEMS_CONFIG: NavItemConfig[] = [
  {
    title: 'Users',
    href: '/users',
    icon: 'user',
    permission: createPermission(PERMISSION_MODULES.USERS, PERMISSION_ACTIONS.READ),
  },
  {
    title: 'Roles',
    href: '/roles',
    icon: 'safety-certificate',
    permission: createPermission(PERMISSION_MODULES.ROLES, PERMISSION_ACTIONS.READ),
  },
  {
    title: 'Permissions',
    href: '/permissions',
    icon: 'key',
    permission: createPermission(PERMISSION_MODULES.PERMISSIONS, PERMISSION_ACTIONS.READ),
  },
  {
    title: 'Products',
    href: '/inventory/products',
    icon: 'inbox',
    permission: createPermission(PERMISSION_MODULES.INVENTORY, PERMISSION_ACTIONS.READ),
  },
  {
    title: 'Warehouses',
    href: '/inventory/warehouses',
    icon: 'home',
    permission: createPermission(PERMISSION_MODULES.INVENTORY, PERMISSION_ACTIONS.READ),
  },
  {
    title: 'Warehouse Stocks',
    href: '/inventory/warehouse-stocks',
    icon: 'line-chart',
    permission: createPermission(PERMISSION_MODULES.INVENTORY, PERMISSION_ACTIONS.READ),
  },
  {
    title: 'Transactions',
    href: '/inventory/transactions',
    icon: 'file-text',
    permission: createPermission(PERMISSION_MODULES.INVENTORY, PERMISSION_ACTIONS.READ),
  },
  {
    title: 'Stock Operations',
    href: '/inventory/stock-operations',
    icon: 'sync',
    permission: createPermission(PERMISSION_MODULES.INVENTORY, PERMISSION_ACTIONS.CREATE),
  },
  {
    title: 'Customers',
    href: '/sales/customers',
    icon: 'dollar',
    permission: createPermission(PERMISSION_MODULES.SALES, PERMISSION_ACTIONS.READ),
  },
  {
    title: 'Sales Orders',
    href: '/sales/orders',
    icon: 'shopping-cart',
    permission: createPermission(PERMISSION_MODULES.SALES, PERMISSION_ACTIONS.READ),
  },
  {
    title: 'Suppliers',
    href: '/purchasing/suppliers',
    icon: 'team',
    permission: createPermission(PERMISSION_MODULES.PURCHASING, PERMISSION_ACTIONS.READ),
  },
  {
    title: 'Purchase Orders',
    href: '/purchasing/orders',
    icon: 'shopping',
    permission: createPermission(PERMISSION_MODULES.PURCHASING, PERMISSION_ACTIONS.READ),
  },
];
