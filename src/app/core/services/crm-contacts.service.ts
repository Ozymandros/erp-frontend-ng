import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClientService } from '../api/http-client.service';
import { CRM_ENDPOINTS } from '../api/endpoints.constants';
import type { ContactDto, CreateContactDto, UpdateContactDto } from '../../types/crm.types';
import { BaseApiService } from '../base/base-api.service';

@Injectable({
  providedIn: 'root',
})
export class CrmContactsService extends BaseApiService<ContactDto, CreateContactDto, UpdateContactDto> {
  constructor(apiClient: ApiClientService) {
    super(apiClient);
  }

  protected override getEndpoint(): string {
    return CRM_ENDPOINTS.CONTACTS;
  }

  override exportToXlsx(): Observable<Blob> {
    throw new Error('CRM contacts export is not available');
  }

  override exportToPdf(): Observable<Blob> {
    throw new Error('CRM contacts export is not available');
  }

  listByAccount(accountId: string): Observable<ContactDto[]> {
    return this.apiClient.get<ContactDto[]>(CRM_ENDPOINTS.ACCOUNT_CONTACTS(accountId));
  }

  setPrimary(accountId: string, contactId: string): Observable<void> {
    return this.apiClient.post<void>(CRM_ENDPOINTS.CONTACT_SET_PRIMARY(accountId, contactId), {});
  }
}
