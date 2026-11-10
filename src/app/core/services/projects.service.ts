import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClientService } from '../api/http-client.service';
import { PROJECTS_ENDPOINTS } from '../api/endpoints.constants';
import { BaseApiService } from '../base/base-api.service';
import { PaginatedResponse } from '../../types/api.types';
import type {
  ChangeProjectStatusDto,
  CopyProjectDto,
  CreateProjectDto,
  ProjectDto,
  ProjectStatisticsDto,
  UpdateProjectDto,
} from '../../types/projects.types';

@Injectable({
  providedIn: 'root',
})
export class ProjectsService extends BaseApiService<ProjectDto, CreateProjectDto, UpdateProjectDto> {
  constructor(apiClient: ApiClientService) {
    super(apiClient);
  }

  protected override getEndpoint(): string {
    return PROJECTS_ENDPOINTS.PROJECTS;
  }

  override getAll(params?: Record<string, unknown>): Observable<PaginatedResponse<ProjectDto>> {
    return this.apiClient.get<PaginatedResponse<ProjectDto>>(this.getEndpoint(), params);
  }

  getByNumber(projectNumber: string): Observable<ProjectDto> {
    return this.apiClient.get<ProjectDto>(PROJECTS_ENDPOINTS.PROJECT_BY_NUMBER(projectNumber));
  }

  changeStatus(id: string, dto: ChangeProjectStatusDto): Observable<ProjectDto> {
    return this.apiClient.post<ProjectDto>(PROJECTS_ENDPOINTS.PROJECT_STATUS(id), dto);
  }

  copy(id: string, dto: CopyProjectDto): Observable<ProjectDto> {
    return this.apiClient.post<ProjectDto>(PROJECTS_ENDPOINTS.PROJECT_COPY(id), dto);
  }

  getStatistics(id: string): Observable<ProjectStatisticsDto> {
    return this.apiClient.get<ProjectStatisticsDto>(PROJECTS_ENDPOINTS.PROJECT_STATISTICS(id));
  }
}
