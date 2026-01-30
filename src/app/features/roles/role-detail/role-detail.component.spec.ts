import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RoleDetailComponent } from './role-detail.component';
import { RolesService } from '../../../core/services/roles.service';
import { PermissionsService } from '../../../core/services/permissions.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('RoleDetailComponent', () => {
  let component: RoleDetailComponent;
  let fixture: ComponentFixture<RoleDetailComponent>;
  let rolesServiceSpy: jasmine.SpyObj<RolesService>;
  let permissionsServiceSpy: jasmine.SpyObj<PermissionsService>;
  let messageServiceSpy: jasmine.SpyObj<NzMessageService>;
  let routerSpy: jasmine.SpyObj<Router>;

  const mockPermissions = { items: [{ id: 'p1', module: 'Users', action: 'Read' }] };
  const mockRole = { id: '1', name: 'Admin', permissions: [{ id: 'p1' }] };

  beforeEach(async () => {
    rolesServiceSpy = jasmine.createSpyObj('RolesService', ['getById', 'create', 'update']);
    permissionsServiceSpy = jasmine.createSpyObj('PermissionsService', ['getAll']);
    messageServiceSpy = jasmine.createSpyObj('NzMessageService', ['success', 'error']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    permissionsServiceSpy.getAll.and.returnValue(of(mockPermissions as any));

    await TestBed.configureTestingModule({
      imports: [ RoleDetailComponent, BrowserAnimationsModule, HttpClientTestingModule ],
      providers: [
        { provide: RolesService, useValue: rolesServiceSpy },
        { provide: PermissionsService, useValue: permissionsServiceSpy },
        { provide: NzMessageService, useValue: messageServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => 'new' } } } }
      ]
    })
    .compileComponents();
  });

  function createComponent(id: string | null) {
     if (id && id !== 'new') {
        rolesServiceSpy.getById.and.returnValue(of(mockRole as any));
     }
     const route = TestBed.inject(ActivatedRoute);
     spyOn(route.snapshot.paramMap, 'get').and.returnValue(id);
     
     fixture = TestBed.createComponent(RoleDetailComponent);
     component = fixture.componentInstance;
     fixture.detectChanges();
  }

  it('should create', () => {
    createComponent('new');
    expect(component).toBeTruthy();
  });

  it('should load role in edit mode', () => {
    createComponent('1');
    expect(component.isEditMode).toBeTrue();
    expect(rolesServiceSpy.getById).toHaveBeenCalledWith('1');
    expect(component.roleForm.value.name).toBe('Admin');
  });

  it('should save new role', () => {
    createComponent('new');
    rolesServiceSpy.create.and.returnValue(of(mockRole as any));
    component.roleForm.patchValue({ name: 'New Role' });
    component.save();
    expect(rolesServiceSpy.create).toHaveBeenCalled();

    expect(messageServiceSpy.success).toHaveBeenCalled();
  });
});
