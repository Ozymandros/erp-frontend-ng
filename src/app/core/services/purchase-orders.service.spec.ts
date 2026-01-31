import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { PurchaseOrdersService } from './purchase-orders.service';
import { ApiClientService } from '../api/http-client.service';
import { PurchaseOrderDto, PaginatedResponse } from '../../types/api.types';

describe('PurchaseOrdersService', () => {
  let service: PurchaseOrdersService;
  let apiClientSpy: jasmine.SpyObj<ApiClientService>;

  beforeEach(() => {
    apiClientSpy = jasmine.createSpyObj('ApiClientService', ['get', 'post', 'put', 'delete', 'download']);

    TestBed.configureTestingModule({
      providers: [
        PurchaseOrdersService,
        { provide: ApiClientService, useValue: apiClientSpy }
      ]
    });
    service = TestBed.inject(PurchaseOrdersService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch purchase orders list', (done) => {
    const mockOrders: PaginatedResponse<PurchaseOrderDto> = {
      items: [{ id: '1', orderNumber: 'PO1' } as unknown as PurchaseOrderDto],
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
