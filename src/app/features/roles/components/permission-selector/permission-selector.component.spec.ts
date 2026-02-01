import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { Observable } from 'rxjs';
import { PermissionSelectorComponent } from './permission-selector.component';
import { PermissionsService } from '../../../../core/services/permissions.service';
import { RolesService } from '../../../../core/services/roles.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NZ_ICONS } from 'ng-zorro-antd/icon';
import { icons } from '../../../../ant-design-icons';
import { Permission } from '../../../../types/api.types';
import { PaginatedResponse } from '../../../../types/api.types';

const paginatedPermissions = (items: Permission[]): PaginatedResponse<Permission> => ({
  items,
  total: items.length,
  page: 1,
  pageSize: 1000,
  totalPages: 1,
  hasPreviousPage: false,
  hasNextPage: false
});

describe('PermissionSelectorComponent', () => {
  let component: PermissionSelectorComponent;
  let fixture: ComponentFixture<PermissionSelectorComponent>;
  let permissionsServiceSpy: jasmine.SpyObj<PermissionsService>;
  let rolesServiceSpy: jasmine.SpyObj<RolesService>;
  let messageSpy: jasmine.SpyObj<NzMessageService>;

  const mockPermissions: Permission[] = [
    { id: 'p1', module: 'Users', action: 'Read', createdAt: '', createdBy: '' }
  ];

  const voidObs: Observable<void> = of(undefined);

  beforeEach(async () => {
    permissionsServiceSpy = jasmine.createSpyObj('PermissionsService', ['getAll']);
    permissionsServiceSpy.getAll.and.returnValue(of(paginatedPermissions(mockPermissions)));
    rolesServiceSpy = jasmine.createSpyObj('RolesService', ['addPermissionToRole', 'removePermissionFromRole']);
    rolesServiceSpy.addPermissionToRole.and.returnValue(voidObs);
    rolesServiceSpy.removePermissionFromRole.and.returnValue(voidObs);
    messageSpy = jasmine.createSpyObj('NzMessageService', ['success', 'error']);

    await TestBed.configureTestingModule({
      imports: [PermissionSelectorComponent],
      providers: [
        { provide: PermissionsService, useValue: permissionsServiceSpy },
        { provide: RolesService, useValue: rolesServiceSpy },
        { provide: NzMessageService, useValue: messageSpy },
        { provide: NZ_ICONS, useValue: icons }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PermissionSelectorComponent);
    component = fixture.componentInstance;
    component.roleId = 'role1';
    component.initialPermissions = [];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load permissions on init', () => {
    expect(permissionsServiceSpy.getAll).toHaveBeenCalledWith({ pageSize: 1000 });
    expect(component.allPermissions).toEqual(mockPermissions);
  });

  it('should return true for isAssigned when permission id is in set', () => {
    component.assignedPermissions = new Set(['p1']);
    expect(component.isAssigned('p1')).toBeTrue();
    expect(component.isAssigned('p2')).toBeFalse();
  });

  it('should call rolesService.addPermissionToRole when assignPermission', (done) => {
    component.assignedPermissions = new Set();
    component.savingPermissionId = null;
    component.savingModule = null;
    rolesServiceSpy.addPermissionToRole.and.returnValue(voidObs);
    spyOn(component.permissionsChange, 'emit');

    component.assignPermission(mockPermissions[0]);

    expect(rolesServiceSpy.addPermissionToRole).toHaveBeenCalledWith('role1', 'p1' as unknown as string[]);
    setTimeout(() => {
      expect(component.assignedPermissions.has('p1')).toBeTrue();
      expect(messageSpy.success).toHaveBeenCalled();
      expect(component.permissionsChange.emit).toHaveBeenCalled();
      done();
    }, 50);
  });

  it('should call rolesService.removePermissionFromRole when unassignPermission', (done) => {
    component.assignedPermissions = new Set(['p1']);
    component.savingPermissionId = null;
    component.savingModule = null;
    rolesServiceSpy.removePermissionFromRole.and.returnValue(voidObs);
    spyOn(component.permissionsChange, 'emit');

    component.unassignPermission(mockPermissions[0]);

    expect(rolesServiceSpy.removePermissionFromRole).toHaveBeenCalled();
    expect(rolesServiceSpy.removePermissionFromRole.calls.mostRecent().args).toEqual(['role1', 'p1']);
    setTimeout(() => {
      expect(component.assignedPermissions.has('p1')).toBeFalse();
      expect(messageSpy.success).toHaveBeenCalled();
      expect(component.permissionsChange.emit).toHaveBeenCalled();
      done();
    }, 50);
  });

  it('should update effectiveSearchTerm only when term length >= 3', () => {
    component.searchTerm = 'ab';
    component.onSearchOrModuleChange();
    expect(component.effectiveSearchTerm).toBe('');

    component.searchTerm = 'abc';
    component.onSearchOrModuleChange();
    expect(component.effectiveSearchTerm).toBe('abc');
  });

  it('should filter permissions by search term', () => {
    component.allPermissions = [
      { id: '1', module: 'Users', action: 'Read' },
      { id: '2', module: 'Roles', action: 'Write' }
    ] as any;
    component.searchTerm = 'Users';
    component.onSearchOrModuleChange();
    // effectiveSearchTerm updates, but filteredPermissions is lazy
    expect(component.filteredPermissions.length).toBe(1);
    expect(component.filteredPermissions[0].module).toBe('Users');
  });

  it('should filter permissions by module', () => {
    component.allPermissions = [
      { id: '1', module: 'Users', action: 'Read' },
      { id: '2', module: 'Roles', action: 'Write' }
    ] as any;
    component.selectedModule = 'Roles';
    expect(component.filteredPermissions.length).toBe(1);
    expect(component.filteredPermissions[0].module).toBe('Roles');
  });

  it('should bulk assign permissions in a module and handle partial success', (done) => {
    component.allPermissions = [
      { id: '1', module: 'Users', action: 'Read' },
      { id: '2', module: 'Users', action: 'Write' }
    ] as any;
    component.assignedPermissions = new Set(['1']);
    rolesServiceSpy.addPermissionToRole.and.returnValue(throwError(() => ({ status: 409, message: 'Conflict' })));

    component.selectAllInModule('Users');

    expect(rolesServiceSpy.addPermissionToRole).toHaveBeenCalled();
    setTimeout(() => {
      // For 409, we assume it's already there
      expect(component.assignedPermissions.has('2')).toBeTrue();
      expect(messageSpy.error).toHaveBeenCalled();
      done();
    }, 50);
  });

  it('should bulk unassign permissions and handle partial success', (done) => {
    component.allPermissions = [
      { id: '1', module: 'Users', action: 'Read' },
      { id: '2', module: 'Users', action: 'Write' }
    ] as any;
    component.assignedPermissions = new Set(['1', '2']);
    rolesServiceSpy.removePermissionFromRole.and.returnValue(throwError(() => ({ status: 404, message: 'Not found' })));

    component.deselectAllInModule('Users');

    expect(rolesServiceSpy.removePermissionFromRole).toHaveBeenCalled();
    setTimeout(() => {
      // For 404, we assume it's already gone
      expect(component.assignedPermissions.size).toBe(0);
      expect(messageSpy.error).toHaveBeenCalled();
      done();
    }, 50);
  });

  it('should handle error when loading permissions', () => {
    permissionsServiceSpy.getAll.and.returnValue(throwError(() => new Error('Load failed')));
    component.loadPermissions();
    expect(messageSpy.error).toHaveBeenCalledWith(jasmine.stringMatching('Failed to load permissions'));
    expect(component.loading).toBeFalse();
  });

  it('should use empty array if response format is unknown', () => {
    permissionsServiceSpy.getAll.and.returnValue(of({ invalid: true } as any));
    component.loadPermissions();
    expect(component.allPermissions).toEqual([]);
  });

  it('should correctly handle search term change via Subject', (done) => {
    spyOn(component as any, 'applySearchTerm').and.callThrough();
    component.searchTerm = 'testing-debounce';
    component.onSearchOrModuleChange();
    
    setTimeout(() => {
      expect((component as any).applySearchTerm).toHaveBeenCalledWith('testing-debounce');
      done();
    }, 350); // > 300ms debounce
  });

  it('should compute groupedPermissions correctly and cache it', () => {
    component.allPermissions = [
      { id: '1', module: 'Users', action: 'Read' },
      { id: '2', module: 'Users', action: 'Write' },
      { id: '3', module: 'Inventory', action: 'Read' }
    ] as any;
    const groups = component.groupedPermissions;
    expect(groups.length).toBe(2);
    expect(groups.find(g => g.module === 'Users')?.permissions.length).toBe(2);
    
    // Test caching
    const groups2 = component.groupedPermissions;
    expect(groups).toBe(groups2);
  });
});
