import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ProductsService } from './products.service';
import { ApiClientService } from '../api/http-client.service';
import { ProductDto, PaginatedResponse } from '../types/api.types';

describe('ProductsService', () => {
  let service: ProductsService;
  let apiClientSpy: jasmine.SpyObj<ApiClientService>;

  beforeEach(() => {
    apiClientSpy = jasmine.createSpyObj('ApiClientService', ['get', 'post', 'put', 'delete', 'download']);

    TestBed.configureTestingModule({
      providers: [
        ProductsService,
        { provide: ApiClientService, useValue: apiClientSpy }
      ]
    });
    service = TestBed.inject(ProductsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch products list', (done) => {
    const mockProducts: PaginatedResponse<ProductDto> = {
      items: [{ id: '1', name: 'prod1' } as unknown as ProductDto],
      total: 1,
      page: 1,
      pageSize: 10,
      totalPages: 1,
      hasPreviousPage: false,
      hasNextPage: false
    };

    apiClientSpy.get.and.returnValue(of(mockProducts));

    service.getAll().subscribe(response => {
      expect(response).toEqual(mockProducts);
      expect(apiClientSpy.get).toHaveBeenCalled();
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
