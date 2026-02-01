import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { Observable } from 'rxjs';
import { RoleSelectorComponent } from './role-selector.component';
import { UsersService } from '../../../../core/services/users.service';
import { RolesService } from '../../../../core/services/roles.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NZ_ICONS } from 'ng-zorro-antd/icon';
import { icons } from '../../../../ant-design-icons';
import { Role } from '../../../../types/api.types';
import { PaginatedResponse } from '../../../../types/api.types';

describe('RoleSelectorComponent', () => {
  let component: RoleSelectorComponent;
  let fixture: ComponentFixture<RoleSelectorComponent>;
  let usersServiceSpy: jasmine.SpyObj<UsersService>;
  let rolesServiceSpy: jasmine.SpyObj<RolesService>;
  let messageSpy: jasmine.SpyObj<NzMessageService>;

  const mockRoles: Role[] = [
    { id: 'r1', name: 'Admin', description: 'Admin role', permissions: [], createdAt: '', createdBy: '' },
    { id: 'r2', name: 'User', description: 'User role', permissions: [], createdAt: '', createdBy: '' }
  ];

  const paginatedRoles: PaginatedResponse<Role> = {
    items: mockRoles,
    total: mockRoles.length,
    page: 1,
    pageSize: 100,
    totalPages: 1,
    hasPreviousPage: false,
    hasNextPage: false
  };

  const voidObs: Observable<void> = of(undefined);

  beforeEach(async () => {
    usersServiceSpy = jasmine.createSpyObj('UsersService', ['assignRole', 'removeRole']);
    usersServiceSpy.assignRole.and.returnValue(voidObs);
    usersServiceSpy.removeRole.and.returnValue(voidObs);
    rolesServiceSpy = jasmine.createSpyObj('RolesService', ['getAll']);
    rolesServiceSpy.getAll.and.returnValue(of(paginatedRoles));
    messageSpy = jasmine.createSpyObj('NzMessageService', ['success', 'error']);

    await TestBed.configureTestingModule({
      imports: [RoleSelectorComponent],
      providers: [
        { provide: UsersService, useValue: usersServiceSpy },
        { provide: RolesService, useValue: rolesServiceSpy },
        { provide: NzMessageService, useValue: messageSpy },
        { provide: NZ_ICONS, useValue: icons }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RoleSelectorComponent);
    component = fixture.componentInstance;
    component.userId = 'user1';
    component.initialRoles = [];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load roles on init', () => {
    expect(rolesServiceSpy.getAll).toHaveBeenCalledWith({ pageSize: 100 });
    expect(component.allRoles).toEqual(mockRoles);
  });

  it('should set assignedRoles from initialRoles', () => {
    fixture = TestBed.createComponent(RoleSelectorComponent);
    component = fixture.componentInstance;
    component.userId = 'user1';
    component.initialRoles = [mockRoles[0]];
    fixture.detectChanges();
    expect(component.assignedRoles.has('r1')).toBeTrue();
  });

  it('should return true for isAssigned when role id is in set', () => {
    component.assignedRoles = new Set(['r1']);
    expect(component.isAssigned('r1')).toBeTrue();
    expect(component.isAssigned('r2')).toBeFalse();
  });

  it('should call usersService.assignRole when assignRole', (done) => {
    component.assignedRoles = new Set();
    component.saving = false;
    spyOn(component.rolesChange, 'emit');

    component.assignRole(mockRoles[0]);

    expect(usersServiceSpy.assignRole).toHaveBeenCalledWith('user1', 'Admin');
    setTimeout(() => {
      expect(component.assignedRoles.has('r1')).toBeTrue();
      expect(messageSpy.success).toHaveBeenCalled();
      expect(component.rolesChange.emit).toHaveBeenCalled();
      done();
    }, 50);
  });

  it('should call usersService.removeRole when unassignRole', (done) => {
    component.assignedRoles = new Set(['r1']);
    component.saving = false;
    spyOn(component.rolesChange, 'emit');

    component.unassignRole(mockRoles[0]);

    expect(usersServiceSpy.removeRole).toHaveBeenCalledWith('user1', 'Admin');
    setTimeout(() => {
      expect(component.assignedRoles.has('r1')).toBeFalse();
      expect(messageSpy.success).toHaveBeenCalled();
      expect(component.rolesChange.emit).toHaveBeenCalled();
      done();
    }, 50);
  });
});
