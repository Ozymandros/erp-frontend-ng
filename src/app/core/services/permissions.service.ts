import { Injectable } from '@angular/core';
import { ApiClientService } from '../api/http-client.service';
import { PERMISSIONS_ENDPOINTS } from '../api/endpoints.constants';
import {
  Permission,
  CreatePermissionRequest,
  UpdatePermissionRequest
} from '../../types/api.types';
import { BaseApiService } from '../base/base-api.service';


@Injectable({
  providedIn: 'root'
})
export class PermissionsService extends BaseApiService<Permission, CreatePermissionRequest, UpdatePermissionRequest> {

  constructor(apiClient: ApiClientService) {
    super(apiClient);
  }

  protected getEndpoint(): string {
    return PERMISSIONS_ENDPOINTS.BASE;
  }
}

