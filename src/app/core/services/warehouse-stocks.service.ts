import { Injectable } from '@angular/core';
import { ApiClientService } from '../api/http-client.service';
import { INVENTORY_ENDPOINTS } from '../api/endpoints.constants';
import { WarehouseStockDto } from '../../types/api.types';
import { BaseApiService } from '../base/base-api.service';

@Injectable({
  providedIn: 'root'
})
export class WarehouseStocksService extends BaseApiService<WarehouseStockDto> {
  constructor(protected override apiClient: ApiClientService) {
    super(apiClient);
  }

  protected getEndpoint(): string {
    return INVENTORY_ENDPOINTS.WAREHOUSE_STOCKS;
  }
}
