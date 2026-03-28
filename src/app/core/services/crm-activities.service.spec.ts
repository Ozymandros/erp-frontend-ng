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
});
