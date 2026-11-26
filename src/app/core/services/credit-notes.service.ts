import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClientService } from '../api/http-client.service';
import { BILLING_ENDPOINTS } from '../api/endpoints.constants';
import { CreditNoteDto, CreateCreditNoteDto, PaginatedResponse, SearchParams } from '../../types/api.types';
import { BaseApiService } from '../base/base-api.service';

@Injectable({
  providedIn: 'root'
})
export class CreditNotesService extends BaseApiService<CreditNoteDto, CreateCreditNoteDto, Partial<CreditNoteDto>> {
  protected getEndpoint(): string {
    return BILLING_ENDPOINTS.CREDIT_NOTES;
  }

  constructor(protected override apiClient: ApiClientService) {
    super(apiClient);
  }

  override getAll(params?: SearchParams): Observable<PaginatedResponse<CreditNoteDto>> {
    return this.apiClient.get<PaginatedResponse<CreditNoteDto>>(
      BILLING_ENDPOINTS.CREDIT_NOTES,
      params as Record<string, unknown> | undefined
    );
  }

  getByInvoice(invoiceId: string): Observable<CreditNoteDto[]> {
    return this.apiClient.get<CreditNoteDto[]>(BILLING_ENDPOINTS.CREDIT_NOTES_BY_INVOICE(invoiceId));
  }

  override exportToXlsx(): Observable<Blob> {
    return this.apiClient.download(BILLING_ENDPOINTS.CREDIT_NOTES_EXPORT_XLSX);
  }

  override exportToPdf(): Observable<Blob> {
    return this.apiClient.download(BILLING_ENDPOINTS.CREDIT_NOTES_EXPORT_PDF);
  }
}