import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { permissionGuard } from './core/guards/permission.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/app-layout/app-layout.component').then(m => m.AppLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'profile',
        loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent)
      },
      {
        path: 'users',
        canActivate: [permissionGuard],
        data: { module: 'users', action: 'read' },
        loadComponent: () => import('./features/users/users-list/users-list.component').then(m => m.UsersListComponent)
      },
      {
        path: 'users/:id',
        canActivate: [permissionGuard],
        data: { module: 'users', action: 'read' },
        loadComponent: () => import('./features/users/user-detail/user-detail.component').then(m => m.UserDetailComponent)
      },
      {
        path: 'roles',
        canActivate: [permissionGuard],
        data: { module: 'roles', action: 'read' },
        loadComponent: () => import('./features/roles/roles-list/roles-list.component').then(m => m.RolesListComponent)
      },
      {
        path: 'roles/:id',
        canActivate: [permissionGuard],
        data: { module: 'roles', action: 'read' },
        loadComponent: () => import('./features/roles/role-detail/role-detail.component').then(m => m.RoleDetailComponent)
      },
      {
        path: 'permissions',
        canActivate: [permissionGuard],
        data: { module: 'permissions', action: 'read' },
        loadComponent: () => import('./features/permissions/permissions-list/permissions-list.component').then(m => m.PermissionsListComponent)
      },
      {
        path: 'inventory/products',
        canActivate: [permissionGuard],
        data: { module: 'products', action: 'read' },
        loadComponent: () => import('./features/inventory/products-list/products-list.component').then(m => m.ProductsListComponent)
      },
      {
        path: 'inventory/products/:id',
        canActivate: [permissionGuard],
        data: { module: 'products', action: 'read' },
        loadComponent: () => import('./features/inventory/product-detail/product-detail.component').then(m => m.ProductDetailComponent)
      },
      {
        path: 'inventory/warehouses',
        canActivate: [permissionGuard],
        data: { module: 'inventory', action: 'read' },
        loadComponent: () => import('./features/inventory/warehouses-list/warehouses-list.component').then(m => m.WarehousesListComponent)
      },
      {
        path: 'inventory/warehouses/:id',
        canActivate: [permissionGuard],
        data: { module: 'inventory', action: 'read' },
        loadComponent: () => import('./features/inventory/warehouse-detail/warehouse-detail.component').then(m => m.WarehouseDetailComponent)
      },
      {
        path: 'inventory/warehouse-stocks',
        canActivate: [permissionGuard],
        data: { module: 'inventory', action: 'read' },
        loadComponent: () => import('./features/inventory/warehouse-stocks-list/warehouse-stocks-list.component').then(m => m.WarehouseStocksListComponent)
      },
      {
        path: 'inventory/transactions',
        canActivate: [permissionGuard],
        data: { module: 'inventory', action: 'read' },
        loadComponent: () => import('./features/inventory/inventory-transactions-list/inventory-transactions-list.component').then(m => m.InventoryTransactionsListComponent)
      },
      {
        path: 'inventory/stock-operations',
        canActivate: [permissionGuard],
        data: { module: 'inventory', action: 'create' }, // Stock operations usually involve creation
        loadComponent: () => import('./features/inventory/stock-operations/stock-operations.component').then(m => m.StockOperationsComponent)
      },
      {
        path: 'sales/customers',
        canActivate: [permissionGuard],
        data: { module: 'sales', action: 'read' },
        loadComponent: () => import('./features/sales/customers-list/customers-list.component').then(m => m.CustomersListComponent)
      },
      {
        path: 'sales/customers/:id',
        canActivate: [permissionGuard],
        data: { module: 'sales', action: 'read' },
        loadComponent: () => import('./features/sales/customer-detail/customer-detail.component').then(m => m.CustomerDetailComponent)
      },
      {
        path: 'sales/orders',
        canActivate: [permissionGuard],
        data: { module: 'sales', action: 'read' },
        loadComponent: () => import('./features/sales/sales-orders-list/sales-orders-list.component').then(m => m.SalesOrdersListComponent)
      },
      {
        path: 'sales/orders/:id',
        canActivate: [permissionGuard],
        data: { module: 'sales', action: 'read' },
        loadComponent: () => import('./features/sales/sales-order-detail/sales-order-detail.component').then(m => m.SalesOrderDetailComponent)
      },
      {
        path: 'purchasing/suppliers',
        canActivate: [permissionGuard],
        data: { module: 'purchasing', action: 'read' },
        loadComponent: () => import('./features/purchasing/suppliers-list/suppliers-list.component').then(m => m.SuppliersListComponent)
      },
      {
        path: 'purchasing/suppliers/:id',
        canActivate: [permissionGuard],
        data: { module: 'purchasing', action: 'read' },
        loadComponent: () => import('./features/purchasing/supplier-detail/supplier-detail.component').then(m => m.SupplierDetailComponent)
      },
      {
        path: 'purchasing/orders',
        canActivate: [permissionGuard],
        data: { module: 'purchasing', action: 'read' },
        loadComponent: () => import('./features/purchasing/purchase-orders-list/purchase-orders-list.component').then(m => m.PurchaseOrdersListComponent)
      },
      {
        path: 'purchasing/orders/:id',
        canActivate: [permissionGuard],
        data: { module: 'purchasing', action: 'read' },
        loadComponent: () => import('./features/purchasing/purchase-order-detail/purchase-order-detail.component').then(m => m.PurchaseOrderDetailComponent)
      },
      {
        path: 'purchases',
        redirectTo: 'purchasing/orders'
      },
      {
        path: 'purchases/orders',
        redirectTo: 'purchasing/orders'
      },
      {
        path: 'purchases/orders/new',
        redirectTo: 'purchasing/orders/new'
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
