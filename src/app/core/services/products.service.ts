import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClientService } from '../api/http-client.service';
import { INVENTORY_ENDPOINTS } from '../api/endpoints.constants';
import {
  ProductDto,
  CreateUpdateProductDto,
  PaginatedResponse,
  SearchParams
} from '../types/api.types';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  constructor(private apiClient: ApiClientService) {}

  getProducts(params?: SearchParams): Observable<PaginatedResponse<ProductDto>> {
    return this.apiClient.get<PaginatedResponse<ProductDto>>(INVENTORY_ENDPOINTS.PRODUCTS, params);
  }

  getProductsPaginated(page: number = 1, pageSize: number = 10): Observable<PaginatedResponse<ProductDto>> {
    return this.apiClient.get<PaginatedResponse<ProductDto>>(INVENTORY_ENDPOINTS.PRODUCT_PAGINATED, { page, pageSize });
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
}
