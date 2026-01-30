import { Injectable } from '@angular/core';
import { ApiClientService } from '../api/http-client.service';
import { PURCHASING_ENDPOINTS } from '../api/endpoints.constants';
import { SupplierDto } from '../types/api.types';
import { BaseApiService } from '../base/base-api.service';

@Injectable({
  providedIn: 'root'
})
export class SuppliersService extends BaseApiService<SupplierDto> {
  constructor(apiClient: ApiClientService) {
    super(apiClient);
  }

  protected getEndpoint(): string {
    return PURCHASING_ENDPOINTS.SUPPLIERS;
  }
}
