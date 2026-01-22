import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { UserDetailComponent } from './user-detail.component';
import { UsersService } from '../../../core/services/users.service';
import { RolesService } from '../../../core/services/roles.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('UserDetailComponent', () => {
  let component: UserDetailComponent;
  let fixture: ComponentFixture<UserDetailComponent>;
  let usersServiceSpy: jasmine.SpyObj<UsersService>;
  let rolesServiceSpy: jasmine.SpyObj<RolesService>;
  let messageServiceSpy: jasmine.SpyObj<NzMessageService>;
  let routerSpy: jasmine.SpyObj<Router>;

  const mockUser = {
    id: '1',
    username: 'u1',
    email: 'u1@e.com',
    role: 'USER',
    roles: [{ id: 'r1', name: 'Role1' }],
    firstName: 'U',
    lastName: '1',
    isActive: true,
    createdAt: new Date().toISOString()
  };

  const mockRoles = { items: [{ id: 'r1', name: 'Role1' }, { id: 'r2', name: 'Role2' }] };

  beforeEach(async () => {
    usersServiceSpy = jasmine.createSpyObj('UsersService', ['getUserById', 'createUser', 'updateUser']);
    rolesServiceSpy = jasmine.createSpyObj('RolesService', ['getRoles']);
    messageServiceSpy = jasmine.createSpyObj('NzMessageService', ['success', 'error']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    rolesServiceSpy.getRoles.and.returnValue(of(mockRoles as any));

    await TestBed.configureTestingModule({
      imports: [ UserDetailComponent, BrowserAnimationsModule, HttpClientTestingModule ],
      providers: [
        { provide: UsersService, useValue: usersServiceSpy },
        { provide: RolesService, useValue: rolesServiceSpy },
        { provide: NzMessageService, useValue: messageServiceSpy },
        { provide: Router, useValue: routerSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: { get: () => 'new' } }
          }
        }
      ]
    })
    .compileComponents();
  });

  function createComponent(id: string | null) {
    if (id && id !== 'new') {
       usersServiceSpy.getUserById.and.returnValue(of(mockUser as any));
    }
    const route = TestBed.inject(ActivatedRoute);
    spyOn(route.snapshot.paramMap, 'get').and.returnValue(id);
    
    fixture = TestBed.createComponent(UserDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it('should create in create mode', () => {
    createComponent('new');
    expect(component).toBeTruthy();
    expect(component.isEditMode).toBeFalse();
  });

  it('should initialize in edit mode', () => {
    createComponent('1');
    expect(component.isEditMode).toBeTrue();
    expect(usersServiceSpy.getUserById).toHaveBeenCalledWith('1');
    expect(component.userForm.value.username).toBe('u1');
  });

  it('should load roles on init', () => {
    createComponent('new');
    expect(rolesServiceSpy.getRoles).toHaveBeenCalled();
    expect(component.allRoles.length).toBe(2);
  });

  it('should create user', () => {
    createComponent('new');
    usersServiceSpy.createUser.and.returnValue(of(mockUser as any));
    
    component.userForm.patchValue({
      username: 'newuser',
      email: 'new@example.com',
      password: 'password'
    });
    
    component.save();
    
    expect(usersServiceSpy.createUser).toHaveBeenCalled();
    expect(messageServiceSpy.success).toHaveBeenCalled();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/users']);
  });

  it('should update user', () => {
    createComponent('1');
    usersServiceSpy.updateUser.and.returnValue(of(mockUser as any));
    
    component.userForm.patchValue({ firstName: 'Updated' });
    component.save();
    
    expect(usersServiceSpy.updateUser).toHaveBeenCalledWith('1', jasmine.objectContaining({ firstName: 'Updated' }));
    expect(messageServiceSpy.success).toHaveBeenCalled();
  });
});
