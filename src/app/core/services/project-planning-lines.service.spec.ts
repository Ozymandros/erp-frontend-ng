import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ProjectPlanningLinesService } from './project-planning-lines.service';
import { ApiClientService } from '../api/http-client.service';
import { PROJECTS_ENDPOINTS } from '../api/endpoints.constants';

describe('ProjectPlanningLinesService', () => {
  let service: ProjectPlanningLinesService;
  let api: jasmine.SpyObj<ApiClientService>;

  beforeEach(() => {
    api = jasmine.createSpyObj('ApiClientService', ['get', 'post', 'put', 'delete', 'download']);
    TestBed.configureTestingModule({
      providers: [ProjectPlanningLinesService, { provide: ApiClientService, useValue: api }],
    });
    service = TestBed.inject(ProjectPlanningLinesService);
  });

  it('should list without task filter', (done) => {
    api.get.and.returnValue(of([]));
    service.list('p1').subscribe(() => {
      expect(api.get).toHaveBeenCalledWith(PROJECTS_ENDPOINTS.PLANNING_LINES('p1'), undefined);
      done();
    });
  });

  it('should list with task filter', (done) => {
    api.get.and.returnValue(of([]));
    service.list('p1', 't1').subscribe(() => {
      expect(api.get).toHaveBeenCalledWith(PROJECTS_ENDPOINTS.PLANNING_LINES('p1'), { taskId: 't1' });
      done();
    });
  });

  it('should get by id', (done) => {
    api.get.and.returnValue(of({ id: 'l1' }));
    service.getById('p1', 'l1').subscribe(() => {
      expect(api.get).toHaveBeenCalledWith(PROJECTS_ENDPOINTS.PLANNING_LINE_BY_ID('p1', 'l1'));
      done();
    });
  });

  it('should create and update', (done) => {
    const dto = { projectTaskId: 't1', quantity: 1 };
    api.post.and.returnValue(of({ id: 'l1' }));
    api.put.and.returnValue(of({ id: 'l1' }));
    service.create('p1', dto).subscribe(() => {
      expect(api.post).toHaveBeenCalledWith(PROJECTS_ENDPOINTS.PLANNING_LINES('p1'), dto);
      service.update('p1', 'l1', dto).subscribe(() => {
        expect(api.put).toHaveBeenCalledWith(PROJECTS_ENDPOINTS.PLANNING_LINE_BY_ID('p1', 'l1'), dto);
        done();
      });
    });
  });

  it('should delete and export', (done) => {
    api.delete.and.returnValue(of(void 0));
    api.download.and.returnValue(of(new Blob()));
    service.delete('p1', 'l1').subscribe(() => {
      expect(api.delete).toHaveBeenCalledWith(PROJECTS_ENDPOINTS.PLANNING_LINE_BY_ID('p1', 'l1'));
      service.exportToXlsx('p1').subscribe(() => {
        expect(api.download).toHaveBeenCalledWith(PROJECTS_ENDPOINTS.PLANNING_LINES_EXPORT_XLSX('p1'));
        service.exportToPdf('p1').subscribe(() => {
          expect(api.download).toHaveBeenCalledWith(PROJECTS_ENDPOINTS.PLANNING_LINES_EXPORT_PDF('p1'));
          done();
        });
      });
    });
  });
});
