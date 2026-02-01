import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
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
});
