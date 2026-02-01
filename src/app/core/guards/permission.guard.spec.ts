import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRouteSnapshot } from '@angular/router';
import { of } from 'rxjs';
import { permissionGuard } from './permission.guard';
import { AuthService } from '../services/auth.service';

describe('permissionGuard', () => {
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    spyOn(console, 'warn');
    authServiceSpy = jasmine.createSpyObj('AuthService', ['checkPermission'], {
      isLoading$: of(false)
    });
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    });
  });

  it('should allow activation when no module in route data', (done) => {
    const route = { data: {} } as ActivatedRouteSnapshot;
    TestBed.runInInjectionContext(() => {
      const result = permissionGuard(route, {} as any);
      if (typeof result === 'boolean') {
        expect(result).toBeTrue();
        done();
      } else if (typeof (result as any).subscribe === 'function') {
        (result as any).subscribe((value: boolean) => {
          expect(value).toBeTrue();
          done();
        });
      } else {
        done();
      }
    });
  });

  it('should allow activation when user has permission', (done) => {
    authServiceSpy.checkPermission.and.returnValue(of(true));
    const route = {
      data: { permission: { module: 'Inventory', action: 'Read' } }
    } as unknown as ActivatedRouteSnapshot;
    TestBed.runInInjectionContext(() => {
      const result = permissionGuard(route, {} as any);
      const obs = result as { subscribe: (cb: (v: boolean) => void) => void };
      obs.subscribe((value: boolean) => {
        expect(value).toBeTrue();
        expect(authServiceSpy.checkPermission).toHaveBeenCalledWith('Inventory', 'Read');
        expect(routerSpy.navigate).not.toHaveBeenCalled();
        done();
      });
    });
  });

  it('should deny activation and navigate to home when user lacks permission', (done) => {
    authServiceSpy.checkPermission.and.returnValue(of(false));
    const route = {
      data: { permission: { module: 'Users', action: 'Create' } }
    } as unknown as ActivatedRouteSnapshot;
    TestBed.runInInjectionContext(() => {
      const result = permissionGuard(route, {} as any);
      const obs = result as { subscribe: (cb: (v: boolean) => void) => void };
      obs.subscribe((value: boolean) => {
        expect(value).toBeFalse();
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
        done();
      });
    });
  });

  it('should use legacy route data format (module and action)', (done) => {
    authServiceSpy.checkPermission.and.returnValue(of(true));
    const route = {
      data: { module: 'Sales', action: 'Export' }
    } as unknown as ActivatedRouteSnapshot;
    TestBed.runInInjectionContext(() => {
      const result = permissionGuard(route, {} as any);
      const obs = result as { subscribe: (cb: (v: boolean) => void) => void };
      obs.subscribe((value: boolean) => {
        expect(value).toBeTrue();
        expect(authServiceSpy.checkPermission).toHaveBeenCalledWith('Sales', 'Export');
        done();
      });
    });
  });

  it('should default action to read when not specified', (done) => {
    authServiceSpy.checkPermission.and.returnValue(of(true));
    const route = {
      data: { module: 'Roles' }
    } as unknown as ActivatedRouteSnapshot;
    TestBed.runInInjectionContext(() => {
      const result = permissionGuard(route, {} as any);
      const obs = result as { subscribe: (cb: (v: boolean) => void) => void };
      obs.subscribe((value: boolean) => {
        expect(value).toBeTrue();
        expect(authServiceSpy.checkPermission).toHaveBeenCalledWith('Roles', 'read');
        done();
      });
    });
  });
});
