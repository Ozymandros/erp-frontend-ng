import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClientService } from '../api/http-client.service';
import { BILLING_ENDPOINTS } from '../api/endpoints.constants';
import type { CreateSupplierInvoiceDto, SupplierInvoiceDto } from '../../types/api.types';

@Injectable({
  providedIn: 'root',
})
export class SupplierInvoicesService {
  constructor(private readonly apiClient: ApiClientService) {}

  getByPurchaseOrder(purchaseOrderId: string): Observable<SupplierInvoiceDto[]> {
    return this.apiClient.get<SupplierInvoiceDto[]>(
      BILLING_ENDPOINTS.SUPPLIER_INVOICES_BY_PO(purchaseOrderId),
    );
  }

  create(dto: CreateSupplierInvoiceDto): Observable<SupplierInvoiceDto> {
    return this.apiClient.post<SupplierInvoiceDto>(BILLING_ENDPOINTS.SUPPLIER_INVOICES, dto);
  }

  getById(id: string): Observable<SupplierInvoiceDto> {
    return this.apiClient.get<SupplierInvoiceDto>(BILLING_ENDPOINTS.SUPPLIER_INVOICE_BY_ID(id));
  }
}
