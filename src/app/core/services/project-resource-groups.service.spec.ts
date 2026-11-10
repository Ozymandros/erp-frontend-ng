import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ProjectResourceGroupsService } from './project-resource-groups.service';
import { ApiClientService } from '../api/http-client.service';
import { PROJECTS_ENDPOINTS } from '../api/endpoints.constants';

describe('ProjectResourceGroupsService', () => {
  let service: ProjectResourceGroupsService;
  let api: jasmine.SpyObj<ApiClientService>;

  beforeEach(() => {
    api = jasmine.createSpyObj('ApiClientService', ['get', 'post', 'put', 'delete', 'download']);
    TestBed.configureTestingModule({
      providers: [ProjectResourceGroupsService, { provide: ApiClientService, useValue: api }],
    });
    service = TestBed.inject(ProjectResourceGroupsService);
  });

  it('should list get create update delete export', (done) => {
    const dto = { code: 'ENG', name: 'Engineering' };
    api.get.and.returnValue(of([]));
    api.post.and.returnValue(of({ id: '1', ...dto }));
    api.put.and.returnValue(of({ id: '1', ...dto }));
    api.delete.and.returnValue(of(void 0));
    api.download.and.returnValue(of(new Blob()));

    service.list().subscribe(() => {
      expect(api.get).toHaveBeenCalledWith(PROJECTS_ENDPOINTS.RESOURCE_GROUPS);
      api.get.and.returnValue(of({ id: '1', ...dto }));
      service.getById('1').subscribe(() => {
        expect(api.get).toHaveBeenCalledWith(PROJECTS_ENDPOINTS.RESOURCE_GROUP_BY_ID('1'));
        service.create(dto).subscribe(() => {
          expect(api.post).toHaveBeenCalledWith(PROJECTS_ENDPOINTS.RESOURCE_GROUPS, dto);
          service.update('1', dto).subscribe(() => {
            expect(api.put).toHaveBeenCalledWith(PROJECTS_ENDPOINTS.RESOURCE_GROUP_BY_ID('1'), dto);
            service.delete('1').subscribe(() => {
              expect(api.delete).toHaveBeenCalledWith(PROJECTS_ENDPOINTS.RESOURCE_GROUP_BY_ID('1'));
              service.exportToXlsx().subscribe(() => {
                expect(api.download).toHaveBeenCalledWith(PROJECTS_ENDPOINTS.RESOURCE_GROUPS_EXPORT_XLSX);
                service.exportToPdf().subscribe(() => {
                  expect(api.download).toHaveBeenCalledWith(PROJECTS_ENDPOINTS.RESOURCE_GROUPS_EXPORT_PDF);
                  done();
                });
              });
            });
          });
        });
      });
    });
  });
});
