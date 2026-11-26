import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { SalesOrdersService } from './sales-orders.service';
import { ApiClientService } from '../api/http-client.service';
import { SalesOrderDto, PaginatedResponse } from '../../types/api.types';
import { SALES_ENDPOINTS } from '../api/endpoints.constants';

describe('SalesOrdersService', () => {
  let service: SalesOrdersService;
  let apiClientSpy: jasmine.SpyObj<ApiClientService>;

  beforeEach(() => {
    apiClientSpy = jasmine.createSpyObj('ApiClientService', ['get', 'post', 'put', 'delete', 'download']);

    TestBed.configureTestingModule({
      providers: [
        SalesOrdersService,
        { provide: ApiClientService, useValue: apiClientSpy }
      ]
    });
    service = TestBed.inject(SalesOrdersService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch sales orders list', (done) => {
    const mockOrders: PaginatedResponse<SalesOrderDto> = {
      items: [{ id: '1', orderNumber: 'SO1' } as unknown as SalesOrderDto],
      total: 1,
      page: 1,
      pageSize: 10,
      totalPages: 1,
      hasPreviousPage: false,
      hasNextPage: false
    };

    apiClientSpy.get.and.returnValue(of(mockOrders));

    service.getAll().subscribe(response => {
      expect(response).toEqual(mockOrders);
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

  it('should POST createReturn to sales order returns endpoint', (done) => {
    const dto = { warehouseId: 'w1', lines: [{ productId: 'p1', quantity: 1 }] };
    const updated = { id: '1', returnOrderId: 'ret-1' } as SalesOrderDto;
    apiClientSpy.post.and.returnValue(of(updated));

    service.createReturn('1', dto).subscribe((result) => {
      expect(result).toEqual(updated);
      expect(apiClientSpy.post).toHaveBeenCalledWith(SALES_ENDPOINTS.CREATE_RETURN('1'), dto);
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
