import { inject } from '@angular/core';
import { Router, CanActivateFn, ActivatedRouteSnapshot } from '@angular/router';
import { map, take, filter, switchMap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { RoutePermission } from '../constants/permissions';

/**
 * Guard that checks if the user has a specific permission for a module
 * Calls backend /permissions/check endpoint for route authorization.
 * Usage in routes:
 * {
 *   path: 'products',
 *   component: ProductsListComponent,
 *   canActivate: [permissionGuard],
 *   data: { permission: { module: 'Inventory', action: 'Read' } }
 * }
 */
export const permissionGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const permission = route.data['permission'] as RoutePermission | undefined;
  
  // Fallback to old format for backward compatibility
  const module = permission?.module || route.data['module'];
  const action = permission?.action || route.data['action'] || 'read';

  if (!module) {
    console.warn('PermissionGuard: No module specified in route data');
    return true;
  }

  // Call backend /permissions/check endpoint for route authorization
  // This is the ONLY place where this endpoint should be called
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
