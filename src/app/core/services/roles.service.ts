import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClientService } from '../api/http-client.service';
import { ROLES_ENDPOINTS } from '../api/endpoints.constants';
import {
  Role,
  CreateRoleRequest,
  UpdateRoleRequest,
  PaginatedResponse,
  SearchParams
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

  assignPermissions(roleId: string, permissionIds: string[]): Observable<Role> {
    return this.apiClient.post<Role>(ROLES_ENDPOINTS.PERMISSIONS(roleId), { permissionIds });
  }
}

