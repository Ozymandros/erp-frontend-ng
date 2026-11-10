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

  it('should getById create update delete', (done) => {
    const createDto = { description: 'P', customerId: 'c1' };
    const updateDto = { description: 'P', customerId: 'c1', currencyCode: 'EUR' };
    apiClientSpy.get.and.returnValue(of({ id: 'p1' }));
    apiClientSpy.post.and.returnValue(of({ id: 'p1' }));
    apiClientSpy.put.and.returnValue(of({ id: 'p1' }));
    apiClientSpy.delete.and.returnValue(of(void 0));

    service.getById('p1').subscribe(() => {
      expect(apiClientSpy.get).toHaveBeenCalledWith(`${PROJECTS_ENDPOINTS.PROJECTS}/p1`);
      service.create(createDto).subscribe(() => {
        expect(apiClientSpy.post).toHaveBeenCalledWith(PROJECTS_ENDPOINTS.PROJECTS, createDto);
        service.update('p1', updateDto).subscribe(() => {
          expect(apiClientSpy.put).toHaveBeenCalledWith(`${PROJECTS_ENDPOINTS.PROJECTS}/p1`, updateDto);
          service.delete('p1').subscribe(() => {
            expect(apiClientSpy.delete).toHaveBeenCalledWith(`${PROJECTS_ENDPOINTS.PROJECTS}/p1`);
            done();
          });
        });
      });
    });
  });

  it('should getByNumber', (done) => {
    apiClientSpy.get.and.returnValue(of({ id: 'p1' }));
    service.getByNumber('PRJ-1').subscribe(() => {
      expect(apiClientSpy.get).toHaveBeenCalledWith(PROJECTS_ENDPOINTS.PROJECT_BY_NUMBER('PRJ-1'));
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

  it('should copy project', (done) => {
    const dto = { description: 'Copy', includePlanningLines: true };
    apiClientSpy.post.and.returnValue(of({ id: 'p2' }));
    service.copy('p1', dto).subscribe(() => {
      expect(apiClientSpy.post).toHaveBeenCalledWith(PROJECTS_ENDPOINTS.PROJECT_COPY('p1'), dto);
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

  it('should export', (done) => {
    apiClientSpy.download.and.returnValue(of(new Blob()));
    service.exportToXlsx().subscribe(() => {
      expect(apiClientSpy.download).toHaveBeenCalledWith(`${PROJECTS_ENDPOINTS.PROJECTS}/export-xlsx`);
      service.exportToPdf().subscribe(() => {
        expect(apiClientSpy.download).toHaveBeenCalledWith(`${PROJECTS_ENDPOINTS.PROJECTS}/export-pdf`);
        done();
      });
    });
  });
});
