import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClientService } from '../api/http-client.service';
import { SALES_ENDPOINTS } from '../api/endpoints.constants';
import {
  SalesOrderDto,
  CreateUpdateSalesOrderDto,
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
}
