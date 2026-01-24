import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClientService } from '../api/http-client.service';
import { SALES_ENDPOINTS } from '../api/endpoints.constants';
import {
  CustomerDto,
  PaginatedResponse,
  SearchParams
} from '../types/api.types';

@Injectable({
  providedIn: 'root'
})
export class CustomersService {
  constructor(private apiClient: ApiClientService) {}

  getCustomers(params?: SearchParams): Observable<PaginatedResponse<CustomerDto>> {
    return this.apiClient.get<PaginatedResponse<CustomerDto>>(SALES_ENDPOINTS.CUSTOMERS, params);
  }

  getCustomerById(id: string): Observable<CustomerDto> {
    return this.apiClient.get<CustomerDto>(SALES_ENDPOINTS.CUSTOMER_BY_ID(id));
  }

  createCustomer(data: Partial<CustomerDto>): Observable<CustomerDto> {
    return this.apiClient.post<CustomerDto>(SALES_ENDPOINTS.CUSTOMERS, data);
  }

  updateCustomer(id: string, data: Partial<CustomerDto>): Observable<CustomerDto> {
    return this.apiClient.put<CustomerDto>(SALES_ENDPOINTS.CUSTOMER_BY_ID(id), data);
  }

  deleteCustomer(id: string): Observable<void> {
    return this.apiClient.delete<void>(SALES_ENDPOINTS.CUSTOMER_BY_ID(id));
  }

  exportToXlsx(): Observable<Blob> {
    return this.apiClient.download(SALES_ENDPOINTS.CUSTOMERS_EXPORT_XLSX);
  }

  exportToPdf(): Observable<Blob> {
    return this.apiClient.download(SALES_ENDPOINTS.CUSTOMERS_EXPORT_PDF);
  }
}
