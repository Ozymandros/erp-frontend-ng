import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { RegisterComponent } from './register.component';
import { AuthService } from '../../../core/services/auth.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let messageServiceSpy: jasmine.SpyObj<NzMessageService>;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['register']);
    messageServiceSpy = jasmine.createSpyObj('NzMessageService', ['success', 'error']);

    await TestBed.configureTestingModule({
      imports: [ RegisterComponent ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: authServiceSpy },
        { provide: NzMessageService, useValue: messageServiceSpy },
        { provide: ActivatedRoute, useValue: {} }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fail if passwords do not match', () => {
    component.registerForm.controls['username'].setValue('user');
    component.registerForm.controls['email'].setValue('test@example.com');
    component.registerForm.controls['password'].setValue('password123');
    component.registerForm.controls['passwordConfirm'].setValue('password456');
    
    component.onSubmit();
    
    expect(messageServiceSpy.error).toHaveBeenCalledWith('Passwords do not match!');
    expect(authServiceSpy.register).not.toHaveBeenCalled();
  });

  it('should submit if form is valid and passwords match', () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      username: 'user',
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
    authServiceSpy.register.and.returnValue(of({
      accessToken: '123',
      refreshToken: 'ref',
      expiresIn: 3600,
      tokenType: 'Bearer',
      user: mockUser as any
    }));
    
    component.registerForm.controls['username'].setValue('user');
    component.registerForm.controls['email'].setValue('test@example.com');
    component.registerForm.controls['password'].setValue('password123');
    component.registerForm.controls['passwordConfirm'].setValue('password123');
    
    component.onSubmit();
    
    expect(authServiceSpy.register).toHaveBeenCalled();
    expect(messageServiceSpy.success).toHaveBeenCalledWith('Registration successful!');
  });
  
  it('should handle registration error', () => {
    authServiceSpy.register.and.returnValue(throwError(() => new Error('Email exists')));
    
    component.registerForm.controls['username'].setValue('user');
    component.registerForm.controls['email'].setValue('exist@example.com');
    component.registerForm.controls['password'].setValue('password123');
    component.registerForm.controls['passwordConfirm'].setValue('password123');
    
    component.onSubmit();
    
    expect(authServiceSpy.register).toHaveBeenCalled();
    expect(messageServiceSpy.error).toHaveBeenCalledWith('Email exists');
  });
});
