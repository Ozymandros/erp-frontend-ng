import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { OrdersService } from './orders.service';
import { ApiClientService } from '../api/http-client.service';
import { ORDERS_ENDPOINTS } from '../api/endpoints.constants';
import { OrderDto, PaginatedResponse } from '../../types/api.types';

describe('OrdersService', () => {
  let service: OrdersService;
  let apiClientSpy: jasmine.SpyObj<ApiClientService>;

  beforeEach(() => {
    apiClientSpy = jasmine.createSpyObj('ApiClientService', ['get']);

    TestBed.configureTestingModule({
      providers: [
        OrdersService,
        { provide: ApiClientService, useValue: apiClientSpy }
      ]
    });
    service = TestBed.inject(OrdersService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch orders list', (done) => {
    const mockOrders: PaginatedResponse<OrderDto> = {
      items: [{ id: '1' } as unknown as OrderDto],
      total: 1,
      page: 1,
      pageSize: 10,
      totalPages: 1,
      hasPreviousPage: false,
      hasNextPage: false
    };
    apiClientSpy.get.and.returnValue(of(mockOrders));

    service.getOrders().subscribe(response => {
      expect(response).toEqual(mockOrders);
      expect(apiClientSpy.get).toHaveBeenCalledWith(ORDERS_ENDPOINTS.BASE, undefined);
      done();
    });
  });

  it('should fetch order by id', (done) => {
    const mockOrder = { id: '1', orderNumber: 'ORD-001' } as OrderDto;
    apiClientSpy.get.and.returnValue(of(mockOrder));

    service.getOrderById('1').subscribe(response => {
      expect(response).toEqual(mockOrder);
      expect(apiClientSpy.get).toHaveBeenCalledWith(ORDERS_ENDPOINTS.BY_ID('1'));
      done();
    });
  });
});
