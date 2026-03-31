import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClientService } from '../api/http-client.service';
import { CRM_ENDPOINTS } from '../api/endpoints.constants';
import type {
  CreateLeadDto,
  LeadDto,
  QualifyLeadDto,
  UpdateLeadDto,
} from '../../types/crm.types';
import { BaseApiService } from '../base/base-api.service';

@Injectable({
  providedIn: 'root',
})
export class CrmLeadsService extends BaseApiService<LeadDto, CreateLeadDto, UpdateLeadDto> {
  constructor(apiClient: ApiClientService) {
    super(apiClient);
  }

  protected override getEndpoint(): string {
    return CRM_ENDPOINTS.LEADS;
  }

  /** CRM has no export endpoints — not used by CRM lists */
  override exportToXlsx(): Observable<Blob> {
    throw new Error('CRM leads export is not available');
  }

  override exportToPdf(): Observable<Blob> {
    throw new Error('CRM leads export is not available');
  }

  qualify(id: string, dto: QualifyLeadDto): Observable<void> {
    return this.apiClient.post<void>(CRM_ENDPOINTS.LEAD_QUALIFY(id), dto);
  }
}
