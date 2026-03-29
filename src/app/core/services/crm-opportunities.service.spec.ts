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

  it('should GET opportunities list via base endpoint', (done) => {
    apiClientSpy.get.and.returnValue(of([]));
    service.getAll().subscribe(() => {
      expect(apiClientSpy.get).toHaveBeenCalledWith(CRM_ENDPOINTS.OPPORTUNITIES, undefined);
      done();
    });
  });

  it('should PUT forecast', (done) => {
    const body = { amount: 1000 };
    apiClientSpy.put.and.returnValue(of({} as any));
    service.updateForecast('opp-1', body as never).subscribe(() => {
      expect(apiClientSpy.put).toHaveBeenCalledWith(CRM_ENDPOINTS.OPPORTUNITY_FORECAST_BY_ID('opp-1'), body);
      done();
    });
  });

  it('should POST move stage', (done) => {
    const body = { stage: 'Qualification' };
    apiClientSpy.post.and.returnValue(of({} as any));
    service.moveStage('opp-1', body as never).subscribe(() => {
      expect(apiClientSpy.post).toHaveBeenCalledWith(CRM_ENDPOINTS.OPPORTUNITY_MOVE_STAGE('opp-1'), body);
      done();
    });
  });

  it('should POST mark lost', (done) => {
    const body = { reason: 'Budget' };
    apiClientSpy.post.and.returnValue(of({} as any));
    service.markLost('opp-1', body as never).subscribe(() => {
      expect(apiClientSpy.post).toHaveBeenCalledWith(CRM_ENDPOINTS.OPPORTUNITY_MARK_LOST('opp-1'), body);
      done();
    });
  });

  it('should POST line creation', (done) => {
    const body = { productId: 'p1', quantity: 1, unitPrice: 10 };
    apiClientSpy.post.and.returnValue(of({} as any));
    service.addLine('opp-1', body as never).subscribe(() => {
      expect(apiClientSpy.post).toHaveBeenCalledWith(CRM_ENDPOINTS.OPPORTUNITY_LINES('opp-1'), body);
      done();
    });
  });

  it('should PUT line update', (done) => {
    const body = { quantity: 2 };
    apiClientSpy.put.and.returnValue(of({} as any));
    service.updateLine('opp-1', 'line-1', body as never).subscribe(() => {
      expect(apiClientSpy.put).toHaveBeenCalledWith(
        CRM_ENDPOINTS.OPPORTUNITY_LINE_BY_ID('opp-1', 'line-1'),
        body,
      );
      done();
    });
  });

  it('should DELETE line', (done) => {
    apiClientSpy.delete.and.returnValue(of(void 0));
    service.removeLine('opp-1', 'line-1').subscribe(() => {
      expect(apiClientSpy.delete).toHaveBeenCalledWith(CRM_ENDPOINTS.OPPORTUNITY_LINE_BY_ID('opp-1', 'line-1'));
      done();
    });
  });

  it('should throw from update override', (done) => {
    service.update('opp-1', undefined as never).subscribe({
      next: () => fail('expected error'),
      error: (err: Error) => {
        expect(err.message).toContain('Use updateForecast');
        done();
      },
    });
  });

  it('should throw from delete override', (done) => {
    service.delete('opp-1').subscribe({
      next: () => fail('expected error'),
      error: (err: Error) => {
        expect(err.message).toContain('not deleted');
        done();
      },
    });
  });

  it('should throw from export methods', () => {
    expect(() => service.exportToXlsx()).toThrowError('CRM opportunities export is not available');
    expect(() => service.exportToPdf()).toThrowError('CRM opportunities export is not available');
  });
});
