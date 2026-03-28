import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { CrmAccountsService } from './crm-accounts.service';
import { ApiClientService } from '../api/http-client.service';
import { CRM_ENDPOINTS } from '../api/endpoints.constants';

describe('CrmAccountsService', () => {
  let service: CrmAccountsService;
  let apiClientSpy: jasmine.SpyObj<ApiClientService>;

  beforeEach(() => {
    apiClientSpy = jasmine.createSpyObj('ApiClientService', ['get', 'post', 'put', 'delete', 'download']);

    TestBed.configureTestingModule({
      providers: [CrmAccountsService, { provide: ApiClientService, useValue: apiClientSpy }],
    });
    service = TestBed.inject(CrmAccountsService);
  });

  it('should PUT account owner', (done) => {
    apiClientSpy.put.and.returnValue(of({} as any));
    service.updateOwner('acc-1', { ownerUsername: 'newowner' }).subscribe(() => {
      expect(apiClientSpy.put).toHaveBeenCalledWith(CRM_ENDPOINTS.ACCOUNT_OWNER('acc-1'), { ownerUsername: 'newowner' });
      done();
    });
  });
});
