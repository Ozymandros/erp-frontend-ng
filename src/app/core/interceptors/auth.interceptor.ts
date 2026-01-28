import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  // Add Authorization header if token exists
  const token = sessionStorage.getItem('access_token');
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

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
