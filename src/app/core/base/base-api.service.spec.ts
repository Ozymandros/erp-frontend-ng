import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { BaseApiService } from './base-api.service';
import { ApiClientService } from '../api/http-client.service';
import { PaginatedResponse } from '../../types/api.types';

class TestDto {
  id = '1';
  name = 'Test';
}

class TestApiService extends BaseApiService<TestDto> {
  constructor(apiClient: ApiClientService) {
    super(apiClient);
  }
  protected getEndpoint(): string {
    return 'test-endpoint';
  }
}

describe('BaseApiService', () => {
  let service: TestApiService;
  let apiClientSpy: jasmine.SpyObj<ApiClientService>;

  beforeEach(() => {
    apiClientSpy = jasmine.createSpyObj('ApiClientService', ['get', 'post', 'put', 'delete', 'download']);
    apiClientSpy.get.and.returnValue(of({
      items: [],
      total: 0,
      page: 1,
      pageSize: 10,
      totalPages: 0,
      hasPreviousPage: false,
      hasNextPage: false
    } as PaginatedResponse<TestDto>));
    apiClientSpy.delete.and.returnValue(of(undefined as never));

    TestBed.configureTestingModule({
      providers: [
        { provide: ApiClientService, useValue: apiClientSpy },
        { provide: TestApiService, useFactory: (api: ApiClientService) => new TestApiService(api), deps: [ApiClientService] }
      ]
    });
    service = TestBed.inject(TestApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call get with endpoint for getAll', (done) => {
    service.getAll().subscribe(() => {
      expect(apiClientSpy.get).toHaveBeenCalledWith('test-endpoint', undefined);
      done();
    });
  });

  it('should call get with endpoint/id for getById', (done) => {
    apiClientSpy.get.and.returnValue(of({ id: '1', name: 'Test' } as TestDto));
    service.getById('1').subscribe(() => {
      expect(apiClientSpy.get).toHaveBeenCalledWith('test-endpoint/1');
      done();
    });
  });

  it('should call delete with endpoint/id for delete', (done) => {
    service.delete('1').subscribe(() => {
      expect(apiClientSpy.delete).toHaveBeenCalledWith('test-endpoint/1');
      done();
    });
  });

  it('should call post with endpoint for create', (done) => {
    apiClientSpy.post.and.returnValue(of({ id: '2', name: 'New' } as TestDto));
    service.create({ name: 'New' }).subscribe(() => {
      expect(apiClientSpy.post).toHaveBeenCalledWith('test-endpoint', { name: 'New' });
      done();
    });
  });

  it('should call put with endpoint/id for update', (done) => {
    apiClientSpy.put.and.returnValue(of({ id: '1', name: 'Updated' } as TestDto));
    service.update('1', { name: 'Updated' }).subscribe(() => {
      expect(apiClientSpy.put).toHaveBeenCalledWith('test-endpoint/1', { name: 'Updated' });
      done();
    });
  });

  it('should call download with export-xlsx for exportToXlsx', (done) => {
    const blob = new Blob(['x'], { type: 'application/octet-stream' });
    apiClientSpy.download.and.returnValue(of(blob));
    service.exportToXlsx().subscribe(() => {
      expect(apiClientSpy.download).toHaveBeenCalledWith('test-endpoint/export-xlsx');
      done();
    });
  });

  it('should call download with export-pdf for exportToPdf', (done) => {
    const blob = new Blob(['x'], { type: 'application/pdf' });
    apiClientSpy.download.and.returnValue(of(blob));
    service.exportToPdf().subscribe(() => {
      expect(apiClientSpy.download).toHaveBeenCalledWith('test-endpoint/export-pdf');
      done();
    });
  });
});
