import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClientService } from '../api/http-client.service';
import { INVENTORY_ENDPOINTS } from '../api/endpoints.constants';
import {
  InventoryTransactionDto,
  PaginatedResponse,
  SearchParams
} from '../types/api.types';
import { BaseApiService } from '../base/base-api.service';

@Injectable({
  providedIn: 'root'
})
export class InventoryTransactionsService extends BaseApiService<InventoryTransactionDto> {
  protected getEndpoint(): string {
    return INVENTORY_ENDPOINTS.TRANSACTIONS;
  }

  constructor(protected override apiClient: ApiClientService) {
    super(apiClient);
  }
}
