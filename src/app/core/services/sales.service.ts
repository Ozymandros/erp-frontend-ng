import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClientService } from '@/app/core/api/http-client.service';
import { SALES_ENDPOINTS } from '@/app/core/api/endpoints.constants';
import {
  CustomerDto,
  CreateUpdateCustomerDto,
  SalesOrderDto,
  PaginatedResponse,
  SearchParams
} from '@/app/types/api.types';

@Injectable({
  providedIn: 'root'
})
export class SalesService {
  constructor(private apiClient: ApiClientService) {}

  // Customers
  getCustomers(params?: SearchParams): Observable<PaginatedResponse<CustomerDto>> {
    return this.apiClient.get<PaginatedResponse<CustomerDto>>(SALES_ENDPOINTS.CUSTOMERS, params);
  }

  getCustomerById(id: string): Observable<CustomerDto> {
    return this.apiClient.get<CustomerDto>(SALES_ENDPOINTS.CUSTOMER_BY_ID(id));
  }

  createCustomer(data: CreateUpdateCustomerDto): Observable<CustomerDto> {
    return this.apiClient.post<CustomerDto>(SALES_ENDPOINTS.CUSTOMERS, data);
  }

  updateCustomer(id: string, data: CreateUpdateCustomerDto): Observable<CustomerDto> {
    return this.apiClient.put<CustomerDto>(SALES_ENDPOINTS.CUSTOMER_BY_ID(id), data);
  }

  deleteCustomer(id: string): Observable<void> {
    return this.apiClient.delete<void>(SALES_ENDPOINTS.CUSTOMER_BY_ID(id));
  }

  // Sales Orders
  getSalesOrders(params?: SearchParams): Observable<PaginatedResponse<SalesOrderDto>> {
    return this.apiClient.get<PaginatedResponse<SalesOrderDto>>(SALES_ENDPOINTS.ORDERS, params);
  }

  getSalesOrderById(id: string): Observable<SalesOrderDto> {
    return this.apiClient.get<SalesOrderDto>(SALES_ENDPOINTS.ORDER_BY_ID(id));
  }

  createSalesOrder(data: any): Observable<SalesOrderDto> {
    return this.apiClient.post<SalesOrderDto>(SALES_ENDPOINTS.ORDERS, data);
  }

  updateSalesOrder(id: string, data: any): Observable<SalesOrderDto> {
    return this.apiClient.put<SalesOrderDto>(SALES_ENDPOINTS.ORDER_BY_ID(id), data);
  }

  deleteSalesOrder(id: string): Observable<void> {
    return this.apiClient.delete<void>(SALES_ENDPOINTS.ORDER_BY_ID(id));
  }
}
