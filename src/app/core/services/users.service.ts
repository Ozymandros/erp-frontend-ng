import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClientService } from '../api/http-client.service';
import { USERS_ENDPOINTS } from '../api/endpoints.constants';
import {
  User,
  CreateUserRequest,
  UpdateUserRequest,
  PaginatedResponse,
  SearchParams
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

  assignRoles(userId: string, roleIds: string[]): Observable<User> {
    return this.apiClient.post<User>(USERS_ENDPOINTS.ROLES(userId), { roleIds });
  }
}

