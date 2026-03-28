import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { ApiClientService } from '../api/http-client.service';
import { CRM_ENDPOINTS } from '../api/endpoints.constants';
import type { AccountDto, UpdateAccountOwnerDto } from '../../types/crm.types';
import { BaseApiService } from '../base/base-api.service';

@Injectable({
  providedIn: 'root',
})
export class CrmAccountsService extends BaseApiService<AccountDto, never, never> {
  constructor(apiClient: ApiClientService) {
    super(apiClient);
  }

  protected override getEndpoint(): string {
    return CRM_ENDPOINTS.ACCOUNTS;
  }

  override create(_data: never): Observable<AccountDto> {
    return throwError(() => new Error('Accounts are synced from Sales; use Sales customer flows'));
  }

  override update(_id: string, _data: never): Observable<AccountDto> {
    return throwError(() => new Error('Use updateOwner'));
  }

  override delete(_id: string): Observable<void> {
    return throwError(() => new Error('Accounts cannot be deleted via this API'));
  }

  override exportToXlsx(): Observable<Blob> {
    throw new Error('CRM accounts export is not available');
  }

  override exportToPdf(): Observable<Blob> {
    throw new Error('CRM accounts export is not available');
  }

  updateOwner(id: string, dto: UpdateAccountOwnerDto): Observable<AccountDto> {
    return this.apiClient.put<AccountDto>(CRM_ENDPOINTS.ACCOUNT_OWNER(id), dto);
  }
}
