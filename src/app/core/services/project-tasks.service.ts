import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClientService } from '../api/http-client.service';
import { PROJECTS_ENDPOINTS } from '../api/endpoints.constants';
import type {
  CreateProjectTaskDto,
  MoveProjectTaskDto,
  ProjectTaskDto,
  ProjectTaskTreeNodeDto,
  UpdateProjectTaskDto,
} from '../../types/projects.types';

@Injectable({
  providedIn: 'root',
})
export class ProjectTasksService {
  constructor(private readonly apiClient: ApiClientService) {}

  list(projectId: string): Observable<ProjectTaskDto[]> {
    return this.apiClient.get<ProjectTaskDto[]>(PROJECTS_ENDPOINTS.TASKS(projectId));
  }

  getTree(projectId: string): Observable<ProjectTaskTreeNodeDto[]> {
    return this.apiClient.get<ProjectTaskTreeNodeDto[]>(PROJECTS_ENDPOINTS.TASKS_TREE(projectId));
  }

  getById(projectId: string, taskId: string): Observable<ProjectTaskDto> {
    return this.apiClient.get<ProjectTaskDto>(PROJECTS_ENDPOINTS.TASK_BY_ID(projectId, taskId));
  }

  create(projectId: string, dto: CreateProjectTaskDto): Observable<ProjectTaskDto> {
    return this.apiClient.post<ProjectTaskDto>(PROJECTS_ENDPOINTS.TASKS(projectId), dto);
  }

  update(projectId: string, taskId: string, dto: UpdateProjectTaskDto): Observable<ProjectTaskDto> {
    return this.apiClient.put<ProjectTaskDto>(PROJECTS_ENDPOINTS.TASK_BY_ID(projectId, taskId), dto);
  }

  delete(projectId: string, taskId: string): Observable<void> {
    return this.apiClient.delete<void>(PROJECTS_ENDPOINTS.TASK_BY_ID(projectId, taskId));
  }

  move(projectId: string, taskId: string, dto: MoveProjectTaskDto): Observable<ProjectTaskDto> {
    return this.apiClient.post<ProjectTaskDto>(PROJECTS_ENDPOINTS.TASK_MOVE(projectId, taskId), dto);
  }

  exportToXlsx(projectId: string): Observable<Blob> {
    return this.apiClient.download(PROJECTS_ENDPOINTS.TASKS_EXPORT_XLSX(projectId));
  }

  exportToPdf(projectId: string): Observable<Blob> {
    return this.apiClient.download(PROJECTS_ENDPOINTS.TASKS_EXPORT_PDF(projectId));
  }
}
