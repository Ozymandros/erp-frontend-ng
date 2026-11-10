import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ProjectPostingService } from './project-posting.service';
import { ApiClientService } from '../api/http-client.service';
import { PROJECTS_ENDPOINTS } from '../api/endpoints.constants';
import { ProjectLineKind } from '../../types/projects.types';

describe('ProjectPostingService', () => {
  let service: ProjectPostingService;
  let api: jasmine.SpyObj<ApiClientService>;

  beforeEach(() => {
    api = jasmine.createSpyObj('ApiClientService', ['get', 'post', 'download']);
    TestBed.configureTestingModule({
      providers: [ProjectPostingService, { provide: ApiClientService, useValue: api }],
    });
    service = TestBed.inject(ProjectPostingService);
  });

  it('should post usage', (done) => {
    const dto = { projectTaskId: 't1', quantity: 1, kind: ProjectLineKind.Resource };
    api.post.and.returnValue(of({ id: 'e1' }));
    service.postUsage('p1', dto).subscribe(() => {
      expect(api.post).toHaveBeenCalledWith(PROJECTS_ENDPOINTS.USAGE('p1'), dto);
      done();
    });
  });

  it('should list ledger with and without filter', (done) => {
    api.get.and.returnValue(of([]));
    service.listLedgerEntries('p1').subscribe(() => {
      expect(api.get).toHaveBeenCalledWith(PROJECTS_ENDPOINTS.LEDGER_ENTRIES('p1'), undefined);
      service.listLedgerEntries('p1', 't1').subscribe(() => {
        expect(api.get).toHaveBeenCalledWith(PROJECTS_ENDPOINTS.LEDGER_ENTRIES('p1'), { taskId: 't1' });
        done();
      });
    });
  });

  it('should export ledger', (done) => {
    api.download.and.returnValue(of(new Blob()));
    service.exportLedgerToXlsx('p1').subscribe(() => {
      expect(api.download).toHaveBeenCalledWith(PROJECTS_ENDPOINTS.LEDGER_EXPORT_XLSX('p1'));
      service.exportLedgerToPdf('p1').subscribe(() => {
        expect(api.download).toHaveBeenCalledWith(PROJECTS_ENDPOINTS.LEDGER_EXPORT_PDF('p1'));
        done();
      });
    });
  });

  it('should list and create consumption', (done) => {
    api.get.and.returnValue(of([]));
    api.post.and.returnValue(of({ id: 'c1' }));
    const dto = { warehouseId: 'w1', lines: [{ planningLineId: 'l1', quantity: 1 }] };
    service.listConsumptionOrders('p1').subscribe(() => {
      expect(api.get).toHaveBeenCalledWith(PROJECTS_ENDPOINTS.ITEM_CONSUMPTION('p1'));
      service.createConsumptionOrder('p1', dto).subscribe(() => {
        expect(api.post).toHaveBeenCalledWith(PROJECTS_ENDPOINTS.ITEM_CONSUMPTION('p1'), dto);
        done();
      });
    });
  });

  it('should list and create invoice requests', (done) => {
    api.get.and.returnValue(of([]));
    api.post.and.returnValue(of({ id: 'i1' }));
    const dto = { taxRate: 21, lines: [{ planningLineId: 'l1' }] };
    service.listInvoiceRequests('p1').subscribe(() => {
      expect(api.get).toHaveBeenCalledWith(PROJECTS_ENDPOINTS.INVOICE_REQUESTS('p1'));
      service.createInvoiceRequest('p1', dto).subscribe(() => {
        expect(api.post).toHaveBeenCalledWith(PROJECTS_ENDPOINTS.INVOICE_REQUESTS('p1'), dto);
        done();
      });
    });
  });
});
