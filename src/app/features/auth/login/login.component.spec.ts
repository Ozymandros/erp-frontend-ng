import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { LoginComponent } from './login.component';
import { AuthService } from '@/app/core/services/auth.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let messageServiceSpy: jasmine.SpyObj<NzMessageService>;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['login']);
    messageServiceSpy = jasmine.createSpyObj('NzMessageService', ['success', 'error']);

    await TestBed.configureTestingModule({
      imports: [ LoginComponent, BrowserAnimationsModule, HttpClientTestingModule ],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: NzMessageService, useValue: messageServiceSpy },
        { provide: ActivatedRoute, useValue: {} } 
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should invalidate empty form', () => {
    component.loginForm.controls['email'].setValue('');
    component.loginForm.controls['password'].setValue('');
    expect(component.loginForm.valid).toBeFalse();
  });

  it('should validate correct form', () => {
    component.loginForm.controls['email'].setValue('test@example.com');
    component.loginForm.controls['password'].setValue('password');
    expect(component.loginForm.valid).toBeTrue();
  });

  it('should call login on submit', () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      username: 'test',
      firstName: 'T',
      lastName: 'T',
      roles: [] as any[],
      permissions: [],
      isActive: true,
      emailConfirmed: true,
      isExternalLogin: false,
      isAdmin: false,
      createdAt: new Date().toISOString(),
      createdBy: 'system'
    };
    authServiceSpy.login.and.returnValue(of({
      accessToken: '123',
      refreshToken: 'ref',
      expiresIn: 3600,
      tokenType: 'Bearer',
      user: mockUser as any
    }));
    component.loginForm.controls['email'].setValue('test@example.com');
    component.loginForm.controls['password'].setValue('password');
    
    component.onSubmit();
    
    expect(authServiceSpy.login).toHaveBeenCalledWith({ email: 'test@example.com', password: 'password' });
    expect(messageServiceSpy.success).toHaveBeenCalledWith('Login successful!');
  });

  it('should handle login error', () => {
    authServiceSpy.login.and.returnValue(throwError(() => new Error('Invalid credentials')));
    component.loginForm.controls['email'].setValue('test@example.com');
    component.loginForm.controls['password'].setValue('wrong');
    
    component.onSubmit();
    
    expect(authServiceSpy.login).toHaveBeenCalled();
    expect(messageServiceSpy.error).toHaveBeenCalledWith('Invalid credentials');
    expect(component.isLoading).toBeFalse();
  });
});
