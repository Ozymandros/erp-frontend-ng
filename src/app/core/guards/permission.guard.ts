import { inject } from '@angular/core';
import { Router, CanActivateFn, ActivatedRouteSnapshot } from '@angular/router';
import { map, take, filter, switchMap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

/**
 * Guard that checks if the user has a specific permission for a module
 * usage in routes:
 * {
 *   path: 'products',
 *   component: ProductsListComponent,
 *   canActivate: [permissionGuard],
 *   data: { module: 'products', action: 'read' }
 * }
 */
export const permissionGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const module = route.data['module'];
  const action = route.data['action'] || 'read';

  if (!module) {
    console.warn('PermissionGuard: No module specified in route data');
    return true;
  }

  return authService.isLoading$.pipe(
    filter(loading => !loading),
    switchMap(() => authService.checkPermission(module, action)),
    take(1),
    map(allowed => {
      if (!allowed) {
        console.warn(`PermissionGuard: Access denied for ${module}:${action}`);
        router.navigate(['/']);
        return false;
      }
      return true;
    })
  );
};
