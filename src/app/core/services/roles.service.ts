import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClientService } from '../api/http-client.service';
import { ROLES_ENDPOINTS } from '../api/endpoints.constants';
import {
  Role,
  CreateRoleRequest,
  UpdateRoleRequest,
  Permission
} from '../../types/api.types';
import { BaseApiService } from '../base/base-api.service';

@Injectable({
  providedIn: 'root'
})
export class RolesService extends BaseApiService<Role, CreateRoleRequest, UpdateRoleRequest> {
  constructor(apiClient: ApiClientService) {
    super(apiClient);
  }

  protected getEndpoint(): string {
    return ROLES_ENDPOINTS.BASE;
  }

  /**
   * Add a permission to a role
   * POST /auth/api/roles/{roleId}/permissions?permissionId={permissionId}
   */
  addPermissionToRole(roleId: string, permissionId: string): Observable<void>;
  /**
   * Add multiple permissions to a role (bulk operation)
   * POST /auth/api/roles/{roleId}/permissions/bulk
   * Body: string[] (array of permission IDs)
   */
  addPermissionToRole(roleId: string, permissionIds: string[]): Observable<void>;
  addPermissionToRole(roleId: string, permissionIdOrIds: string | string[]): Observable<void> {
    if (Array.isArray(permissionIdOrIds)) {
      // Bulk operation: POST /api/Roles/{roleId}/permissions/bulk
      // Body: string[] (array of permission IDs)
      return this.apiClient.post<void>(
        `${ROLES_ENDPOINTS.BASE}/${roleId}/permissions/bulk`,
        permissionIdOrIds
      );
    } else {
      // Single operation: POST with query parameter
      return this.apiClient.post<void>(
        `${ROLES_ENDPOINTS.BASE}/${roleId}/permissions?permissionId=${permissionIdOrIds}`,
        null
      );
    }
  }

  /**
   * Remove a permission from a role
   * DELETE /auth/api/roles/{roleId}/permissions/{permissionId}
   */
  removePermissionFromRole(roleId: string, permissionId: string): Observable<void>;
  /**
   * Remove multiple permissions from a role (bulk operation)
   * DELETE /auth/api/roles/{roleId}/permissions/bulk
   * Body: string[] (array of permission IDs)
   */
  removePermissionFromRole(roleId: string, permissionIds: string[]): Observable<void>;
  removePermissionFromRole(roleId: string, permissionIdOrIds: string | string[]): Observable<void> {
    if (Array.isArray(permissionIdOrIds)) {
      // Bulk operation: DELETE /api/Roles/{roleId}/permissions/bulk
      // Body: string[] (array of permission IDs)
      return this.apiClient.delete<void>(
        `${ROLES_ENDPOINTS.BASE}/${roleId}/permissions/bulk`,
        { body: permissionIdOrIds }
      );
    } else {
      // Single operation: DELETE with path parameter
      return this.apiClient.delete<void>(
        `${ROLES_ENDPOINTS.BASE}/${roleId}/permissions/${permissionIdOrIds}`
      );
    }
  }

  /**
   * Get all permissions assigned to a role
   * GET /auth/api/roles/{roleId}/permissions
   */
  getRolePermissions(roleId: string): Observable<Permission[]> {
    return this.apiClient.get<Permission[]>(ROLES_ENDPOINTS.PERMISSIONS(roleId));
  }
}

