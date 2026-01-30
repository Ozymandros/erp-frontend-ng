import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { map, take, filter, switchMap } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth.service';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isLoading$.pipe(
    filter(loading => !loading),
    switchMap(() => authService.isAuthenticated$),
    take(1),
    map(isAuthenticated => {
      if (!isAuthenticated) {
        router.navigate(['/login']);
        return false;
      }
      return true;
    })
  );
};
