import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { ApiClientService } from '../api/http-client.service';
import { CRM_ENDPOINTS } from '../api/endpoints.constants';
import type {
  ActivityDto,
  CompleteActivityDto,
  CreateActivityDto,
} from '../../types/crm.types';
import { BaseApiService } from '../base/base-api.service';

@Injectable({
  providedIn: 'root',
})
export class CrmActivitiesService extends BaseApiService<ActivityDto, CreateActivityDto, never> {
  constructor(apiClient: ApiClientService) {
    super(apiClient);
  }

  protected override getEndpoint(): string {
    return CRM_ENDPOINTS.ACTIVITIES;
  }

  override update(_id: string, _data: never): Observable<ActivityDto> {
    return throwError(() => new Error('Activities are updated via complete only'));
  }

  override delete(_id: string): Observable<void> {
    return throwError(() => new Error('Activities are not deleted via this API'));
  }

  override exportToXlsx(): Observable<Blob> {
    throw new Error('CRM activities export is not available');
  }

  override exportToPdf(): Observable<Blob> {
    throw new Error('CRM activities export is not available');
  }

  complete(id: string, dto: CompleteActivityDto): Observable<ActivityDto> {
    return this.apiClient.post<ActivityDto>(CRM_ENDPOINTS.ACTIVITY_COMPLETE(id), dto);
  }
}
