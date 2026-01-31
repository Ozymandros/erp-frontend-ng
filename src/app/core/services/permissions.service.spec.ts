import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { PermissionsService } from './permissions.service';
import { ApiClientService } from '../api/http-client.service';
import { Permission, PaginatedResponse } from '../../types/api.types';

describe('PermissionsService', () => {
  let service: PermissionsService;
  let apiClientSpy: jasmine.SpyObj<ApiClientService>;

  beforeEach(() => {
    apiClientSpy = jasmine.createSpyObj('ApiClientService', ['get', 'post', 'put', 'delete', 'download']);

    TestBed.configureTestingModule({
      providers: [
        PermissionsService,
        { provide: ApiClientService, useValue: apiClientSpy }
      ]
    });
    service = TestBed.inject(PermissionsService);
  });

  it('should fetch permissions', (done) => {
    const mockResult: PaginatedResponse<Permission> = {
      items: [{ id: '1', module: 'Users', action: 'Read' } as unknown as Permission],
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

  it('should create permission', (done) => {
    const perm = { module: 'Inventory', action: 'Write' } as any;
    apiClientSpy.post.and.returnValue(of({ ...perm, id: '2' }));

    service.create(perm).subscribe(result => {
      expect(result.id).toBe('2');
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
