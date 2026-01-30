import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { RolesService } from './roles.service';
import { ApiClientService } from '../api/http-client.service';
import { Role, PaginatedResponse } from '../types/api.types';

describe('RolesService', () => {
  let service: RolesService;
  let apiClientSpy: jasmine.SpyObj<ApiClientService>;

  beforeEach(() => {
    apiClientSpy = jasmine.createSpyObj('ApiClientService', ['get', 'post', 'put', 'delete', 'download']);

    TestBed.configureTestingModule({
      providers: [
        RolesService,
        { provide: ApiClientService, useValue: apiClientSpy }
      ]
    });
    service = TestBed.inject(RolesService);
  });

  it('should fetch roles', (done) => {
    const mockResult: PaginatedResponse<Role> = {
      items: [{ id: '1', name: 'Admin' } as unknown as Role],
      total: 1,
      page: 1,
      pageSize: 10,
      totalPages: 1,
      hasPreviousPage: false,
      hasNextPage: false
    };
    apiClientSpy.get.and.returnValue(of(mockResult));

    service.getAll().subscribe(result => {
      expect(result).toEqual(mockResult);
      done();
    });
  });


  it('should add permission to role', (done) => {
    apiClientSpy.post.and.returnValue(of(void 0));

    service.addPermissionToRole('1', 'perm-1').subscribe(() => {
      expect(apiClientSpy.post).toHaveBeenCalledWith(
        jasmine.stringContaining('/roles/1/permissions?permissionId=perm-1'),
        null
      );
      done();
    });
  });

  it('should add multiple permissions to role (bulk)', (done) => {
    apiClientSpy.post.and.returnValue(of(void 0));

    service.addPermissionToRole('1', ['perm-1', 'perm-2', 'perm-3']).subscribe(() => {
      expect(apiClientSpy.post).toHaveBeenCalledWith(
        jasmine.stringContaining('/roles/1/permissions/bulk'),
        ['perm-1', 'perm-2', 'perm-3']
      );
      done();
    });
  });

  it('should remove permission from role', (done) => {
    apiClientSpy.delete.and.returnValue(of(void 0));

    service.removePermissionFromRole('1', 'perm-1').subscribe(() => {
      expect(apiClientSpy.delete).toHaveBeenCalledWith(
        jasmine.stringContaining('/roles/1/permissions/perm-1')
      );
      done();
    });
  });

  it('should remove multiple permissions from role (bulk)', (done) => {
    apiClientSpy.delete.and.returnValue(of(void 0));

    service.removePermissionFromRole('1', ['perm-1', 'perm-2', 'perm-3']).subscribe(() => {
      expect(apiClientSpy.delete).toHaveBeenCalledWith(
        jasmine.stringContaining('/roles/1/permissions/bulk'),
        { body: ['perm-1', 'perm-2', 'perm-3'] }
      );
      done();
    });
  });


  it('should export to XLSX', (done) => {
    const mockBlob = new Blob(['data'], { type: 'application/octet-stream' });
    apiClientSpy.download.and.returnValue(of(mockBlob));

    service.exportToXlsx().subscribe(blob => {
      expect(blob).toEqual(mockBlob);
      expect(apiClientSpy.download).toHaveBeenCalled();
      done();
    });
  });

  it('should export to PDF', (done) => {
    const mockBlob = new Blob(['data'], { type: 'application/pdf' });
    apiClientSpy.download.and.returnValue(of(mockBlob));

    service.exportToPdf().subscribe(blob => {
      expect(blob).toEqual(mockBlob);
      expect(apiClientSpy.download).toHaveBeenCalled();
      done();
    });
  });
});
