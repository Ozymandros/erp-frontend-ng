import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { WarehouseStocksService } from './warehouse-stocks.service';
import { ApiClientService } from '../api/http-client.service';
import { WarehouseStockDto, PaginatedResponse } from '../types/api.types';

describe('WarehouseStocksService', () => {
  let service: WarehouseStocksService;
  let apiClientSpy: jasmine.SpyObj<ApiClientService>;

  beforeEach(() => {
    apiClientSpy = jasmine.createSpyObj('ApiClientService', ['get', 'post', 'put', 'delete', 'download']);

    TestBed.configureTestingModule({
      providers: [
        WarehouseStocksService,
        { provide: ApiClientService, useValue: apiClientSpy }
      ]
    });
    service = TestBed.inject(WarehouseStocksService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch stocks list', (done) => {
    const mockData: PaginatedResponse<WarehouseStockDto> = {
      items: [{ id: '1', quantity: 100 } as unknown as WarehouseStockDto],
      total: 1,
      page: 1,
      pageSize: 10,
      totalPages: 1,
      hasPreviousPage: false,
      hasNextPage: false
    };

    apiClientSpy.get.and.returnValue(of(mockData));

    service.getAll().subscribe(response => {
      expect(response).toEqual(mockData);
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
