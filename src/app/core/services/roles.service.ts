import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClientService } from '@/app/core/api/http-client.service';
import { ROLES_ENDPOINTS } from '@/app/core/api/endpoints.constants';
import {
  Role,
  CreateRoleRequest,
  UpdateRoleRequest,
  PaginatedResponse,
  SearchParams
} from '@/app/types/api.types';

@Injectable({
  providedIn: 'root'
})
export class RolesService {
  constructor(private apiClient: ApiClientService) {}

  getRoles(params?: SearchParams): Observable<PaginatedResponse<Role>> {
    return this.apiClient.get<PaginatedResponse<Role>>(ROLES_ENDPOINTS.BASE, params);
  }

  getRoleById(id: string): Observable<Role> {
    return this.apiClient.get<Role>(ROLES_ENDPOINTS.BY_ID(id));
  }

  createRole(data: CreateRoleRequest): Observable<Role> {
    return this.apiClient.post<Role>(ROLES_ENDPOINTS.BASE, data);
  }

  updateRole(id: string, data: UpdateRoleRequest): Observable<Role> {
    return this.apiClient.put<Role>(ROLES_ENDPOINTS.BY_ID(id), data);
  }

  deleteRole(id: string): Observable<void> {
    return this.apiClient.delete<void>(ROLES_ENDPOINTS.BY_ID(id));
  }

  assignPermissions(roleId: string, permissionIds: string[]): Observable<Role> {
    return this.apiClient.post<Role>(ROLES_ENDPOINTS.PERMISSIONS(roleId), { permissionIds });
  }
}
