import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClientService } from '../api/http-client.service';
import { PURCHASING_ENDPOINTS } from '../api/endpoints.constants';
import {
  PurchaseOrderDto,
  CreateUpdatePurchaseOrderDto,
  ApprovePurchaseOrderDto,
  ReceivePurchaseOrderDto
} from '../../types/api.types';
import { BaseApiService } from '../base/base-api.service';

@Injectable({
  providedIn: 'root'
})
export class PurchaseOrdersService extends BaseApiService<PurchaseOrderDto, CreateUpdatePurchaseOrderDto, CreateUpdatePurchaseOrderDto> {
  protected getEndpoint(): string {
    return PURCHASING_ENDPOINTS.ORDERS;
  }

  constructor(protected override apiClient: ApiClientService) {
    super(apiClient);
  }

  approvePurchaseOrder(data: ApprovePurchaseOrderDto): Observable<PurchaseOrderDto> {
    return this.apiClient.post<PurchaseOrderDto>(
      PURCHASING_ENDPOINTS.APPROVE(data.purchaseOrderId), 
      data
    );
  }

  receivePurchaseOrder(data: ReceivePurchaseOrderDto): Observable<PurchaseOrderDto> {
    return this.apiClient.post<PurchaseOrderDto>(
      PURCHASING_ENDPOINTS.RECEIVE(data.purchaseOrderId), 
      data
    );
  }
}
