import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClientService } from '../api/http-client.service';
import { INVENTORY_ENDPOINTS } from '../api/endpoints.constants';
import {
  InventoryTransactionDto,
  PaginatedResponse,
  SearchParams
} from '../types/api.types';

@Injectable({
  providedIn: 'root'
})
export class InventoryTransactionsService {
  constructor(private apiClient: ApiClientService) {}

  getInventoryTransactions(params?: SearchParams): Observable<PaginatedResponse<InventoryTransactionDto>> {
    return this.apiClient.get<PaginatedResponse<InventoryTransactionDto>>(INVENTORY_ENDPOINTS.TRANSACTIONS, params);
  }

  exportToXlsx(): Observable<Blob> {
    return this.apiClient.download(INVENTORY_ENDPOINTS.TRANSACTIONS_EXPORT_XLSX);
  }

  exportToPdf(): Observable<Blob> {
    return this.apiClient.download(INVENTORY_ENDPOINTS.TRANSACTIONS_EXPORT_PDF);
  }
}
