import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClientService } from '@/app/core/api/http-client.service';
import { PERMISSIONS_ENDPOINTS } from '@/app/core/api/endpoints.constants';
import {
  Permission,
  CreatePermissionRequest,
  UpdatePermissionRequest,
  PaginatedResponse,
  SearchParams
} from '@/app/types/api.types';

@Injectable({
  providedIn: 'root'
})
export class PermissionsService {
  constructor(private apiClient: ApiClientService) {}

  getPermissions(params?: SearchParams): Observable<PaginatedResponse<Permission>> {
    return this.apiClient.get<PaginatedResponse<Permission>>(PERMISSIONS_ENDPOINTS.BASE, params);
  }

  getPermissionById(id: string): Observable<Permission> {
    return this.apiClient.get<Permission>(PERMISSIONS_ENDPOINTS.BY_ID(id));
  }

  createPermission(data: CreatePermissionRequest): Observable<Permission> {
    return this.apiClient.post<Permission>(PERMISSIONS_ENDPOINTS.BASE, data);
  }

  updatePermission(id: string, data: UpdatePermissionRequest): Observable<Permission> {
    return this.apiClient.put<Permission>(PERMISSIONS_ENDPOINTS.BY_ID(id), data);
  }

  deletePermission(id: string): Observable<void> {
    return this.apiClient.delete<void>(PERMISSIONS_ENDPOINTS.BY_ID(id));
  }
}
