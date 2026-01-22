import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClientService } from '../api/http-client.service';
import { PURCHASING_ENDPOINTS } from '../api/endpoints.constants';
import {
  PurchaseOrderDto,
  CreateUpdatePurchaseOrderDto,
  PaginatedResponse,
  SearchParams
} from '../types/api.types';

@Injectable({
  providedIn: 'root'
})
export class PurchaseOrdersService {
  constructor(private apiClient: ApiClientService) {}

  getPurchaseOrders(params?: SearchParams): Observable<PaginatedResponse<PurchaseOrderDto>> {
    return this.apiClient.get<PaginatedResponse<PurchaseOrderDto>>(PURCHASING_ENDPOINTS.ORDERS, params);
  }

  getPurchaseOrderById(id: string): Observable<PurchaseOrderDto> {
    return this.apiClient.get<PurchaseOrderDto>(PURCHASING_ENDPOINTS.ORDER_BY_ID(id));
  }

  createPurchaseOrder(data: CreateUpdatePurchaseOrderDto): Observable<PurchaseOrderDto> {
    return this.apiClient.post<PurchaseOrderDto>(PURCHASING_ENDPOINTS.ORDERS, data);
  }

  updatePurchaseOrder(id: string, data: CreateUpdatePurchaseOrderDto): Observable<PurchaseOrderDto> {
    return this.apiClient.put<PurchaseOrderDto>(PURCHASING_ENDPOINTS.ORDER_BY_ID(id), data);
  }

  deletePurchaseOrder(id: string): Observable<void> {
    return this.apiClient.delete<void>(PURCHASING_ENDPOINTS.ORDER_BY_ID(id));
  }
}
