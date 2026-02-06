import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ProfileComponent } from './profile.component';
import { AuthService } from '../../core/services/auth.service';
import { UsersService } from '../../core/services/users.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { of, BehaviorSubject } from 'rxjs';
import { User } from '../../types/api.types';

describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let usersServiceSpy: jasmine.SpyObj<UsersService>;
  let messageServiceSpy: jasmine.SpyObj<NzMessageService>;
  let userSubject: BehaviorSubject<User | null>;

  const mockUser: User = {
    id: '1',
    username: 'test',
    email: 'test@example.com',
    roles: [{ id: 'r1', name: 'ADMIN', permissions: [], createdAt: '', createdBy: '' }],
    firstName: 'Test',
    lastName: 'User',
    emailConfirmed: true,
    isExternalLogin: false,
    isAdmin: true,
    isActive: true,
    permissions: [],
    createdAt: new Date().toISOString(),
    createdBy: 'system'
  };

  beforeEach(async () => {
    userSubject = new BehaviorSubject<User | null>(mockUser);
    authServiceSpy = jasmine.createSpyObj('AuthService', ['refreshUserData'], {
      currentUser$: userSubject.asObservable()
    });
    authServiceSpy.refreshUserData.and.returnValue(of(mockUser));
    usersServiceSpy = jasmine.createSpyObj('UsersService', ['update']);
    messageServiceSpy = jasmine.createSpyObj('NzMessageService', ['success', 'error']);

    await TestBed.configureTestingModule({
      imports: [ ProfileComponent ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: authServiceSpy },
        { provide: UsersService, useValue: usersServiceSpy },
        { provide: NzMessageService, useValue: messageServiceSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with user data', () => {
    expect(component.profileForm.value.email).toBe('test@example.com');
    expect(component.profileForm.value.firstName).toBe('Test');
  });

  it('should update profile', () => {
    usersServiceSpy.update.and.returnValue(of({ ...mockUser, firstName: 'Updated' }));
    
    component.profileForm.controls['firstName'].setValue('Updated');
    component.updateProfile();
    
    expect(usersServiceSpy.update).toHaveBeenCalledWith('1', jasmine.objectContaining({ firstName: 'Updated' }));
    expect(messageServiceSpy.success).toHaveBeenCalled();
  });

  it('should change password', () => {
    usersServiceSpy.update.and.returnValue(of(mockUser));
    
    component.passwordForm.controls['password'].setValue('newpass');
    component.changePassword();
    
    expect(usersServiceSpy.update).toHaveBeenCalledWith('1', jasmine.objectContaining({ password: 'newpass' }));
    expect(messageServiceSpy.success).toHaveBeenCalled();
  });

});

