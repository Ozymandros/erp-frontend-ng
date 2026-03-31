import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { ApiClientService } from '../api/http-client.service';
import { CRM_ENDPOINTS } from '../api/endpoints.constants';
import type {
  CreateOpportunityDto,
  CreateOpportunityLineDto,
  ForecastSummaryDto,
  MarkOpportunityLostDto,
  MarkOpportunityWonRequest,
  MoveOpportunityStageDto,
  OpportunityDto,
  OpportunityLineDto,
  UpdateOpportunityForecastDto,
  UpdateOpportunityLineDto,
} from '../../types/crm.types';
import { BaseApiService } from '../base/base-api.service';

@Injectable({
  providedIn: 'root',
})
export class CrmOpportunitiesService extends BaseApiService<
  OpportunityDto,
  CreateOpportunityDto,
  never
> {
  constructor(apiClient: ApiClientService) {
    super(apiClient);
  }

  protected override getEndpoint(): string {
    return CRM_ENDPOINTS.OPPORTUNITIES;
  }

  override update(_id: string, _data: never): Observable<OpportunityDto> {
    return throwError(() => new Error('Use updateForecast, moveStage, or line APIs'));
  }

  override delete(_id: string): Observable<void> {
    return throwError(() => new Error('Opportunities are closed via mark-won/mark-lost, not deleted'));
  }

  override exportToXlsx(): Observable<Blob> {
    throw new Error('CRM opportunities export is not available');
  }

  override exportToPdf(): Observable<Blob> {
    throw new Error('CRM opportunities export is not available');
  }

  getForecastSummary(params: {
    ownerUsername?: string;
    fromExpectedCloseDate?: string;
    toExpectedCloseDate?: string;
  }): Observable<ForecastSummaryDto> {
    return this.apiClient.get<ForecastSummaryDto>(
      CRM_ENDPOINTS.OPPORTUNITY_FORECAST,
      params as Record<string, unknown>,
    );
  }

  updateForecast(id: string, dto: UpdateOpportunityForecastDto): Observable<OpportunityDto> {
    return this.apiClient.put<OpportunityDto>(CRM_ENDPOINTS.OPPORTUNITY_FORECAST_BY_ID(id), dto);
  }

  moveStage(id: string, dto: MoveOpportunityStageDto): Observable<OpportunityDto> {
    return this.apiClient.post<OpportunityDto>(CRM_ENDPOINTS.OPPORTUNITY_MOVE_STAGE(id), dto);
  }

  markWon(id: string, request: MarkOpportunityWonRequest): Observable<OpportunityDto> {
    return this.apiClient.post<OpportunityDto>(CRM_ENDPOINTS.OPPORTUNITY_MARK_WON(id), request);
  }

  markLost(id: string, dto: MarkOpportunityLostDto): Observable<OpportunityDto> {
    return this.apiClient.post<OpportunityDto>(CRM_ENDPOINTS.OPPORTUNITY_MARK_LOST(id), dto);
  }

  listLines(opportunityId: string): Observable<OpportunityLineDto[]> {
    return this.apiClient.get<OpportunityLineDto[]>(CRM_ENDPOINTS.OPPORTUNITY_LINES(opportunityId));
  }

  addLine(opportunityId: string, dto: CreateOpportunityLineDto): Observable<OpportunityLineDto> {
    return this.apiClient.post<OpportunityLineDto>(CRM_ENDPOINTS.OPPORTUNITY_LINES(opportunityId), dto);
  }

  updateLine(
    opportunityId: string,
    lineId: string,
    dto: UpdateOpportunityLineDto,
  ): Observable<OpportunityLineDto> {
    return this.apiClient.put<OpportunityLineDto>(
      CRM_ENDPOINTS.OPPORTUNITY_LINE_BY_ID(opportunityId, lineId),
      dto,
    );
  }

  removeLine(opportunityId: string, lineId: string): Observable<void> {
    return this.apiClient.delete<void>(CRM_ENDPOINTS.OPPORTUNITY_LINE_BY_ID(opportunityId, lineId));
  }
}
