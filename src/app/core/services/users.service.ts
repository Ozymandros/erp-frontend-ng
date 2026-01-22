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

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  constructor(private apiClient: ApiClientService) {}

  getUsers(params?: SearchParams): Observable<PaginatedResponse<User>> {
    return this.apiClient.get<PaginatedResponse<User>>(USERS_ENDPOINTS.BASE, params);
  }

  getUserById(id: string): Observable<User> {
    return this.apiClient.get<User>(USERS_ENDPOINTS.BY_ID(id));
  }

  createUser(data: CreateUserRequest): Observable<User> {
    return this.apiClient.post<User>(USERS_ENDPOINTS.BASE, data);
  }

  updateUser(id: string, data: UpdateUserRequest): Observable<User> {
    return this.apiClient.put<User>(USERS_ENDPOINTS.BY_ID(id), data);
  }

  deleteUser(id: string): Observable<void> {
    return this.apiClient.delete<void>(USERS_ENDPOINTS.BY_ID(id));
  }

  assignRoles(userId: string, roleIds: string[]): Observable<User> {
    return this.apiClient.post<User>(USERS_ENDPOINTS.ROLES(userId), { roleIds });
  }
}
