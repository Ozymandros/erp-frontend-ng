import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClientService } from '../api/http-client.service';
import { ORDERS_ENDPOINTS } from '../api/endpoints.constants';
import {
  OrderDto,
  PaginatedResponse,
  SearchParams
} from '../../types/api.types';

@Injectable({
  providedIn: 'root'
})
export class OrdersService {
  constructor(private readonly apiClient: ApiClientService) {}

  getOrders(params?: SearchParams): Observable<PaginatedResponse<OrderDto>> {
    return this.apiClient.get<PaginatedResponse<OrderDto>>(ORDERS_ENDPOINTS.BASE, params as Record<string, unknown> | undefined);
  }

  getOrderById(id: string): Observable<OrderDto> {
    return this.apiClient.get<OrderDto>(ORDERS_ENDPOINTS.BY_ID(id));
  }
}
