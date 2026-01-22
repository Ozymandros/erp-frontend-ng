import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClientService } from '../api/http-client.service';
import { INVENTORY_ENDPOINTS } from '../api/endpoints.constants';
import {
  WarehouseStockDto,
  PaginatedResponse,
  SearchParams
} from '../types/api.types';

@Injectable({
  providedIn: 'root'
})
export class WarehouseStocksService {
  constructor(private apiClient: ApiClientService) {}

  getWarehouseStocks(params?: SearchParams): Observable<PaginatedResponse<WarehouseStockDto>> {
    return this.apiClient.get<PaginatedResponse<WarehouseStockDto>>(INVENTORY_ENDPOINTS.WAREHOUSE_STOCKS, params);
  }
}
