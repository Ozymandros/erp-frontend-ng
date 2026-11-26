import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClientService } from '../api/http-client.service';
import { PROJECTS_ENDPOINTS } from '../api/endpoints.constants';
import type { CreateUpdatePlanningLineDto, PlanningLineDto } from '../../types/projects.types';

@Injectable({
  providedIn: 'root',
})
export class ProjectPlanningLinesService {
  constructor(private readonly apiClient: ApiClientService) {}

  list(projectId: string, taskId?: string): Observable<PlanningLineDto[]> {
    const params = taskId ? { taskId } : undefined;
    return this.apiClient.get<PlanningLineDto[]>(PROJECTS_ENDPOINTS.PLANNING_LINES(projectId), params);
  }

  getById(projectId: string, lineId: string): Observable<PlanningLineDto> {
    return this.apiClient.get<PlanningLineDto>(
      PROJECTS_ENDPOINTS.PLANNING_LINE_BY_ID(projectId, lineId),
    );
  }

  create(projectId: string, dto: CreateUpdatePlanningLineDto): Observable<PlanningLineDto> {
    return this.apiClient.post<PlanningLineDto>(PROJECTS_ENDPOINTS.PLANNING_LINES(projectId), dto);
  }

  update(
    projectId: string,
    lineId: string,
    dto: CreateUpdatePlanningLineDto,
  ): Observable<PlanningLineDto> {
    return this.apiClient.put<PlanningLineDto>(
      PROJECTS_ENDPOINTS.PLANNING_LINE_BY_ID(projectId, lineId),
      dto,
    );
  }

  delete(projectId: string, lineId: string): Observable<void> {
    return this.apiClient.delete<void>(PROJECTS_ENDPOINTS.PLANNING_LINE_BY_ID(projectId, lineId));
  }

  exportToXlsx(projectId: string): Observable<Blob> {
    return this.apiClient.download(PROJECTS_ENDPOINTS.PLANNING_LINES_EXPORT_XLSX(projectId));
  }

  exportToPdf(projectId: string): Observable<Blob> {
    return this.apiClient.download(PROJECTS_ENDPOINTS.PLANNING_LINES_EXPORT_PDF(projectId));
  }
}
