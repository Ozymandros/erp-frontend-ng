import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClientService } from '@/app/core/api/http-client.service';
import { INVENTORY_ENDPOINTS } from '@/app/core/api/endpoints.constants';
import {
  ProductDto,
  CreateUpdateProductDto,
  WarehouseDto,
  CreateUpdateWarehouseDto,
  WarehouseStockDto,
  InventoryTransactionDto,
  PaginatedResponse,
  SearchParams
} from '@/app/types/api.types';

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  constructor(private apiClient: ApiClientService) {}

  // Products
  getProducts(params?: SearchParams): Observable<PaginatedResponse<ProductDto>> {
    return this.apiClient.get<PaginatedResponse<ProductDto>>(INVENTORY_ENDPOINTS.PRODUCTS, params);
  }

  getProductById(id: string): Observable<ProductDto> {
    return this.apiClient.get<ProductDto>(INVENTORY_ENDPOINTS.PRODUCT_BY_ID(id));
  }

  createProduct(data: CreateUpdateProductDto): Observable<ProductDto> {
    return this.apiClient.post<ProductDto>(INVENTORY_ENDPOINTS.PRODUCTS, data);
  }

  updateProduct(id: string, data: CreateUpdateProductDto): Observable<ProductDto> {
    return this.apiClient.put<ProductDto>(INVENTORY_ENDPOINTS.PRODUCT_BY_ID(id), data);
  }

  deleteProduct(id: string): Observable<void> {
    return this.apiClient.delete<void>(INVENTORY_ENDPOINTS.PRODUCT_BY_ID(id));
  }

  // Warehouses
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

  // Warehouse Stocks
  getWarehouseStocks(params?: SearchParams): Observable<PaginatedResponse<WarehouseStockDto>> {
    return this.apiClient.get<PaginatedResponse<WarehouseStockDto>>(INVENTORY_ENDPOINTS.WAREHOUSE_STOCKS, params);
  }

  // Inventory Transactions
  getInventoryTransactions(params?: SearchParams): Observable<PaginatedResponse<InventoryTransactionDto>> {
    return this.apiClient.get<PaginatedResponse<InventoryTransactionDto>>(INVENTORY_ENDPOINTS.TRANSACTIONS, params);
  }
}
