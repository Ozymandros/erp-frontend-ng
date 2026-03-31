import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { CrmLeadsService } from './crm-leads.service';
import { ApiClientService } from '../api/http-client.service';
import { CRM_ENDPOINTS } from '../api/endpoints.constants';
import { LeadDto } from '../../types/crm.types';

describe('CrmLeadsService', () => {
  let service: CrmLeadsService;
  let apiClientSpy: jasmine.SpyObj<ApiClientService>;

  beforeEach(() => {
    apiClientSpy = jasmine.createSpyObj('ApiClientService', ['get', 'post', 'put', 'delete', 'download']);

    TestBed.configureTestingModule({
      providers: [CrmLeadsService, { provide: ApiClientService, useValue: apiClientSpy }],
    });
    service = TestBed.inject(CrmLeadsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should GET leads list endpoint', (done) => {
    const mock = { items: [] as LeadDto[], total: 0 };
    apiClientSpy.get.and.returnValue(of(mock));
    service.getAll({ page: 1, pageSize: 10 }).subscribe((res) => {
      expect(res).toEqual(mock as any);
      expect(apiClientSpy.get).toHaveBeenCalledWith(CRM_ENDPOINTS.LEADS, jasmine.anything());
      done();
    });
  });

  it('should POST qualify', (done) => {
    apiClientSpy.post.and.returnValue(of(void 0));
    service.qualify('lead-1', { customerId: 'cust-1' }).subscribe(() => {
      expect(apiClientSpy.post).toHaveBeenCalledWith(CRM_ENDPOINTS.LEAD_QUALIFY('lead-1'), { customerId: 'cust-1' });
      done();
    });
  });

  it('should throw on exportToXlsx', () => {
    expect(() => service.exportToXlsx()).toThrow();
  });
});
