import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClientService } from '../api/http-client.service';
import { SALES_ENDPOINTS } from '../api/endpoints.constants';
import {
  SalesOrderDto,
  CreateUpdateSalesOrderDto,
  CreateQuoteDto,
  ConfirmQuoteDto,
  StockAvailabilityCheckDto,
  PaginatedResponse,
  SearchParams
} from '../types/api.types';

@Injectable({
  providedIn: 'root'
})
export class SalesOrdersService {
  constructor(private apiClient: ApiClientService) {}

  getSalesOrders(params?: SearchParams): Observable<PaginatedResponse<SalesOrderDto>> {
    return this.apiClient.get<PaginatedResponse<SalesOrderDto>>(SALES_ENDPOINTS.ORDERS, params);
  }

  getSalesOrderById(id: string): Observable<SalesOrderDto> {
    return this.apiClient.get<SalesOrderDto>(SALES_ENDPOINTS.ORDER_BY_ID(id));
  }

  createSalesOrder(data: CreateUpdateSalesOrderDto): Observable<SalesOrderDto> {
    return this.apiClient.post<SalesOrderDto>(SALES_ENDPOINTS.ORDERS, data);
  }

  updateSalesOrder(id: string, data: CreateUpdateSalesOrderDto): Observable<SalesOrderDto> {
    return this.apiClient.put<SalesOrderDto>(SALES_ENDPOINTS.ORDER_BY_ID(id), data);
  }

  deleteSalesOrder(id: string): Observable<void> {
    return this.apiClient.delete<void>(SALES_ENDPOINTS.ORDER_BY_ID(id));
  }

  createQuote(data: CreateQuoteDto): Observable<SalesOrderDto> {
    return this.apiClient.post<SalesOrderDto>(SALES_ENDPOINTS.CREATE_QUOTE, data);
  }

  confirmQuote(id: string, data: ConfirmQuoteDto): Observable<SalesOrderDto> {
    return this.apiClient.post<SalesOrderDto>(SALES_ENDPOINTS.CONFIRM_QUOTE(id), data);
  }

  checkStockAvailability(productIds: string[], quantities: number[]): Observable<StockAvailabilityCheckDto[]> {
    return this.apiClient.post<StockAvailabilityCheckDto[]>(
      SALES_ENDPOINTS.CHECK_STOCK, 
      { productIds, quantities }
    );
  }

  exportToXlsx(): Observable<Blob> {
    return this.apiClient.download(SALES_ENDPOINTS.ORDERS_EXPORT_XLSX);
  }

  exportToPdf(): Observable<Blob> {
    return this.apiClient.download(SALES_ENDPOINTS.ORDERS_EXPORT_PDF);
  }
}
