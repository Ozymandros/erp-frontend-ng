import { TestBed } from '@angular/core/testing';
import { PermissionService } from './permission.service';
import { AuthService } from './auth.service';
import { PERMISSION_ACTIONS } from '../constants/permissions';
import { User } from '../../types/api.types';

describe('PermissionService', () => {
  let service: PermissionService;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  const adminUser: User = {
    id: '1',
    username: 'admin',
    roles: [],
    permissions: [],
    emailConfirmed: true,
    isExternalLogin: false,
    isAdmin: true,
    isActive: true,
    createdAt: '',
    createdBy: ''
  };

  const regularUser: User = {
    ...adminUser,
    isAdmin: false,
    permissions: [
      { id: 'p1', module: 'Users', action: 'Read', createdAt: '', createdBy: '' },
      { id: 'p2', module: 'Inventory', action: 'Create', createdAt: '', createdBy: '' }
    ]
  };

  beforeEach(() => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['getCurrentUser']);
    authServiceSpy.getCurrentUser.and.returnValue(regularUser);

    TestBed.configureTestingModule({
      providers: [
        PermissionService,
        { provide: AuthService, useValue: authServiceSpy }
      ]
    });
    service = TestBed.inject(PermissionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return false when no user', () => {
    authServiceSpy.getCurrentUser.and.returnValue(null);
    expect(service.hasPermission('Users', 'Read')).toBeFalse();
  });

  it('should return true for admin regardless of permission', () => {
    authServiceSpy.getCurrentUser.and.returnValue(adminUser);
    expect(service.hasPermission('Anything', 'AnyAction')).toBeTrue();
  });

  it('should return true when user has matching permission (case insensitive)', () => {
    authServiceSpy.getCurrentUser.and.returnValue(regularUser);
    expect(service.hasPermission('Users', 'Read')).toBeTrue();
    expect(service.hasPermission('users', 'read')).toBeTrue();
  });

  it('should return false when user does not have permission', () => {
    authServiceSpy.getCurrentUser.and.returnValue(regularUser);
    expect(service.hasPermission('Users', 'Delete')).toBeFalse();
  });

  it('should return true for hasAllPermissions when user has all', () => {
    authServiceSpy.getCurrentUser.and.returnValue(regularUser);
    expect(service.hasAllPermissions([
      { module: 'Users', action: 'Read' },
      { module: 'Inventory', action: 'Create' }
    ])).toBeTrue();
  });

  it('should return false for hasAllPermissions when user missing one', () => {
    authServiceSpy.getCurrentUser.and.returnValue(regularUser);
    expect(service.hasAllPermissions([
      { module: 'Users', action: 'Read' },
      { module: 'Roles', action: 'Update' }
    ])).toBeFalse();
  });

  it('should return false for hasAllPermissions when no user', () => {
    authServiceSpy.getCurrentUser.and.returnValue(null);
    expect(service.hasAllPermissions([{ module: 'Users', action: 'Read' }])).toBeFalse();
  });

  it('should return all false for getModulePermissions when no user', () => {
    authServiceSpy.getCurrentUser.and.returnValue(null);
    const perms = service.getModulePermissions('Users');
    expect(perms.canCreate).toBeFalse();
    expect(perms.canRead).toBeFalse();
    expect(perms.canUpdate).toBeFalse();
    expect(perms.canDelete).toBeFalse();
    expect(perms.canExport).toBeFalse();
  });

  it('should return all true for getModulePermissions when admin', () => {
    authServiceSpy.getCurrentUser.and.returnValue(adminUser);
    const perms = service.getModulePermissions('Users');
    expect(perms.canCreate).toBeTrue();
    expect(perms.canRead).toBeTrue();
    expect(perms.canUpdate).toBeTrue();
    expect(perms.canDelete).toBeTrue();
    expect(perms.canExport).toBeTrue();
  });

  it('should return module-specific permissions for non-admin', () => {
    authServiceSpy.getCurrentUser.and.returnValue(regularUser);
    const perms = service.getModulePermissions('Users');
    expect(perms.canRead).toBeTrue();
    expect(perms.canCreate).toBe(service.hasPermission('Users', PERMISSION_ACTIONS.CREATE));
    expect(perms.canUpdate).toBe(service.hasPermission('Users', PERMISSION_ACTIONS.UPDATE));
    expect(perms.canDelete).toBe(service.hasPermission('Users', PERMISSION_ACTIONS.DELETE));
  });
});
