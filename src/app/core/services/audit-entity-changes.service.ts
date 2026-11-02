import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClientService } from '../api/http-client.service';
import { AUDIT_ENDPOINTS } from '../api/endpoints.constants';
import {
  EntityChangeDto,
  EntityChangeListParams,
  PaginatedResponse,
} from '../../types/api.types';
import { BaseApiService } from '../base/base-api.service';

/** Builds flat query params for audit list API (including Filters[key]). */
export function buildEntityChangeListQueryParams(
  params?: EntityChangeListParams,
): Record<string, string | number | boolean> {
  const query: Record<string, string | number | boolean> = {};

  if (!params) {
    return query;
  }

  if (params.page != null) {
    query['page'] = params.page;
  }
  if (params.pageSize != null) {
    query['pageSize'] = params.pageSize;
  }
  if (params.sortBy) {
    query['sortBy'] = params.sortBy;
  }
  if (params.sortDesc != null) {
    query['sortDesc'] = params.sortDesc;
  }
  if (params.sortOrder) {
    query['sortDesc'] = params.sortOrder === 'desc';
  }
  if (params.searchFields) {
    query['searchFields'] = params.searchFields;
  }
  if (params.searchTerm) {
    query['searchTerm'] = params.searchTerm;
  }
  if (params.search) {
    query['searchTerm'] = params.search;
  }

  if (params.filters) {
    for (const [key, value] of Object.entries(params.filters)) {
      if (value !== '' && value != null) {
        query[`Filters[${key}]`] = value;
      }
    }
  }

  return query;
}

@Injectable({
  providedIn: 'root',
})
export class AuditEntityChangesService extends BaseApiService<EntityChangeDto> {
  constructor(apiClient: ApiClientService) {
    super(apiClient);
  }

  protected getEndpoint(): string {
    return AUDIT_ENDPOINTS.ENTITY_CHANGES;
  }

  override getAll(params?: EntityChangeListParams): Observable<PaginatedResponse<EntityChangeDto>> {
    const query = buildEntityChangeListQueryParams(params);
    return this.apiClient.get<PaginatedResponse<EntityChangeDto>>(
      this.getEndpoint(),
      query,
    );
  }

  getByEntity(entityName: string, entityId: string): Observable<EntityChangeDto[]> {
    return this.apiClient.get<EntityChangeDto[]>(
      AUDIT_ENDPOINTS.BY_ENTITY(entityName, entityId),
    );
  }
}
