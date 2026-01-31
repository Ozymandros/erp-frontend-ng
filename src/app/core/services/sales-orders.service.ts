import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClientService } from '../api/http-client.service';
import { SALES_ENDPOINTS } from '../api/endpoints.constants';
import {
  SalesOrderDto,
  CreateUpdateSalesOrderDto,
  CreateQuoteDto,
  ConfirmQuoteDto,
  StockAvailabilityCheckDto
} from '../../types/api.types';
import { BaseApiService } from '../base/base-api.service';

@Injectable({
  providedIn: 'root'
})
export class SalesOrdersService extends BaseApiService<SalesOrderDto, CreateUpdateSalesOrderDto, CreateUpdateSalesOrderDto> {
  protected getEndpoint(): string {
    return SALES_ENDPOINTS.ORDERS;
  }

  constructor(protected override apiClient: ApiClientService) {
    super(apiClient);
  }

  createQuote(data: CreateQuoteDto): Observable<SalesOrderDto> {
    return this.apiClient.post<SalesOrderDto>(SALES_ENDPOINTS.CREATE_QUOTE, data);
  }

  confirmQuote(id: string, data: ConfirmQuoteDto): Observable<SalesOrderDto> {
    return this.apiClient.post<SalesOrderDto>(SALES_ENDPOINTS.CONFIRM_QUOTE(id), data);
  }

  checkStockAvailability(productIds: string[], quantities: number[]): Observable<StockAvailabilityCheckDto[]> {
    return this.apiClient.post<StockAvailabilityCheckDto[]>(
      SALES_ENDPOINTS.CHECK_STOCK, 
      { productIds, quantities }
    );
  }
}
