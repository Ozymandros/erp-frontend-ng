import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

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
        loadComponent: () => import('./features/users/users-list/users-list.component').then(m => m.UsersListComponent)
      },
      {
        path: 'users/:id',
        loadComponent: () => import('./features/users/user-detail/user-detail.component').then(m => m.UserDetailComponent)
      },
      {
        path: 'roles',
        loadComponent: () => import('./features/roles/roles-list/roles-list.component').then(m => m.RolesListComponent)
      },
      {
        path: 'roles/:id',
        loadComponent: () => import('./features/roles/role-detail/role-detail.component').then(m => m.RoleDetailComponent)
      },
      {
        path: 'permissions',
        loadComponent: () => import('./features/permissions/permissions-list/permissions-list.component').then(m => m.PermissionsListComponent)
      },
      {
        path: 'inventory/products',
        loadComponent: () => import('./features/inventory/products-list/products-list.component').then(m => m.ProductsListComponent)
      },
      {
        path: 'inventory/products/:id',
        loadComponent: () => import('./features/inventory/product-detail/product-detail.component').then(m => m.ProductDetailComponent)
      },
      {
        path: 'inventory/warehouses',
        loadComponent: () => import('./features/inventory/warehouses-list/warehouses-list.component').then(m => m.WarehousesListComponent)
      },
      {
        path: 'inventory/warehouses/:id',
        loadComponent: () => import('./features/inventory/warehouse-detail/warehouse-detail.component').then(m => m.WarehouseDetailComponent)
      },
      {
        path: 'inventory/warehouse-stocks',
        loadComponent: () => import('./features/inventory/warehouse-stocks-list/warehouse-stocks-list.component').then(m => m.WarehouseStocksListComponent)
      },
      {
        path: 'inventory/transactions',
        loadComponent: () => import('./features/inventory/inventory-transactions-list/inventory-transactions-list.component').then(m => m.InventoryTransactionsListComponent)
      },
      {
        path: 'inventory/stock-operations',
        loadComponent: () => import('./features/inventory/stock-operations/stock-operations.component').then(m => m.StockOperationsComponent)
      },
      {
        path: 'sales/customers',
        loadComponent: () => import('./features/sales/customers-list/customers-list.component').then(m => m.CustomersListComponent)
      },
      {
        path: 'sales/customers/:id',
        loadComponent: () => import('./features/sales/customer-detail/customer-detail.component').then(m => m.CustomerDetailComponent)
      },
      {
        path: 'sales/orders',
        loadComponent: () => import('./features/sales/sales-orders-list/sales-orders-list.component').then(m => m.SalesOrdersListComponent)
      },
      {
        path: 'purchasing/orders',
        loadComponent: () => import('./features/purchasing/purchase-orders-list/purchase-orders-list.component').then(m => m.PurchaseOrdersListComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
