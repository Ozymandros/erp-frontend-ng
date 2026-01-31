import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { permissionGuard } from './core/guards/permission.guard';
import { APP_ROUTES } from './core/constants/routes.constants';

export const routes: Routes = [
  {
    path: APP_ROUTES.AUTH.LOGIN,
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: APP_ROUTES.AUTH.REGISTER,
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/app-layout/app-layout.component').then(m => m.AppLayoutComponent),
    children: [
      {
        path: APP_ROUTES.DASHBOARD,
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: APP_ROUTES.PROFILE,
        loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent)
      },
      {
        path: APP_ROUTES.USERS.ROOT,
        canActivate: [permissionGuard],
        data: { module: 'users', action: 'read' },
        loadComponent: () => import('./features/users/users-list/users-list.component').then(m => m.UsersListComponent)
      },
      {
        path: APP_ROUTES.USERS.DETAIL,
        canActivate: [permissionGuard],
        data: { module: 'users', action: 'read' },
        loadComponent: () => import('./features/users/user-detail/user-detail.component').then(m => m.UserDetailComponent)
      },
      {
        path: APP_ROUTES.ROLES.ROOT,
        canActivate: [permissionGuard],
        data: { module: 'roles', action: 'read' },
        loadComponent: () => import('./features/roles/roles-list/roles-list.component').then(m => m.RolesListComponent)
      },
      {
        path: APP_ROUTES.ROLES.DETAIL,
        canActivate: [permissionGuard],
        data: { module: 'roles', action: 'read' },
        loadComponent: () => import('./features/roles/role-detail/role-detail.component').then(m => m.RoleDetailComponent)
      },
      {
        path: APP_ROUTES.PERMISSIONS.ROOT,
        canActivate: [permissionGuard],
        data: { module: 'permissions', action: 'read' },
        loadComponent: () => import('./features/permissions/permissions-list/permissions-list.component').then(m => m.PermissionsListComponent)
      },
      {
        path: APP_ROUTES.INVENTORY.PRODUCTS,
        canActivate: [permissionGuard],
        data: { module: 'products', action: 'read' },
        loadComponent: () => import('./features/inventory/products-list/products-list.component').then(m => m.ProductsListComponent)
      },
      {
        path: APP_ROUTES.INVENTORY.PRODUCT_DETAIL,
        canActivate: [permissionGuard],
        data: { module: 'products', action: 'read' },
        loadComponent: () => import('./features/inventory/product-detail/product-detail.component').then(m => m.ProductDetailComponent)
      },
      {
        path: APP_ROUTES.INVENTORY.WAREHOUSES,
        canActivate: [permissionGuard],
        data: { module: 'inventory', action: 'read' },
        loadComponent: () => import('./features/inventory/warehouses-list/warehouses-list.component').then(m => m.WarehousesListComponent)
      },
      {
        path: APP_ROUTES.INVENTORY.WAREHOUSE_DETAIL,
        canActivate: [permissionGuard],
        data: { module: 'inventory', action: 'read' },
        loadComponent: () => import('./features/inventory/warehouse-detail/warehouse-detail.component').then(m => m.WarehouseDetailComponent)
      },
      {
        path: APP_ROUTES.INVENTORY.WAREHOUSE_STOCKS,
        canActivate: [permissionGuard],
        data: { module: 'inventory', action: 'read' },
        loadComponent: () => import('./features/inventory/warehouse-stocks-list/warehouse-stocks-list.component').then(m => m.WarehouseStocksListComponent)
      },
      {
        path: APP_ROUTES.INVENTORY.TRANSACTIONS,
        canActivate: [permissionGuard],
        data: { module: 'inventory', action: 'read' },
        loadComponent: () => import('./features/inventory/inventory-transactions-list/inventory-transactions-list.component').then(m => m.InventoryTransactionsListComponent)
      },
      {
        path: APP_ROUTES.INVENTORY.STOCK_OPERATIONS,
        canActivate: [permissionGuard],
        data: { module: 'inventory', action: 'create' }, // Stock operations usually involve creation
        loadComponent: () => import('./features/inventory/stock-operations/stock-operations.component').then(m => m.StockOperationsComponent)
      },
      {
        path: APP_ROUTES.SALES.CUSTOMERS,
        canActivate: [permissionGuard],
        data: { module: 'sales', action: 'read' },
        loadComponent: () => import('./features/sales/customers-list/customers-list.component').then(m => m.CustomersListComponent)
      },
      {
        path: APP_ROUTES.SALES.CUSTOMER_DETAIL,
        canActivate: [permissionGuard],
        data: { module: 'sales', action: 'read' },
        loadComponent: () => import('./features/sales/customer-detail/customer-detail.component').then(m => m.CustomerDetailComponent)
      },
      {
        path: APP_ROUTES.SALES.ORDERS,
        canActivate: [permissionGuard],
        data: { module: 'sales', action: 'read' },
        loadComponent: () => import('./features/sales/sales-orders-list/sales-orders-list.component').then(m => m.SalesOrdersListComponent)
      },
      {
        path: APP_ROUTES.SALES.ORDER_DETAIL,
        canActivate: [permissionGuard],
        data: { module: 'sales', action: 'read' },
        loadComponent: () => import('./features/sales/sales-order-detail/sales-order-detail.component').then(m => m.SalesOrderDetailComponent)
      },
      {
        path: APP_ROUTES.PURCHASING.SUPPLIERS,
        canActivate: [permissionGuard],
        data: { module: 'purchasing', action: 'read' },
        loadComponent: () => import('./features/purchasing/suppliers-list/suppliers-list.component').then(m => m.SuppliersListComponent)
      },
      {
        path: APP_ROUTES.PURCHASING.SUPPLIER_DETAIL,
        canActivate: [permissionGuard],
        data: { module: 'purchasing', action: 'read' },
        loadComponent: () => import('./features/purchasing/supplier-detail/supplier-detail.component').then(m => m.SupplierDetailComponent)
      },
      {
        path: APP_ROUTES.PURCHASING.ORDERS,
        canActivate: [permissionGuard],
        data: { module: 'purchasing', action: 'read' },
        loadComponent: () => import('./features/purchasing/purchase-orders-list/purchase-orders-list.component').then(m => m.PurchaseOrdersListComponent)
      },
      {
        path: APP_ROUTES.PURCHASING.ORDER_DETAIL,
        canActivate: [permissionGuard],
        data: { module: 'purchasing', action: 'read' },
        loadComponent: () => import('./features/purchasing/purchase-order-detail/purchase-order-detail.component').then(m => m.PurchaseOrderDetailComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
