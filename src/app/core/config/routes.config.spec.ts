import { APP_PATHS, APP_ROUTES } from '../constants/routes.constants';
import { PERMISSION_ACTIONS, PERMISSION_MODULES, createPermission } from '../constants/permissions';
import { getRoutePermission, NAV_ITEMS_CONFIG, ROUTE_PERMISSIONS } from './routes.config';

describe('routes.config', () => {
  it('should include expected route permissions', () => {
    const usersPermission = ROUTE_PERMISSIONS[APP_PATHS.USERS.ROOT];
    expect(usersPermission).toEqual(createPermission(PERMISSION_MODULES.USERS, PERMISSION_ACTIONS.READ));

    const rolesPermission = ROUTE_PERMISSIONS[APP_PATHS.ROLES.ROOT];
    expect(rolesPermission).toEqual(createPermission(PERMISSION_MODULES.ROLES, PERMISSION_ACTIONS.READ));
  });

  it('should return permission for exact path match', () => {
    const permission = getRoutePermission(APP_PATHS.SALES.CUSTOMERS);
    expect(permission).toEqual(createPermission(PERMISSION_MODULES.SALES, PERMISSION_ACTIONS.READ));
  });

  it('should return permission for dynamic route match', () => {
    const permission = getRoutePermission(`/${APP_ROUTES.USERS.ROOT}/123`);
    expect(permission).toEqual(createPermission(PERMISSION_MODULES.USERS, PERMISSION_ACTIONS.READ));
  });

  it('should return undefined for unknown route', () => {
    const permission = getRoutePermission('/unknown');
    expect(permission).toBeUndefined();
  });

  it('should include nav items for main sections', () => {
    const titles = NAV_ITEMS_CONFIG.map(item => item.title);
    expect(titles).toContain('Dashboard');
    expect(titles).toContain('Auth');
    expect(titles).toContain('Inventory');
    expect(titles).toContain('Sales');
    expect(titles).toContain('Purchasing');
  });
});
