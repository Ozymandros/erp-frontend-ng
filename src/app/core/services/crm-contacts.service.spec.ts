import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { CrmContactsService } from './crm-contacts.service';
import { ApiClientService } from '../api/http-client.service';
import { CRM_ENDPOINTS } from '../api/endpoints.constants';

describe('CrmContactsService', () => {
  let service: CrmContactsService;
  let apiClientSpy: jasmine.SpyObj<ApiClientService>;

  beforeEach(() => {
    apiClientSpy = jasmine.createSpyObj('ApiClientService', ['get', 'post', 'put', 'delete', 'download']);

    TestBed.configureTestingModule({
      providers: [CrmContactsService, { provide: ApiClientService, useValue: apiClientSpy }],
    });
    service = TestBed.inject(CrmContactsService);
  });

  it('should GET contacts for account', (done) => {
    apiClientSpy.get.and.returnValue(of([]));
    service.listByAccount('acc-1').subscribe(() => {
      expect(apiClientSpy.get).toHaveBeenCalledWith(CRM_ENDPOINTS.ACCOUNT_CONTACTS('acc-1'));
      done();
    });
  });

  it('should POST set primary', (done) => {
    apiClientSpy.post.and.returnValue(of(void 0));
    service.setPrimary('acc-1', 'c1').subscribe(() => {
      expect(apiClientSpy.post).toHaveBeenCalledWith(CRM_ENDPOINTS.CONTACT_SET_PRIMARY('acc-1', 'c1'), {});
      done();
    });
  });
});
