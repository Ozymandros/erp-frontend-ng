import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { permissionGuard } from './core/guards/permission.guard';
import { APP_ROUTES } from './core/constants/routes.constants';
import { PERMISSION_ACTIONS, PERMISSION_MODULES } from './core/constants/permissions';

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
      },
      {
        path: APP_ROUTES.CRM.LEADS,
        canActivate: [permissionGuard],
        data: { module: PERMISSION_MODULES.CRM, action: PERMISSION_ACTIONS.READ },
        loadComponent: () => import('./features/crm/leads-list/leads-list.component').then(m => m.LeadsListComponent)
      },
      {
        path: APP_ROUTES.CRM.LEAD_NEW,
        canActivate: [permissionGuard],
        data: { module: PERMISSION_MODULES.CRM, action: PERMISSION_ACTIONS.CREATE },
        loadComponent: () => import('./features/crm/lead-detail/lead-detail.component').then(m => m.LeadDetailComponent)
      },
      {
        path: APP_ROUTES.CRM.LEAD_DETAIL,
        canActivate: [permissionGuard],
        data: { module: PERMISSION_MODULES.CRM, action: PERMISSION_ACTIONS.READ },
        loadComponent: () => import('./features/crm/lead-detail/lead-detail.component').then(m => m.LeadDetailComponent)
      },
      {
        path: APP_ROUTES.CRM.OPPORTUNITIES,
        canActivate: [permissionGuard],
        data: { module: PERMISSION_MODULES.CRM, action: PERMISSION_ACTIONS.READ },
        loadComponent: () => import('./features/crm/opportunities-list/opportunities-list.component').then(m => m.OpportunitiesListComponent)
      },
      {
        path: APP_ROUTES.CRM.OPPORTUNITY_NEW,
        canActivate: [permissionGuard],
        data: { module: PERMISSION_MODULES.CRM, action: PERMISSION_ACTIONS.CREATE },
        loadComponent: () => import('./features/crm/opportunity-detail/opportunity-detail.component').then(m => m.OpportunityDetailComponent)
      },
      {
        path: APP_ROUTES.CRM.OPPORTUNITY_DETAIL,
        canActivate: [permissionGuard],
        data: { module: PERMISSION_MODULES.CRM, action: PERMISSION_ACTIONS.READ },
        loadComponent: () => import('./features/crm/opportunity-detail/opportunity-detail.component').then(m => m.OpportunityDetailComponent)
      },
      {
        path: APP_ROUTES.CRM.ACTIVITIES,
        canActivate: [permissionGuard],
        data: { module: PERMISSION_MODULES.CRM, action: PERMISSION_ACTIONS.READ },
        loadComponent: () => import('./features/crm/activities-list/activities-list.component').then(m => m.ActivitiesListComponent)
      },
      {
        path: APP_ROUTES.CRM.ACTIVITY_NEW,
        canActivate: [permissionGuard],
        data: { module: PERMISSION_MODULES.CRM, action: PERMISSION_ACTIONS.CREATE },
        loadComponent: () => import('./features/crm/activity-detail/activity-detail.component').then(m => m.ActivityDetailComponent)
      },
      {
        path: APP_ROUTES.CRM.ACTIVITY_DETAIL,
        canActivate: [permissionGuard],
        data: { module: PERMISSION_MODULES.CRM, action: PERMISSION_ACTIONS.READ },
        loadComponent: () => import('./features/crm/activity-detail/activity-detail.component').then(m => m.ActivityDetailComponent)
      },
      {
        path: APP_ROUTES.CRM.ACCOUNTS,
        canActivate: [permissionGuard],
        data: { module: PERMISSION_MODULES.CRM, action: PERMISSION_ACTIONS.READ },
        loadComponent: () => import('./features/crm/accounts-list/accounts-list.component').then(m => m.AccountsListComponent)
      },
      {
        path: APP_ROUTES.CRM.ACCOUNT_DETAIL,
        canActivate: [permissionGuard],
        data: { module: PERMISSION_MODULES.CRM, action: PERMISSION_ACTIONS.READ },
        loadComponent: () => import('./features/crm/account-detail/account-detail.component').then(m => m.AccountDetailComponent)
      },
      {
        path: APP_ROUTES.CRM.CONTACTS,
        canActivate: [permissionGuard],
        data: { module: PERMISSION_MODULES.CRM, action: PERMISSION_ACTIONS.READ },
        loadComponent: () => import('./features/crm/contacts-list/contacts-list.component').then(m => m.ContactsListComponent)
      },
      {
        path: APP_ROUTES.CRM.CONTACT_NEW,
        canActivate: [permissionGuard],
        data: { module: PERMISSION_MODULES.CRM, action: PERMISSION_ACTIONS.CREATE },
        loadComponent: () => import('./features/crm/contact-detail/contact-detail.component').then(m => m.ContactDetailComponent)
      },
      {
        path: APP_ROUTES.CRM.CONTACT_DETAIL,
        canActivate: [permissionGuard],
        data: { module: PERMISSION_MODULES.CRM, action: PERMISSION_ACTIONS.READ },
        loadComponent: () => import('./features/crm/contact-detail/contact-detail.component').then(m => m.ContactDetailComponent)
      },
      {
        path: APP_ROUTES.BILLING.INVOICES,
        canActivate: [permissionGuard],
        data: { module: PERMISSION_MODULES.BILLING, action: PERMISSION_ACTIONS.READ },
        loadComponent: () => import('./features/billing/invoices-list/invoices-list.component').then(m => m.InvoicesListComponent)
      },
      {
        path: APP_ROUTES.BILLING.INVOICE_DETAIL,
        canActivate: [permissionGuard],
        data: { module: PERMISSION_MODULES.BILLING, action: PERMISSION_ACTIONS.READ },
        loadComponent: () => import('./features/billing/invoice-detail/invoice-detail.component').then(m => m.InvoiceDetailComponent)
      },
      {
        path: APP_ROUTES.BILLING.CREDIT_NOTES,
        canActivate: [permissionGuard],
        data: { module: PERMISSION_MODULES.BILLING, action: PERMISSION_ACTIONS.READ },
        loadComponent: () => import('./features/billing/credit-notes-list/credit-notes-list.component').then(m => m.CreditNotesListComponent)
      },
      {
        path: APP_ROUTES.BILLING.PAYMENTS,
        canActivate: [permissionGuard],
        data: { module: PERMISSION_MODULES.BILLING, action: PERMISSION_ACTIONS.READ },
        loadComponent: () => import('./features/billing/payments-list/payments-list.component').then(m => m.PaymentsListComponent)
      },
      {
        path: APP_ROUTES.BILLING.PAYMENT_DETAIL,
        canActivate: [permissionGuard],
        data: { module: PERMISSION_MODULES.BILLING, action: PERMISSION_ACTIONS.READ },
        loadComponent: () => import('./features/billing/payment-detail/payment-detail.component').then(m => m.PaymentDetailComponent)
      },
      {
        path: APP_ROUTES.BILLING.CREDIT_NOTE_DETAIL,
        canActivate: [permissionGuard],
        data: { module: PERMISSION_MODULES.BILLING, action: PERMISSION_ACTIONS.READ },
        loadComponent: () => import('./features/billing/credit-note-detail/credit-note-detail.component').then(m => m.CreditNoteDetailComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
