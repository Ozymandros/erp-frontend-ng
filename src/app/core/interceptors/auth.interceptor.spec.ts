import { TestBed } from '@angular/core/testing';
import { HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { throwError } from 'rxjs';
import { authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    
    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: routerSpy }
      ]
    });
  });

  it('should redirect to login and clear session on 401 error', (done) => {
    const req = new HttpRequest('GET', '/test');
    const next: HttpHandlerFn = () => throwError(() => new HttpErrorResponse({ status: 401 }));
    
    spyOn(sessionStorage, 'clear');

    TestBed.runInInjectionContext(() => {
      authInterceptor(req, next).subscribe({
        error: (err: any) => {
          expect(err.status).toBe(401);
          expect(sessionStorage.clear).toHaveBeenCalled();
          expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
          done();
        }
      });
    });
  });

  it('should not redirect on other errors', (done) => {
    const req = new HttpRequest('GET', '/test');
    const next: HttpHandlerFn = () => throwError(() => new HttpErrorResponse({ status: 500 }));
    
    spyOn(sessionStorage, 'clear');

    TestBed.runInInjectionContext(() => {
      authInterceptor(req, next).subscribe({
        error: (err: any) => {
          expect(err.status).toBe(500);
          expect(sessionStorage.clear).not.toHaveBeenCalled();
          expect(routerSpy.navigate).not.toHaveBeenCalled();
          done();
        }
      });
    });
  });
});
