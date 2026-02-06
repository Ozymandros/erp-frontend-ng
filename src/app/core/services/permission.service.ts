import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { PERMISSION_ACTIONS } from '../constants/permissions';

@Injectable({ providedIn: 'root' })
export class PermissionService {
  constructor(private authService: AuthService) {}

  /**
   * Client-side permission check using cached permissions from login.
   * NO API calls - uses user.permissions array from AuthService.
   * Use for: Sidebar visibility, button visibility, UI element visibility
   */
  hasPermission(module: string, action: string): boolean {
    const user = this.authService.getCurrentUser();
    if (!user) return false;
    if (user.isAdmin) return true;
        
    return user.permissions.some(
      (p: { module: string; action: string }) => p.module.toLowerCase() === module.toLowerCase() &&
           p.action.toLowerCase() === action.toLowerCase()
    );
  }

  /**
   * Check multiple permissions - returns true if user has ALL permissions
   */
  hasAllPermissions(permissions: Array<{ module: string; action: string }>): boolean {
    const user = this.authService.getCurrentUser();
    if (!user) return false;
    if (user.isAdmin) return true;
        
    return permissions.every(({ module, action }) =>
      this.hasPermission(module, action)
    );
  }

  /**
   * Get all CRUD permissions for a module
   * Returns object with boolean flags for each action
   */
  getModulePermissions(module: string): {
    canCreate: boolean;
    canRead: boolean;
    canUpdate: boolean;
    canDelete: boolean;
    canExport: boolean;
  } {
    const user = this.authService.getCurrentUser();
    if (!user) {
      return {
        canCreate: false,
        canRead: false,
        canUpdate: false,
        canDelete: false,
        canExport: false,
      };
    }
    if (user.isAdmin) {
      return {
        canCreate: true,
        canRead: true,
        canUpdate: true,
        canDelete: true,
        canExport: true,
      };
    }
    return {
      canCreate: this.hasPermission(module, PERMISSION_ACTIONS.CREATE),
      canRead: true, // Usually covered by route guard
      canUpdate: this.hasPermission(module, PERMISSION_ACTIONS.UPDATE),
      canDelete: this.hasPermission(module, PERMISSION_ACTIONS.DELETE),
      canExport: true, // Default to true
    };
  }
}
