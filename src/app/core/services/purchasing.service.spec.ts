import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { PurchasingService } from './purchasing.service';
import { ApiClientService } from '@/app/core/api/http-client.service';
import { PurchaseOrderDto, PaginatedResponse } from '@/app/types/api.types';

describe('PurchasingService', () => {
  let service: PurchasingService;
  let apiClientSpy: jasmine.SpyObj<ApiClientService>;

  beforeEach(() => {
    apiClientSpy = jasmine.createSpyObj('ApiClientService', ['get', 'post', 'put', 'delete']);

    TestBed.configureTestingModule({
      providers: [
        PurchasingService,
        { provide: ApiClientService, useValue: apiClientSpy }
      ]
    });
    service = TestBed.inject(PurchasingService);
  });

  it('should fetch purchase orders', (done) => {
    const mockResult: PaginatedResponse<PurchaseOrderDto> = {
      items: [{ id: '1', orderNumber: 'PO-001' } as PurchaseOrderDto],
      total: 1,
      page: 1,
      pageSize: 10,
      totalPages: 1,
      hasPreviousPage: false,
      hasNextPage: false
    };
    apiClientSpy.get.and.returnValue(of(mockResult));

    service.getPurchaseOrders().subscribe(result => {
      expect(result).toEqual(mockResult);
      done();
    });
  });

  it('should delete purchase order', (done) => {
    apiClientSpy.delete.and.returnValue(of(undefined));

    service.deletePurchaseOrder('1').subscribe(() => {
      expect(apiClientSpy.delete).toHaveBeenCalled();
      done();
    });
  });
});
