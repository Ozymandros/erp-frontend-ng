import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClientService } from '../api/http-client.service';
import { BILLING_ENDPOINTS } from '../api/endpoints.constants';
import { PaymentDto, PaymentMethod, PaginatedResponse, SearchParams } from '../../types/api.types';
import { BaseApiService } from '../base/base-api.service';

export interface CreatePaymentDto {
  invoiceId: string;
  amount: number;
  method: PaymentMethod | string;
  paidAt: string;
  externalPaymentId?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentsService extends BaseApiService<PaymentDto, CreatePaymentDto, Partial<PaymentDto>> {
  protected getEndpoint(): string {
    return BILLING_ENDPOINTS.PAYMENTS;
  }

  constructor(protected override apiClient: ApiClientService) {
    super(apiClient);
  }

  override getAll(params?: SearchParams): Observable<PaginatedResponse<PaymentDto>> {
    return this.apiClient.get<PaginatedResponse<PaymentDto>>(
      BILLING_ENDPOINTS.PAYMENTS,
      params as Record<string, unknown> | undefined
    );
  }

  getByInvoice(invoiceId: string): Observable<PaymentDto[]> {
    return this.apiClient.get<PaymentDto[]>(BILLING_ENDPOINTS.PAYMENTS_BY_INVOICE(invoiceId));
  }

  override exportToXlsx(): Observable<Blob> {
    return this.apiClient.download(BILLING_ENDPOINTS.PAYMENTS_EXPORT_XLSX);
  }

  override exportToPdf(): Observable<Blob> {
    return this.apiClient.download(BILLING_ENDPOINTS.PAYMENTS_EXPORT_PDF);
  }
}