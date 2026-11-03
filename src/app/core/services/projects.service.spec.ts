import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ProjectsService } from './projects.service';
import { ApiClientService } from '../api/http-client.service';
import { PROJECTS_ENDPOINTS } from '../api/endpoints.constants';
import { ProjectStatus } from '../../types/projects.types';

describe('ProjectsService', () => {
  let service: ProjectsService;
  let apiClientSpy: jasmine.SpyObj<ApiClientService>;

  beforeEach(() => {
    apiClientSpy = jasmine.createSpyObj('ApiClientService', ['get', 'post', 'put', 'delete', 'download']);
    TestBed.configureTestingModule({
      providers: [ProjectsService, { provide: ApiClientService, useValue: apiClientSpy }],
    });
    service = TestBed.inject(ProjectsService);
  });

  it('should GET projects list endpoint', (done) => {
    apiClientSpy.get.and.returnValue(of({ items: [], total: 0 }));
    service.getAll({ page: 1 }).subscribe(() => {
      expect(apiClientSpy.get).toHaveBeenCalledWith(PROJECTS_ENDPOINTS.PROJECTS, jasmine.anything());
      done();
    });
  });

  it('should POST change status', (done) => {
    apiClientSpy.post.and.returnValue(of({ id: 'p1' }));
    service.changeStatus('p1', { status: ProjectStatus.Open }).subscribe(() => {
      expect(apiClientSpy.post).toHaveBeenCalledWith(
        PROJECTS_ENDPOINTS.PROJECT_STATUS('p1'),
        { status: ProjectStatus.Open },
      );
      done();
    });
  });

  it('should GET statistics', (done) => {
    apiClientSpy.get.and.returnValue(of({ projectId: 'p1' }));
    service.getStatistics('p1').subscribe(() => {
      expect(apiClientSpy.get).toHaveBeenCalledWith(PROJECTS_ENDPOINTS.PROJECT_STATISTICS('p1'));
      done();
    });
  });
});
