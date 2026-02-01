import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { StockOperationsService } from './stock-operations.service';
import { ApiClientService } from '../api/http-client.service';
import { INVENTORY_ENDPOINTS } from '../api/endpoints.constants';
import { StockOperationRequest } from '../../types/api.types';

describe('StockOperationsService', () => {
  let service: StockOperationsService;
  let apiClientSpy: jasmine.SpyObj<ApiClientService>;

  const mockRequest: StockOperationRequest = {
    warehouseId: 'w1',
    productId: 'p1',
    quantity: 10,
    reason: 'test'
  };

  beforeEach(() => {
    apiClientSpy = jasmine.createSpyObj('ApiClientService', ['post']);
    apiClientSpy.post.and.returnValue(of(undefined as never));

    TestBed.configureTestingModule({
      providers: [
        StockOperationsService,
        { provide: ApiClientService, useValue: apiClientSpy }
      ]
    });
    service = TestBed.inject(StockOperationsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call reserve endpoint', (done) => {
    service.reserve(mockRequest).subscribe(() => {
      expect(apiClientSpy.post).toHaveBeenCalledWith(
        `${INVENTORY_ENDPOINTS.STOCK_OPERATIONS}/reserve`,
        mockRequest
      );
      done();
    });
  });

  it('should call transfer endpoint', (done) => {
    service.transfer(mockRequest).subscribe(() => {
      expect(apiClientSpy.post).toHaveBeenCalledWith(
        `${INVENTORY_ENDPOINTS.STOCK_OPERATIONS}/transfer`,
        mockRequest
      );
      done();
    });
  });

  it('should call adjust endpoint', (done) => {
    service.adjust(mockRequest).subscribe(() => {
      expect(apiClientSpy.post).toHaveBeenCalledWith(
        `${INVENTORY_ENDPOINTS.STOCK_OPERATIONS}/adjust`,
        mockRequest
      );
      done();
    });
  });
});
