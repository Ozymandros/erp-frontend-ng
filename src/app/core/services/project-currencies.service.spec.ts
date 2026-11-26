import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ProjectCurrenciesService } from './project-currencies.service';
import { ApiClientService } from '../api/http-client.service';
import { PROJECTS_ENDPOINTS } from '../api/endpoints.constants';

describe('ProjectCurrenciesService', () => {
  let service: ProjectCurrenciesService;
  let api: jasmine.SpyObj<ApiClientService>;

  beforeEach(() => {
    api = jasmine.createSpyObj('ApiClientService', ['get', 'post', 'put', 'delete', 'download']);
    TestBed.configureTestingModule({
      providers: [ProjectCurrenciesService, { provide: ApiClientService, useValue: api }],
    });
    service = TestBed.inject(ProjectCurrenciesService);
  });

  it('should list and get by code', (done) => {
    api.get.and.returnValue(of([]));
    service.list().subscribe(() => {
      expect(api.get).toHaveBeenCalledWith(PROJECTS_ENDPOINTS.CURRENCIES);
      api.get.and.returnValue(of({ id: '1', code: 'EUR', description: 'Euro' }));
      service.getByCode('EUR').subscribe(() => {
        expect(api.get).toHaveBeenCalledWith(PROJECTS_ENDPOINTS.CURRENCY_BY_CODE('EUR'));
        done();
      });
    });
  });

  it('should create update delete', (done) => {
    const dto = { code: 'USD', description: 'Dollar' };
    api.post.and.returnValue(of({ id: '1', ...dto }));
    api.put.and.returnValue(of({ id: '1', ...dto }));
    api.delete.and.returnValue(of(void 0));
    service.create(dto).subscribe(() => {
      expect(api.post).toHaveBeenCalledWith(PROJECTS_ENDPOINTS.CURRENCIES, dto);
      service.update('USD', dto).subscribe(() => {
        expect(api.put).toHaveBeenCalledWith(PROJECTS_ENDPOINTS.CURRENCY_BY_CODE('USD'), dto);
        service.delete('USD').subscribe(() => {
          expect(api.delete).toHaveBeenCalledWith(PROJECTS_ENDPOINTS.CURRENCY_BY_CODE('USD'));
          done();
        });
      });
    });
  });

  it('should manage exchange rates and get rate', (done) => {
    const rateDto = { startingDate: '2026-01-01T00:00:00Z', rateToLocal: 1.1 };
    api.post.and.returnValue(of({ id: 'r1' }));
    api.delete.and.returnValue(of(void 0));
    api.get.and.returnValue(of(1.1));
    service.addExchangeRate('EUR', rateDto).subscribe(() => {
      expect(api.post).toHaveBeenCalledWith(PROJECTS_ENDPOINTS.CURRENCY_EXCHANGE_RATES('EUR'), rateDto);
      service.deleteExchangeRate('EUR', 'r1').subscribe(() => {
        expect(api.delete).toHaveBeenCalledWith(
          PROJECTS_ENDPOINTS.CURRENCY_EXCHANGE_RATE_BY_ID('EUR', 'r1'),
        );
        service.getRate('EUR', '2026-01-01').subscribe(() => {
          expect(api.get).toHaveBeenCalledWith(PROJECTS_ENDPOINTS.CURRENCY_RATE('EUR'), {
            date: '2026-01-01',
          });
          done();
        });
      });
    });
  });

  it('should get rate without date and export', (done) => {
    api.get.and.returnValue(of(1));
    api.download.and.returnValue(of(new Blob()));
    service.getRate('EUR').subscribe(() => {
      expect(api.get).toHaveBeenCalledWith(PROJECTS_ENDPOINTS.CURRENCY_RATE('EUR'), undefined);
      service.exportToXlsx().subscribe(() => {
        expect(api.download).toHaveBeenCalledWith(PROJECTS_ENDPOINTS.CURRENCIES_EXPORT_XLSX);
        service.exportToPdf().subscribe(() => {
          expect(api.download).toHaveBeenCalledWith(PROJECTS_ENDPOINTS.CURRENCIES_EXPORT_PDF);
          done();
        });
      });
    });
  });
});
