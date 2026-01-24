import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HeaderComponent } from './header.component';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { User } from '../../types/api.types';
import { By } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let router: Router;

  const mockUser: User = {
    id: '1',
    username: 'testuser',
    email: 'test@example.com',
    roles: [{ id: 'r1', name: 'ADMIN', permissions: [], createdAt: '', createdBy: '' }],
    firstName: 'Test',
    lastName: 'User',
    emailConfirmed: true,
    isExternalLogin: false,
    
    isAdmin: true,
    permissions: [],
    createdAt: new Date().toISOString(),
    createdBy: 'system'
  };

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['logout'], {
      currentUser$: of(mockUser)
    });
    authServiceSpy.logout.and.returnValue(of(undefined));

    await TestBed.configureTestingModule({
      imports: [ HeaderComponent, BrowserAnimationsModule, HttpClientTestingModule, RouterTestingModule ],
      providers: [
        { provide: AuthService, useValue: authServiceSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    spyOn(router, 'navigate');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display user initials', () => {
    const initials = component.getUserInitials(mockUser);
    expect(initials).toBe('TU');
  });

  it('should display user initials in template', () => {
      // Use By.css to find the element, then get component instance. 
      // Note: By.directive(NzAvatarComponent) is also good but we know the selector.
      const avatarDebugElement = fixture.debugElement.query(By.css('nz-avatar'));
      expect(avatarDebugElement).toBeTruthy();
      // Access the component instance if possible, or check inner text
      // In NG-Zorro avatar, the text matches input
      // Since we can't easily import NzAvatarComponent (it's in node_modules), let's check innerText or use generic componentInstance
      const instance = avatarDebugElement.componentInstance;
      expect(instance.nzText).toBe('TU');
  });
  
  it('should navigate to profile on goToProfile', () => {
    component.goToProfile();
    expect(router.navigate).toHaveBeenCalledWith(['/profile']);
  });

  it('should call logout on logout', () => {
    component.logout();
    expect(authServiceSpy.logout).toHaveBeenCalled();
  });
  
  it('should fallback initials to username substring if names missing', () => {
      const u = { ...mockUser, firstName: undefined, lastName: undefined };
      expect(component.getUserInitials(u)).toBe('TE'); // 'testuser' -> TE
  });

  it('should fallback initials to U if nothing exists', () => {
      const u = { ...mockUser, firstName: undefined, lastName: undefined, username: '' };
      expect(component.getUserInitials(u)).toBe('U');
  });

});

