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

  it('should GET accounts list via base endpoint', (done) => {
    apiClientSpy.get.and.returnValue(of([]));
    service.getAll().subscribe(() => {
      expect(apiClientSpy.get).toHaveBeenCalledWith(CRM_ENDPOINTS.ACCOUNTS, undefined);
      done();
    });
  });

  it('should throw from create', (done) => {
    service.create(undefined as never).subscribe({
      next: () => fail('expected error'),
      error: (err: Error) => {
        expect(err.message).toContain('Accounts are synced from Sales');
        done();
      },
    });
  });

  it('should throw from update', (done) => {
    service.update('acc-1', undefined as never).subscribe({
      next: () => fail('expected error'),
      error: (err: Error) => {
        expect(err.message).toContain('Use updateOwner');
        done();
      },
    });
  });

  it('should throw from delete', (done) => {
    service.delete('acc-1').subscribe({
      next: () => fail('expected error'),
      error: (err: Error) => {
        expect(err.message).toContain('cannot be deleted');
        done();
      },
    });
  });

  it('should throw from export methods', () => {
    expect(() => service.exportToXlsx()).toThrowError('CRM accounts export is not available');
    expect(() => service.exportToPdf()).toThrowError('CRM accounts export is not available');
  });
});
