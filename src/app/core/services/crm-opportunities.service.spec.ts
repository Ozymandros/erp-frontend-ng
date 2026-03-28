import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { CrmOpportunitiesService } from './crm-opportunities.service';
import { ApiClientService } from '../api/http-client.service';
import { CRM_ENDPOINTS } from '../api/endpoints.constants';

describe('CrmOpportunitiesService', () => {
  let service: CrmOpportunitiesService;
  let apiClientSpy: jasmine.SpyObj<ApiClientService>;

  beforeEach(() => {
    apiClientSpy = jasmine.createSpyObj('ApiClientService', ['get', 'post', 'put', 'delete', 'download']);

    TestBed.configureTestingModule({
      providers: [CrmOpportunitiesService, { provide: ApiClientService, useValue: apiClientSpy }],
    });
    service = TestBed.inject(CrmOpportunitiesService);
  });

  it('should GET forecast summary', (done) => {
    const summary = {
      ownerUsername: 'u',
      totalCount: 0,
      totalWeightedAmount: 0,
      byStage: [],
    };
    apiClientSpy.get.and.returnValue(of(summary));
    service.getForecastSummary({}).subscribe((res) => {
      expect(res).toEqual(summary);
      expect(apiClientSpy.get).toHaveBeenCalledWith(CRM_ENDPOINTS.OPPORTUNITY_FORECAST, jasmine.anything());
      done();
    });
  });

  it('should GET opportunity lines', (done) => {
    apiClientSpy.get.and.returnValue(of([]));
    service.listLines('opp-1').subscribe(() => {
      expect(apiClientSpy.get).toHaveBeenCalledWith(CRM_ENDPOINTS.OPPORTUNITY_LINES('opp-1'));
      done();
    });
  });

  it('should POST mark won', (done) => {
    apiClientSpy.post.and.returnValue(of({} as any));
    const body = { convertToQuote: false, quote: null };
    service.markWon('opp-1', body).subscribe(() => {
      expect(apiClientSpy.post).toHaveBeenCalledWith(CRM_ENDPOINTS.OPPORTUNITY_MARK_WON('opp-1'), body);
      done();
    });
  });
});
