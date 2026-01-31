import { Injectable } from '@angular/core';
import { ApiClientService } from '../api/http-client.service';
import { SALES_ENDPOINTS } from '../api/endpoints.constants';
import { CustomerDto } from '../../types/api.types';
import { BaseApiService } from '../base/base-api.service';


@Injectable({
  providedIn: 'root'
})
export class CustomersService extends BaseApiService<CustomerDto> {
  constructor(apiClient: ApiClientService) {
    super(apiClient);
  }

  protected getEndpoint(): string {
    return SALES_ENDPOINTS.CUSTOMERS;
  }
}

