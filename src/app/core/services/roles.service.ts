import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClientService } from '../api/http-client.service';
import { ROLES_ENDPOINTS } from '../api/endpoints.constants';
import {
  Role,
  CreateRoleRequest,
  UpdateRoleRequest,
  PaginatedResponse,
  SearchParams,
  Permission
} from '../types/api.types';
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
  addPermissionToRole(roleId: string, permissionId: string): Observable<void> {
    return this.apiClient.post<void>(
      `${ROLES_ENDPOINTS.BASE}/${roleId}/permissions?permissionId=${permissionId}`,
      null
    );
  }

  /**
   * Remove a permission from a role
   * DELETE /auth/api/roles/{roleId}/permissions/{permissionId}
   */
  removePermissionFromRole(roleId: string, permissionId: string): Observable<void> {
    return this.apiClient.delete<void>(
      `${ROLES_ENDPOINTS.BASE}/${roleId}/permissions/${permissionId}`
    );
  }

  /**
   * Get all permissions assigned to a role
   * GET /auth/api/roles/{roleId}/permissions
   */
  getRolePermissions(roleId: string): Observable<Permission[]> {
    return this.apiClient.get<Permission[]>(ROLES_ENDPOINTS.PERMISSIONS(roleId));
  }
}

