import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClientService } from '../api/http-client.service';
import { PROJECTS_ENDPOINTS } from '../api/endpoints.constants';
import type {
  ConsumptionOrderDto,
  CreateInvoiceRequestDto,
  CreateItemConsumptionDto,
  InvoiceRequestDto,
  PostUsageDto,
  ProjectLedgerEntryDto,
} from '../../types/projects.types';

@Injectable({
  providedIn: 'root',
})
export class ProjectPostingService {
  constructor(private readonly apiClient: ApiClientService) {}

  postUsage(projectId: string, dto: PostUsageDto): Observable<ProjectLedgerEntryDto> {
    return this.apiClient.post<ProjectLedgerEntryDto>(PROJECTS_ENDPOINTS.USAGE(projectId), dto);
  }

  listLedgerEntries(projectId: string, taskId?: string): Observable<ProjectLedgerEntryDto[]> {
    const params = taskId ? { taskId } : undefined;
    return this.apiClient.get<ProjectLedgerEntryDto[]>(
      PROJECTS_ENDPOINTS.LEDGER_ENTRIES(projectId),
      params,
    );
  }

  exportLedgerToXlsx(projectId: string): Observable<Blob> {
    return this.apiClient.download(PROJECTS_ENDPOINTS.LEDGER_EXPORT_XLSX(projectId));
  }

  exportLedgerToPdf(projectId: string): Observable<Blob> {
    return this.apiClient.download(PROJECTS_ENDPOINTS.LEDGER_EXPORT_PDF(projectId));
  }

  listConsumptionOrders(projectId: string): Observable<ConsumptionOrderDto[]> {
    return this.apiClient.get<ConsumptionOrderDto[]>(PROJECTS_ENDPOINTS.ITEM_CONSUMPTION(projectId));
  }

  createConsumptionOrder(
    projectId: string,
    dto: CreateItemConsumptionDto,
  ): Observable<ConsumptionOrderDto> {
    return this.apiClient.post<ConsumptionOrderDto>(PROJECTS_ENDPOINTS.ITEM_CONSUMPTION(projectId), dto);
  }

  listInvoiceRequests(projectId: string): Observable<InvoiceRequestDto[]> {
    return this.apiClient.get<InvoiceRequestDto[]>(PROJECTS_ENDPOINTS.INVOICE_REQUESTS(projectId));
  }

  createInvoiceRequest(
    projectId: string,
    dto: CreateInvoiceRequestDto,
  ): Observable<InvoiceRequestDto> {
    return this.apiClient.post<InvoiceRequestDto>(
      PROJECTS_ENDPOINTS.INVOICE_REQUESTS(projectId),
      dto,
    );
  }
}
