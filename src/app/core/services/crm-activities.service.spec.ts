import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { CrmActivitiesService } from './crm-activities.service';
import { ApiClientService } from '../api/http-client.service';
import { CRM_ENDPOINTS } from '../api/endpoints.constants';

describe('CrmActivitiesService', () => {
  let service: CrmActivitiesService;
  let apiClientSpy: jasmine.SpyObj<ApiClientService>;

  beforeEach(() => {
    apiClientSpy = jasmine.createSpyObj('ApiClientService', ['get', 'post', 'put', 'delete', 'download']);

    TestBed.configureTestingModule({
      providers: [CrmActivitiesService, { provide: ApiClientService, useValue: apiClientSpy }],
    });
    service = TestBed.inject(CrmActivitiesService);
  });

  it('should POST complete activity', (done) => {
    apiClientSpy.post.and.returnValue(of({} as any));
    service.complete('a1', { note: 'done' }).subscribe(() => {
      expect(apiClientSpy.post).toHaveBeenCalledWith(CRM_ENDPOINTS.ACTIVITY_COMPLETE('a1'), { note: 'done' });
      done();
    });
  });

  it('should GET activities list via base endpoint', (done) => {
    apiClientSpy.get.and.returnValue(of([]));
    service.getAll().subscribe(() => {
      expect(apiClientSpy.get).toHaveBeenCalledWith(CRM_ENDPOINTS.ACTIVITIES, undefined);
      done();
    });
  });

  it('should throw from update', (done) => {
    service.update('a1', undefined as never).subscribe({
      next: () => fail('expected error'),
      error: (err: Error) => {
        expect(err.message).toContain('updated via complete');
        done();
      },
    });
  });

  it('should throw from delete', (done) => {
    service.delete('a1').subscribe({
      next: () => fail('expected error'),
      error: (err: Error) => {
        expect(err.message).toContain('not deleted');
        done();
      },
    });
  });

  it('should throw from export methods', () => {
    expect(() => service.exportToXlsx()).toThrowError('CRM activities export is not available');
    expect(() => service.exportToPdf()).toThrowError('CRM activities export is not available');
  });
});
