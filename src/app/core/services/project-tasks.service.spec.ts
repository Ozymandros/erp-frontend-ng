import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ProjectTasksService } from './project-tasks.service';
import { ApiClientService } from '../api/http-client.service';
import { PROJECTS_ENDPOINTS } from '../api/endpoints.constants';
import { ProjectTaskType } from '../../types/projects.types';

describe('ProjectTasksService', () => {
  let service: ProjectTasksService;
  let api: jasmine.SpyObj<ApiClientService>;

  beforeEach(() => {
    api = jasmine.createSpyObj('ApiClientService', ['get', 'post', 'put', 'delete', 'download']);
    TestBed.configureTestingModule({
      providers: [ProjectTasksService, { provide: ApiClientService, useValue: api }],
    });
    service = TestBed.inject(ProjectTasksService);
  });

  it('should list tasks', (done) => {
    api.get.and.returnValue(of([]));
    service.list('p1').subscribe(() => {
      expect(api.get).toHaveBeenCalledWith(PROJECTS_ENDPOINTS.TASKS('p1'));
      done();
    });
  });

  it('should get tree', (done) => {
    api.get.and.returnValue(of([]));
    service.getTree('p1').subscribe(() => {
      expect(api.get).toHaveBeenCalledWith(PROJECTS_ENDPOINTS.TASKS_TREE('p1'));
      done();
    });
  });

  it('should get by id', (done) => {
    api.get.and.returnValue(of({ id: 't1' }));
    service.getById('p1', 't1').subscribe(() => {
      expect(api.get).toHaveBeenCalledWith(PROJECTS_ENDPOINTS.TASK_BY_ID('p1', 't1'));
      done();
    });
  });

  it('should create task', (done) => {
    const dto = { taskNo: '1', description: 'T', taskType: ProjectTaskType.Posting };
    api.post.and.returnValue(of({ id: 't1' }));
    service.create('p1', dto).subscribe(() => {
      expect(api.post).toHaveBeenCalledWith(PROJECTS_ENDPOINTS.TASKS('p1'), dto);
      done();
    });
  });

  it('should update task', (done) => {
    const dto = { taskNo: '1', description: 'T' };
    api.put.and.returnValue(of({ id: 't1' }));
    service.update('p1', 't1', dto).subscribe(() => {
      expect(api.put).toHaveBeenCalledWith(PROJECTS_ENDPOINTS.TASK_BY_ID('p1', 't1'), dto);
      done();
    });
  });

  it('should delete task', (done) => {
    api.delete.and.returnValue(of(void 0));
    service.delete('p1', 't1').subscribe(() => {
      expect(api.delete).toHaveBeenCalledWith(PROJECTS_ENDPOINTS.TASK_BY_ID('p1', 't1'));
      done();
    });
  });

  it('should move task', (done) => {
    const dto = { newParentTaskId: null, sortOrder: 1 };
    api.post.and.returnValue(of({ id: 't1' }));
    service.move('p1', 't1', dto).subscribe(() => {
      expect(api.post).toHaveBeenCalledWith(PROJECTS_ENDPOINTS.TASK_MOVE('p1', 't1'), dto);
      done();
    });
  });

  it('should export xlsx and pdf', (done) => {
    api.download.and.returnValue(of(new Blob()));
    service.exportToXlsx('p1').subscribe(() => {
      expect(api.download).toHaveBeenCalledWith(PROJECTS_ENDPOINTS.TASKS_EXPORT_XLSX('p1'));
      service.exportToPdf('p1').subscribe(() => {
        expect(api.download).toHaveBeenCalledWith(PROJECTS_ENDPOINTS.TASKS_EXPORT_PDF('p1'));
        done();
      });
    });
  });
});
