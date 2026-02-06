import { APP_PATHS, APP_ROUTES } from './routes.constants';

describe('routes.constants', () => {
  it('should define top-level APP_ROUTES', () => {
    expect(APP_ROUTES.AUTH.LOGIN).toBe('login');
    expect(APP_ROUTES.AUTH.REGISTER).toBe('register');
    expect(APP_ROUTES.DASHBOARD).toBe('');
    expect(APP_ROUTES.PROFILE).toBe('profile');
  });

  it('should build APP_PATHS from APP_ROUTES', () => {
    expect(APP_PATHS.AUTH.LOGIN).toBe(`/${APP_ROUTES.AUTH.LOGIN}`);
    expect(APP_PATHS.AUTH.REGISTER).toBe(`/${APP_ROUTES.AUTH.REGISTER}`);
    expect(APP_PATHS.DASHBOARD).toBe('/');
    expect(APP_PATHS.PROFILE).toBe(`/${APP_ROUTES.PROFILE}`);
  });

  it('should build USER paths with id', () => {
    expect(APP_PATHS.USERS.ROOT).toBe(`/${APP_ROUTES.USERS.ROOT}`);
    expect(APP_PATHS.USERS.DETAIL('123')).toBe(`/${APP_ROUTES.USERS.ROOT}/123`);
  });

  it('should build INVENTORY paths with id', () => {
    expect(APP_PATHS.INVENTORY.PRODUCTS).toBe(`/${APP_ROUTES.INVENTORY.PRODUCTS}`);
    expect(APP_PATHS.INVENTORY.PRODUCT_DETAIL('p1')).toBe(`/${APP_ROUTES.INVENTORY.PRODUCTS}/p1`);
    expect(APP_PATHS.INVENTORY.WAREHOUSE_DETAIL('w1')).toBe(`/${APP_ROUTES.INVENTORY.WAREHOUSES}/w1`);
  });

  it('should build SALES and PURCHASING paths with id', () => {
    expect(APP_PATHS.SALES.ORDERS).toBe(`/${APP_ROUTES.SALES.ORDERS}`);
    expect(APP_PATHS.SALES.ORDER_DETAIL('o1')).toBe(`/${APP_ROUTES.SALES.ORDERS}/o1`);
    expect(APP_PATHS.PURCHASING.SUPPLIERS).toBe(`/${APP_ROUTES.PURCHASING.SUPPLIERS}`);
    expect(APP_PATHS.PURCHASING.SUPPLIER_DETAIL('s1')).toBe(`/${APP_ROUTES.PURCHASING.SUPPLIERS}/s1`);
  });
});
