import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AssignedPermissionsViewComponent } from './assigned-permissions-view.component';
import { Permission } from '../../../../types/api.types';

describe('AssignedPermissionsViewComponent', () => {
  let component: AssignedPermissionsViewComponent;
  let fixture: ComponentFixture<AssignedPermissionsViewComponent>;

  const mockPermissions: Permission[] = [
    { id: 'p1', module: 'Users', action: 'Read', createdAt: '', createdBy: '' },
    { id: 'p2', module: 'Users', action: 'Create', createdAt: '', createdBy: '' },
    { id: 'p3', module: 'Inventory', action: 'Read', createdAt: '', createdBy: '' }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssignedPermissionsViewComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(AssignedPermissionsViewComponent);
    component = fixture.componentInstance;
    component.permissions = mockPermissions;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should group permissions by module', () => {
    const groups = component.groupedPermissions;
    expect(groups.has('Users')).toBeTrue();
    expect(groups.has('Inventory')).toBeTrue();
    expect(groups.get('Users')?.length).toBe(2);
    expect(groups.get('Inventory')?.length).toBe(1);
  });

  it('should return sorted module names from getSortedModules', () => {
    const modules = component.getSortedModules();
    expect(modules).toContain('Users');
    expect(modules).toContain('Inventory');
    expect(modules).toEqual(modules.slice().sort((a, b) => a.localeCompare(b)));
  });

  it('should handle empty permissions', () => {
    component.permissions = [];
    fixture.detectChanges();
    const groups = component.groupedPermissions;
    expect(groups.size).toBe(0);
    expect(component.getSortedModules()).toEqual([]);
  });
});
