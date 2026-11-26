import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClientService } from '../api/http-client.service';
import { PROJECTS_ENDPOINTS } from '../api/endpoints.constants';
import { BaseApiService } from '../base/base-api.service';
import { PaginatedResponse } from '../../types/api.types';
import type { CreateUpdateResourceDto, ResourceDto } from '../../types/projects.types';

@Injectable({
  providedIn: 'root',
})
export class ProjectResourcesService extends BaseApiService<
  ResourceDto,
  CreateUpdateResourceDto,
  CreateUpdateResourceDto
> {
  constructor(apiClient: ApiClientService) {
    super(apiClient);
  }

  protected override getEndpoint(): string {
    return PROJECTS_ENDPOINTS.RESOURCES;
  }

  override getAll(params?: Record<string, unknown>): Observable<PaginatedResponse<ResourceDto>> {
    return this.apiClient.get<PaginatedResponse<ResourceDto>>(this.getEndpoint(), params);
  }
}
