import { User, Role, Permission, AuthResponse } from '@/app/types/api.types';

export const mockPermissions: Permission[] = [
  { id: 'perm-1', module: 'Users', action: 'Read', description: 'Can view users', createdAt: '2024-01-01T00:00:00Z', createdBy: 'system' },
  { id: 'perm-2', module: 'Users', action: 'Create', description: 'Can create users', createdAt: '2024-01-01T00:00:00Z', createdBy: 'system' },
  { id: 'perm-5', module: 'Products', action: 'Read', description: 'Can view products', createdAt: '2024-01-01T00:00:00Z', createdBy: 'system' },
  { id: 'perm-7', module: 'Orders', action: 'Read', description: 'Can view orders', createdAt: '2024-01-01T00:00:00Z', createdBy: 'system' },
  { id: 'perm-8', module: 'Sales', action: 'Read', description: 'Can view sales', createdAt: '2024-01-01T00:00:00Z', createdBy: 'system' },
  { id: 'perm-9', module: 'Purchasing', action: 'Read', description: 'Can view purchasing', createdAt: '2024-01-01T00:00:00Z', createdBy: 'system' },
];

export const mockRoles: Role[] = [
  { id: 'role-1', name: 'Admin', description: 'Administrator', permissions: mockPermissions, createdAt: '2024-01-01T00:00:00Z', createdBy: 'system' },
  { id: 'role-2', name: 'User', description: 'Standard User', permissions: [mockPermissions[0], mockPermissions[2]], createdAt: '2024-01-01T00:00:00Z', createdBy: 'system' },
];

export const mockAdminUser: User = {
  id: 'user-1',
  username: 'admin',
  email: 'admin@example.com',
  firstName: 'Admin',
  lastName: 'User',
  emailConfirmed: true,
  isExternalLogin: false,
  isActive: true,
  isAdmin: true,
  roles: [mockRoles[0]],
  permissions: mockPermissions,
  createdAt: '2024-01-01T00:00:00Z',
  createdBy: 'system'
};

export const mockAuthResponse: AuthResponse = {
  accessToken: 'mock-token',
  refreshToken: 'mock-refresh-token',
  expiresIn: 3600,
  tokenType: 'Bearer',
  user: mockAdminUser
};

export const mockProducts = [
  { id: 'prod-1', sku: 'WIDGET-001', name: 'Premium Widget', unitPrice: 99.99, stock: 150, reorderLevel: 20, isActive: true, category: 'Widgets', createdAt: '2024-01-01T00:00:00Z', createdBy: 'admin' },
  { id: 'prod-2', sku: 'GADGET-001', name: 'Smart Gadget', unitPrice: 249.99, stock: 45, reorderLevel: 10, isActive: true, category: 'Gadgets', createdAt: '2024-01-01T00:00:00Z', createdBy: 'admin' },
];

export const mockCustomers = [
  { id: 'cust-1', name: 'Acme Corp', email: 'info@acme.com', phone: '123456', isActive: true, createdAt: '2024-01-01T00:00:00Z', createdBy: 'admin' },
];

export const mockWarehouses = [
  { id: 'wh-1', name: 'Main Warehouse', location: 'New York', capacity: 1000, isActive: true, createdAt: '2024-01-01T00:00:00Z' }
];

export const mockTransactions = [
  { id: 'trans-1', productId: 'prod-1', warehouseId: 'wh-1', quantityChange: 10, transactionType: 'Purchase', transactionDate: '2024-01-01T10:00:00Z' }
];

export const mockStocks = [
  { id: 'stock-1', productId: 'prod-1', warehouseId: 'wh-1', quantity: 150, reorderLevel: 20, productName: 'Premium Widget', warehouseName: 'Main Warehouse' }
];

export const mockSalesOrders = [
  { id: 'so-1', orderNumber: 'SO-001', customerId: 'cust-1', customerName: 'Acme Corp', orderDate: '2024-01-02T00:00:00Z', status: 'Confirmed', totalAmount: 500.00 }
];

export const mockPurchaseOrders = [
  { id: 'po-1', orderNumber: 'PO-001', supplierId: 'sup-1', supplierName: 'Global Supplies', orderDate: '2024-01-03T00:00:00Z', status: 'Pending', totalAmount: 1200.00 }
];

export const mockSuppliers = [
  { id: 'sup-1', name: 'Global Supplies', contactName: 'John Doe', email: 'john@globalsupplies.com', phone: '555-0123' }
];
