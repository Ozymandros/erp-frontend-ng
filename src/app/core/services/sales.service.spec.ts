import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { SalesService } from './sales.service';
import { ApiClientService } from '@/app/core/api/http-client.service';
import { CustomerDto, SalesOrderDto, PaginatedResponse } from '@/app/types/api.types';

describe('SalesService', () => {
  let service: SalesService;
  let apiClientSpy: jasmine.SpyObj<ApiClientService>;

  beforeEach(() => {
    apiClientSpy = jasmine.createSpyObj('ApiClientService', ['get', 'post', 'put', 'delete']);

    TestBed.configureTestingModule({
      providers: [
        SalesService,
        { provide: ApiClientService, useValue: apiClientSpy }
      ]
    });
    service = TestBed.inject(SalesService);
  });

  it('should fetch customers', (done) => {
    const mockResult: PaginatedResponse<CustomerDto> = {
      items: [{ id: '1', name: 'Customer 1' } as CustomerDto],
      total: 1,
      page: 1,
      pageSize: 10,
      totalPages: 1,
      hasPreviousPage: false,
      hasNextPage: false
    };
    apiClientSpy.get.and.returnValue(of(mockResult));

    service.getCustomers().subscribe(result => {
      expect(result).toEqual(mockResult);
      done();
    });
  });

  it('should fetch sales orders', (done) => {
    const mockResult: PaginatedResponse<SalesOrderDto> = {
      items: [{ id: '1', orderNumber: 'SO-001' } as SalesOrderDto],
      total: 1,
      page: 1,
      pageSize: 10,
      totalPages: 1,
      hasPreviousPage: false,
      hasNextPage: false
    };
    apiClientSpy.get.and.returnValue(of(mockResult));

    service.getSalesOrders().subscribe(result => {
      expect(result).toEqual(mockResult);
      done();
    });
  });
});
