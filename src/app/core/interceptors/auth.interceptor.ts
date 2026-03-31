import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  // Note: Authorization header is already added by ApiClientService.getHeaders()
  // which uses the centralized token management via setAuthToken().
  // This interceptor only handles 401 errors to avoid duplicate headers.

  return next(req).pipe(
    catchError(error => {
      if (error.status === 401) {
        sessionStorage.clear();
        router.navigate(['/login']);
      }
      // Some gateways return 403 for invalid/expired JWT on /users/me; treat like session loss.
      if (
        error.status === 403 &&
        (req.url.includes('/auth/api/users/me') || (error.url && String(error.url).includes('/auth/api/users/me')))
      ) {
        sessionStorage.clear();
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};
