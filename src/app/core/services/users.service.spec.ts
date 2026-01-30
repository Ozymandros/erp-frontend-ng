import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { UsersService } from './users.service';
import { ApiClientService } from '../api/http-client.service';
import { User, PaginatedResponse } from '../types/api.types';

describe('UsersService', () => {
  let service: UsersService;
  let apiClientSpy: jasmine.SpyObj<ApiClientService>;

  beforeEach(() => {
    apiClientSpy = jasmine.createSpyObj('ApiClientService', ['get', 'post', 'put', 'delete', 'download']);

    TestBed.configureTestingModule({
      providers: [
        UsersService,
        { provide: ApiClientService, useValue: apiClientSpy }
      ]
    });
    service = TestBed.inject(UsersService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch users list', (done) => {
    const mockUsers: PaginatedResponse<User> = {
      items: [{ id: '1', username: 'user1' } as unknown as User],
      total: 1,
      page: 1,
      pageSize: 10,
      totalPages: 1,
      hasPreviousPage: false,
      hasNextPage: false
    };

    apiClientSpy.get.and.returnValue(of(mockUsers));

    service.getAll().subscribe(response => {
      expect(response).toEqual(mockUsers);
      expect(apiClientSpy.get).toHaveBeenCalled();
      done();
    });
  });

  it('should delete a user', (done) => {
    apiClientSpy.delete.and.returnValue(of(undefined));

    service.delete('1').subscribe(() => {
      expect(apiClientSpy.delete).toHaveBeenCalled();
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
