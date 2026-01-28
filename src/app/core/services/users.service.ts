import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClientService } from '../api/http-client.service';
import { USERS_ENDPOINTS } from '../api/endpoints.constants';
import {
  User,
  CreateUserRequest,
  UpdateUserRequest,
  PaginatedResponse,
  SearchParams,
  Role
} from '../types/api.types';
import { BaseApiService } from '../base/base-api.service';


@Injectable({
  providedIn: 'root'
})
export class UsersService extends BaseApiService<User, CreateUserRequest, UpdateUserRequest> {

  constructor(apiClient: ApiClientService) {
    super(apiClient);
  }

  protected getEndpoint(): string {
    return USERS_ENDPOINTS.BASE;
  }

  /**
   * Assign a role to a user
   * POST /auth/api/users/{userId}/roles/{roleName}
   */
  assignRole(userId: string, roleName: string): Observable<void> {
    return this.apiClient.post<void>(
      `${USERS_ENDPOINTS.BASE}/${userId}/roles/${roleName}`,
      null
    );
  }

  /**
   * Remove a role from a user
   * DELETE /auth/api/users/{userId}/roles/{roleName}
   */
  removeRole(userId: string, roleName: string): Observable<void> {
    return this.apiClient.delete<void>(
      `${USERS_ENDPOINTS.BASE}/${userId}/roles/${roleName}`
    );
  }

  /**
   * Get all roles assigned to a user
   * GET /auth/api/users/{userId}/roles
   */
  getUserRoles(userId: string): Observable<Role[]> {
    return this.apiClient.get<Role[]>(USERS_ENDPOINTS.ROLES(userId));
  }
}

