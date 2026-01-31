import { Injectable } from '@angular/core';
import { ApiClientService } from '../api/http-client.service';
import { INVENTORY_ENDPOINTS } from '../api/endpoints.constants';
import { ProductDto, CreateUpdateProductDto } from '../../types/api.types';

import { BaseApiService } from '../base/base-api.service';

@Injectable({
  providedIn: 'root'
})
export class ProductsService extends BaseApiService<ProductDto, CreateUpdateProductDto, CreateUpdateProductDto> {

  constructor(apiClient: ApiClientService) {
    super(apiClient);
  }

  protected getEndpoint(): string {
    return INVENTORY_ENDPOINTS.PRODUCTS;
  }
}
