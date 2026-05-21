import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClientService } from '../api/http-client.service';
import { BILLING_ENDPOINTS } from '../api/endpoints.constants';
import {
  InvoiceDto,
  CreateInvoiceDto,
  IssueInvoiceRequest,
  CancelInvoiceRequest,
  RecordPaymentDto,
  CreateCreditNoteDto,
  CreditNoteDto,
  PaymentDto,
  PaginatedResponse,
  SearchParams,
} from '../../types/api.types';
import { BaseApiService } from '../base/base-api.service';

@Injectable({
  providedIn: 'root'
})
export class InvoicesService extends BaseApiService<InvoiceDto, CreateInvoiceDto, Partial<InvoiceDto>> {
  protected getEndpoint(): string {
    return BILLING_ENDPOINTS.INVOICES;
  }

  constructor(protected override apiClient: ApiClientService) {
    super(apiClient);
  }

  override getAll(params?: SearchParams): Observable<PaginatedResponse<InvoiceDto>> {
    return this.apiClient.get<PaginatedResponse<InvoiceDto>>(
      BILLING_ENDPOINTS.INVOICES,
      params as Record<string, unknown> | undefined
    );
  }

  search(params?: SearchParams): Observable<PaginatedResponse<InvoiceDto>> {
    return this.getAll(params);
  }

  getByCustomer(customerId: string): Observable<InvoiceDto[]> {
    return this.apiClient.get<InvoiceDto[]>(BILLING_ENDPOINTS.INVOICES_BY_CUSTOMER(customerId));
  }

  getByOrder(orderId: string): Observable<InvoiceDto[]> {
    return this.apiClient.get<InvoiceDto[]>(BILLING_ENDPOINTS.INVOICES_BY_ORDER(orderId));
  }

  getAllList(): Observable<InvoiceDto[]> {
    return this.apiClient.get<InvoiceDto[]>(BILLING_ENDPOINTS.INVOICES);
  }

  issue(id: string, data: IssueInvoiceRequest): Observable<InvoiceDto> {
    return this.apiClient.post<InvoiceDto>(BILLING_ENDPOINTS.INVOICE_ISSUE(id), data);
  }

  cancel(id: string, data: CancelInvoiceRequest): Observable<InvoiceDto> {
    return this.apiClient.post<InvoiceDto>(BILLING_ENDPOINTS.INVOICE_CANCEL(id), data);
  }

  recordPayment(id: string, data: RecordPaymentDto): Observable<InvoiceDto> {
    return this.apiClient.post<InvoiceDto>(BILLING_ENDPOINTS.INVOICE_PAYMENTS(id), data);
  }

  createCreditNote(id: string, data: CreateCreditNoteDto): Observable<CreditNoteDto> {
    return this.apiClient.post<CreditNoteDto>(BILLING_ENDPOINTS.INVOICE_CREDIT_NOTES(id), data);
  }

  getCreditNotes(invoiceId: string): Observable<CreditNoteDto[]> {
    return this.apiClient.get<CreditNoteDto[]>(BILLING_ENDPOINTS.CREDIT_NOTES_BY_INVOICE(invoiceId));
  }

  getPayments(invoiceId: string): Observable<PaymentDto[]> {
    return this.apiClient.get<PaymentDto[]>(BILLING_ENDPOINTS.PAYMENTS_BY_INVOICE(invoiceId));
  }

  override exportToXlsx(): Observable<Blob> {
    return this.apiClient.download(BILLING_ENDPOINTS.INVOICES_EXPORT_XLSX);
  }

  override exportToPdf(): Observable<Blob> {
    return this.apiClient.download(BILLING_ENDPOINTS.INVOICES_EXPORT_PDF);
  }
}