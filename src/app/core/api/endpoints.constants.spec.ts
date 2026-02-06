import {
  AUTH_ENDPOINTS,
  USERS_ENDPOINTS,
  ROLES_ENDPOINTS,
  PERMISSIONS_ENDPOINTS,
  INVENTORY_ENDPOINTS,
  SALES_ENDPOINTS,
  PURCHASING_ENDPOINTS,
  ORDERS_ENDPOINTS
} from './endpoints.constants';

describe('endpoints.constants', () => {
  it('should define AUTH_ENDPOINTS', () => {
    expect(AUTH_ENDPOINTS.LOGIN).toContain('/auth/login');
    expect(AUTH_ENDPOINTS.REGISTER).toContain('/auth/register');
    expect(AUTH_ENDPOINTS.LOGOUT).toContain('/auth/logout');
    expect(AUTH_ENDPOINTS.REFRESH).toContain('/auth/refresh');
  });

  it('should define USERS_ENDPOINTS with BY_ID and ROLES functions', () => {
    expect(USERS_ENDPOINTS.ME).toContain('/users/me');
    expect(USERS_ENDPOINTS.BY_ID('x')).toContain('/users/x');
    expect(USERS_ENDPOINTS.ROLES('y')).toContain('/users/y/roles');
  });

  it('should define ROLES_ENDPOINTS with BY_ID and PERMISSIONS functions', () => {
    expect(ROLES_ENDPOINTS.BY_ID('r1')).toContain('/roles/r1');
    expect(ROLES_ENDPOINTS.PERMISSIONS('r1')).toContain('/roles/r1/permissions');
  });

  it('should define PERMISSIONS_ENDPOINTS with CHECK and BY_ID', () => {
    expect(PERMISSIONS_ENDPOINTS.CHECK).toContain('/permissions/check');
    expect(PERMISSIONS_ENDPOINTS.BY_ID('p1')).toContain('/permissions/p1');
  });

  it('should define INVENTORY_ENDPOINTS with product and warehouse paths', () => {
    expect(INVENTORY_ENDPOINTS.PRODUCT_BY_ID('id')).toContain('/products/id');
    expect(INVENTORY_ENDPOINTS.WAREHOUSE_BY_ID('w1')).toContain('/warehouses/w1');
    expect(INVENTORY_ENDPOINTS.STOCK_OPERATIONS).toBeDefined();
  });

  it('should define SALES_ENDPOINTS with CUSTOMER_BY_ID and ORDER_BY_ID', () => {
    expect(SALES_ENDPOINTS.CUSTOMER_BY_ID('c1')).toContain('/customers/c1');
    expect(SALES_ENDPOINTS.ORDER_BY_ID('o1')).toContain('/orders/o1');
  });

  it('should define PURCHASING_ENDPOINTS with ORDER_BY_ID and SUPPLIER_BY_ID', () => {
    expect(PURCHASING_ENDPOINTS.ORDER_BY_ID('o1')).toContain('/orders/o1');
    expect(PURCHASING_ENDPOINTS.SUPPLIER_BY_ID('s1')).toContain('/suppliers/s1');
  });

  it('should define ORDERS_ENDPOINTS with BY_ID', () => {
    expect(ORDERS_ENDPOINTS.BY_ID('o1')).toContain('/orders/o1');
  });
});
