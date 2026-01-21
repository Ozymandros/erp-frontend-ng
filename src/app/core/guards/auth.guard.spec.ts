import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { authGuard } from './auth.guard';
import { AuthService } from '@/app/core/services/auth.service';

describe('authGuard', () => {
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    authServiceSpy = jasmine.createSpyObj('AuthService', [], {
      isAuthenticated$: of(false)
    });
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    });
  });

  it('should allow activation if user is authenticated', (done) => {
    const authService = TestBed.inject(AuthService);
    (Object.getOwnPropertyDescriptor(authService, 'isAuthenticated$')?.get as jasmine.Spy).and.returnValue(of(true));

    TestBed.runInInjectionContext(() => {
      const result = authGuard(null as any, null as any);
      if (typeof result === 'boolean') {
        expect(result).toBeTrue();
        done();
      } else {
        (result as any).subscribe((resValue: any) => {
          expect(resValue).toBeTrue();
          done();
        });
      }
    });
  });

  it('should redirect to login if user is not authenticated', (done) => {
    const authService = TestBed.inject(AuthService);
    (Object.getOwnPropertyDescriptor(authService, 'isAuthenticated$')?.get as jasmine.Spy).and.returnValue(of(false));

    TestBed.runInInjectionContext(() => {
      const result = authGuard(null as any, null as any);
      if (typeof result === 'boolean') {
        expect(result).toBeFalse();
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
        done();
      } else {
        (result as any).subscribe((resValue: any) => {
          expect(resValue).toBeFalse();
          expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
          done();
        });
      }
    });
  });
});
