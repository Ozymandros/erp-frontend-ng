import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClientService } from '../api/http-client.service';
import { INVENTORY_ENDPOINTS } from '../api/endpoints.constants';
import {
  WarehouseDto,
  CreateUpdateWarehouseDto,
  PaginatedResponse,
  SearchParams
} from '../types/api.types';
import { BaseApiService } from '../base/base-api.service';


@Injectable({
  providedIn: 'root'
})
export class WarehousesService extends BaseApiService<WarehouseDto, CreateUpdateWarehouseDto, CreateUpdateWarehouseDto> {

  constructor(apiClient: ApiClientService) {
    super(apiClient);
  }

  protected getEndpoint(): string {
    return INVENTORY_ENDPOINTS.WAREHOUSES;
  }
}

