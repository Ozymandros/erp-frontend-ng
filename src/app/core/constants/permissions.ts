export const PERMISSION_MODULES = {
  USERS: "Users",
  ROLES: "Roles",
  PERMISSIONS: "Permissions",
  INVENTORY: "Inventory",
  ORDERS: "Orders",
  SALES: "Sales",
  PURCHASING: "Purchasing",
} as const;

export const PERMISSION_ACTIONS = {
  READ: "Read",
  CREATE: "Create",
  UPDATE: "Update",
  DELETE: "Delete",
  EXPORT: "Export",
} as const;

export type PermissionModule = typeof PERMISSION_MODULES[keyof typeof PERMISSION_MODULES];
export type PermissionAction = typeof PERMISSION_ACTIONS[keyof typeof PERMISSION_ACTIONS];

export interface Permission {
  id: string;
  module: string;
  action: string;
  description?: string;
}

export function createPermission(
  module: PermissionModule,
  action: PermissionAction
): { module: PermissionModule; action: PermissionAction } {
  return { module, action };
}

export interface RoutePermission {
  module: PermissionModule;
  action: PermissionAction;
}
