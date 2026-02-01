import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PermissionCardComponent } from './permission-card.component';
import { NZ_ICONS } from 'ng-zorro-antd/icon';
import { icons } from '../../../../ant-design-icons';
import { Permission } from '../../../../types/api.types';

describe('PermissionCardComponent', () => {
  let component: PermissionCardComponent;
  let fixture: ComponentFixture<PermissionCardComponent>;

  const mockPermission: Permission = {
    id: 'p1',
    module: 'Users',
    action: 'Read',
    createdAt: '',
    createdBy: ''
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PermissionCardComponent],
      providers: [{ provide: NZ_ICONS, useValue: icons }]
    }).compileComponents();

    fixture = TestBed.createComponent(PermissionCardComponent);
    component = fixture.componentInstance;
    component.permission = mockPermission;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit assign when onAssign is called and not readonly/saving', () => {
    component.readonly = false;
    component.saving = false;
    spyOn(component.assign, 'emit');
    component.onAssign();
    expect(component.assign.emit).toHaveBeenCalledWith(mockPermission);
  });

  it('should not emit assign when readonly', () => {
    component.readonly = true;
    spyOn(component.assign, 'emit');
    component.onAssign();
    expect(component.assign.emit).not.toHaveBeenCalled();
  });

  it('should not emit assign when saving', () => {
    component.saving = true;
    spyOn(component.assign, 'emit');
    component.onAssign();
    expect(component.assign.emit).not.toHaveBeenCalled();
  });

  it('should emit unassign when onUnassign is called and not readonly/saving', () => {
    component.readonly = false;
    component.saving = false;
    spyOn(component.unassign, 'emit');
    component.onUnassign();
    expect(component.unassign.emit).toHaveBeenCalledWith(mockPermission);
  });

  it('should not emit unassign when readonly', () => {
    component.readonly = true;
    spyOn(component.unassign, 'emit');
    component.onUnassign();
    expect(component.unassign.emit).not.toHaveBeenCalled();
  });
});
