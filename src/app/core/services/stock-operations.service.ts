import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClientService } from '../api/http-client.service';
import { INVENTORY_ENDPOINTS } from '../api/endpoints.constants';
import {
  StockOperationRequest
} from '../types/api.types';

@Injectable({
  providedIn: 'root'
})
export class StockOperationsService {
  constructor(private apiClient: ApiClientService) {}

  reserve(data: StockOperationRequest): Observable<void> {
    return this.apiClient.post<void>(`${INVENTORY_ENDPOINTS.STOCK_OPERATIONS}/reserve`, data);
  }

  transfer(data: StockOperationRequest): Observable<void> {
    return this.apiClient.post<void>(`${INVENTORY_ENDPOINTS.STOCK_OPERATIONS}/transfer`, data);
  }

  adjust(data: StockOperationRequest): Observable<void> {
    return this.apiClient.post<void>(`${INVENTORY_ENDPOINTS.STOCK_OPERATIONS}/adjust`, data);
  }
}
