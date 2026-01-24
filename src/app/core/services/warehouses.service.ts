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

@Injectable({
  providedIn: 'root'
})
export class WarehousesService {
  constructor(private apiClient: ApiClientService) {}

  getWarehouses(params?: SearchParams): Observable<PaginatedResponse<WarehouseDto>> {
    return this.apiClient.get<PaginatedResponse<WarehouseDto>>(INVENTORY_ENDPOINTS.WAREHOUSES, params);
  }

  getWarehouseById(id: string): Observable<WarehouseDto> {
    return this.apiClient.get<WarehouseDto>(INVENTORY_ENDPOINTS.WAREHOUSE_BY_ID(id));
  }

  createWarehouse(data: CreateUpdateWarehouseDto): Observable<WarehouseDto> {
    return this.apiClient.post<WarehouseDto>(INVENTORY_ENDPOINTS.WAREHOUSES, data);
  }

  updateWarehouse(id: string, data: CreateUpdateWarehouseDto): Observable<WarehouseDto> {
    return this.apiClient.put<WarehouseDto>(INVENTORY_ENDPOINTS.WAREHOUSE_BY_ID(id), data);
  }

  deleteWarehouse(id: string): Observable<void> {
    return this.apiClient.delete<void>(INVENTORY_ENDPOINTS.WAREHOUSE_BY_ID(id));
  }

  exportToXlsx(): Observable<Blob> {
    return this.apiClient.download(INVENTORY_ENDPOINTS.WAREHOUSES_EXPORT_XLSX);
  }

  exportToPdf(): Observable<Blob> {
    return this.apiClient.download(INVENTORY_ENDPOINTS.WAREHOUSES_EXPORT_PDF);
  }
}
