import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ProjectResourcesService } from './project-resources.service';
import { ApiClientService } from '../api/http-client.service';
import { PROJECTS_ENDPOINTS } from '../api/endpoints.constants';

describe('ProjectResourcesService', () => {
  let service: ProjectResourcesService;
  let api: jasmine.SpyObj<ApiClientService>;

  beforeEach(() => {
    api = jasmine.createSpyObj('ApiClientService', ['get', 'post', 'put', 'delete', 'download']);
    TestBed.configureTestingModule({
      providers: [ProjectResourcesService, { provide: ApiClientService, useValue: api }],
    });
    service = TestBed.inject(ProjectResourcesService);
  });

  it('should getAll via resources endpoint', (done) => {
    api.get.and.returnValue(of({ items: [], total: 0 }));
    service.getAll({ page: 1 }).subscribe(() => {
      expect(api.get).toHaveBeenCalledWith(PROJECTS_ENDPOINTS.RESOURCES, jasmine.anything());
      done();
    });
  });

  it('should getById create update delete export', (done) => {
    const dto = { resourceNo: 'R1', name: 'Dev', baseUnitOfMeasure: 'HOUR' };
    api.get.and.returnValue(of({ id: '1', ...dto }));
    api.post.and.returnValue(of({ id: '1', ...dto }));
    api.put.and.returnValue(of({ id: '1', ...dto }));
    api.delete.and.returnValue(of(void 0));
    api.download.and.returnValue(of(new Blob()));

    service.getById('1').subscribe(() => {
      expect(api.get).toHaveBeenCalledWith(`${PROJECTS_ENDPOINTS.RESOURCES}/1`);
      service.create(dto).subscribe(() => {
        expect(api.post).toHaveBeenCalledWith(PROJECTS_ENDPOINTS.RESOURCES, dto);
        service.update('1', dto).subscribe(() => {
          expect(api.put).toHaveBeenCalledWith(`${PROJECTS_ENDPOINTS.RESOURCES}/1`, dto);
          service.delete('1').subscribe(() => {
            expect(api.delete).toHaveBeenCalledWith(`${PROJECTS_ENDPOINTS.RESOURCES}/1`);
            service.exportToXlsx().subscribe(() => {
              expect(api.download).toHaveBeenCalledWith(`${PROJECTS_ENDPOINTS.RESOURCES}/export-xlsx`);
              service.exportToPdf().subscribe(() => {
                expect(api.download).toHaveBeenCalledWith(`${PROJECTS_ENDPOINTS.RESOURCES}/export-pdf`);
                done();
              });
            });
          });
        });
      });
    });
  });
});
