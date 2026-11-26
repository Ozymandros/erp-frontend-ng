import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClientService } from '../api/http-client.service';
import { PROJECTS_ENDPOINTS } from '../api/endpoints.constants';
import type { CreateUpdateResourceGroupDto, ResourceGroupDto } from '../../types/projects.types';

@Injectable({
  providedIn: 'root',
})
export class ProjectResourceGroupsService {
  constructor(private readonly apiClient: ApiClientService) {}

  list(): Observable<ResourceGroupDto[]> {
    return this.apiClient.get<ResourceGroupDto[]>(PROJECTS_ENDPOINTS.RESOURCE_GROUPS);
  }

  getById(id: string): Observable<ResourceGroupDto> {
    return this.apiClient.get<ResourceGroupDto>(PROJECTS_ENDPOINTS.RESOURCE_GROUP_BY_ID(id));
  }

  create(dto: CreateUpdateResourceGroupDto): Observable<ResourceGroupDto> {
    return this.apiClient.post<ResourceGroupDto>(PROJECTS_ENDPOINTS.RESOURCE_GROUPS, dto);
  }

  update(id: string, dto: CreateUpdateResourceGroupDto): Observable<ResourceGroupDto> {
    return this.apiClient.put<ResourceGroupDto>(PROJECTS_ENDPOINTS.RESOURCE_GROUP_BY_ID(id), dto);
  }

  delete(id: string): Observable<void> {
    return this.apiClient.delete<void>(PROJECTS_ENDPOINTS.RESOURCE_GROUP_BY_ID(id));
  }

  exportToXlsx(): Observable<Blob> {
    return this.apiClient.download(PROJECTS_ENDPOINTS.RESOURCE_GROUPS_EXPORT_XLSX);
  }

  exportToPdf(): Observable<Blob> {
    return this.apiClient.download(PROJECTS_ENDPOINTS.RESOURCE_GROUPS_EXPORT_PDF);
  }
}
