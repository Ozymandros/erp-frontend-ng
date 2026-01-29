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
        // Unauthorized - redirect to login
        sessionStorage.clear();
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};
