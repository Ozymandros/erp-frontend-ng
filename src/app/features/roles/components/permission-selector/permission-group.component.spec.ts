import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PermissionGroupComponent, PermissionGroup } from './permission-group.component';
import { NZ_ICONS } from 'ng-zorro-antd/icon';
import { icons } from '../../../../ant-design-icons';
import { Permission } from '../../../../types/api.types';

describe('PermissionGroupComponent', () => {
  let component: PermissionGroupComponent;
  let fixture: ComponentFixture<PermissionGroupComponent>;

  const mockPermissions: Permission[] = [
    { id: 'p1', module: 'Users', action: 'Read', createdAt: '', createdBy: '' },
    { id: 'p2', module: 'Users', action: 'Create', createdAt: '', createdBy: '' }
  ];
  const mockGroup: PermissionGroup = { module: 'Users', permissions: mockPermissions };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PermissionGroupComponent],
      providers: [{ provide: NZ_ICONS, useValue: icons }]
    }).compileComponents();

    fixture = TestBed.createComponent(PermissionGroupComponent);
    component = fixture.componentInstance;
    component.group = mockGroup;
    component.assignedPermissionIds = new Set<string>();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should return true for isAssigned when permission id is in set', () => {
    component.assignedPermissionIds = new Set(['p1']);
    expect(component.isAssigned('p1')).toBeTrue();
    expect(component.isAssigned('p2')).toBeFalse();
  });

  it('should emit selectAll when onSelectAll is called and not saving', () => {
    spyOn(component.selectAll, 'emit');
    component.onSelectAll();
    expect(component.selectAll.emit).toHaveBeenCalledWith('Users');
  });

  it('should emit deselectAll when onDeselectAll is called and not saving', () => {
    spyOn(component.deselectAll, 'emit');
    component.onDeselectAll();
    expect(component.deselectAll.emit).toHaveBeenCalledWith('Users');
  });

  it('should emit assign when child emits', () => {
    spyOn(component.assign, 'emit');
    component.assign.emit(mockPermissions[0]);
    expect(component.assign.emit).toHaveBeenCalledWith(mockPermissions[0]);
  });

  it('should emit unassign when child emits', () => {
    spyOn(component.unassign, 'emit');
    component.unassign.emit(mockPermissions[0]);
    expect(component.unassign.emit).toHaveBeenCalledWith(mockPermissions[0]);
  });
});
