import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { InventoryService } from './inventory.service';
import { ApiClientService } from '@/app/core/api/http-client.service';
import { ProductDto, WarehouseDto, PaginatedResponse } from '@/app/types/api.types';

describe('InventoryService', () => {
  let service: InventoryService;
  let apiClientSpy: jasmine.SpyObj<ApiClientService>;

  const mockPaginatedResponse = <T>(items: T[]): PaginatedResponse<T> => ({
    items,
    total: items.length,
    page: 1,
    pageSize: 10,
    totalPages: 1,
    hasPreviousPage: false,
    hasNextPage: false
  });

  beforeEach(() => {
    apiClientSpy = jasmine.createSpyObj('ApiClientService', ['get', 'post', 'put', 'delete']);

    TestBed.configureTestingModule({
      providers: [
        InventoryService,
        { provide: ApiClientService, useValue: apiClientSpy }
      ]
    });
    service = TestBed.inject(InventoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Products', () => {
    it('should fetch products', (done) => {
      const mockResult = mockPaginatedResponse([{ id: '1', name: 'Product 1' } as ProductDto]);
      apiClientSpy.get.and.returnValue(of(mockResult));

      service.getProducts().subscribe(result => {
        expect(result).toEqual(mockResult);
        expect(apiClientSpy.get).toHaveBeenCalled();
        done();
      });
    });

    it('should fetch product by id', (done) => {
      const mockResult = { id: '1', name: 'Product 1' } as ProductDto;
      apiClientSpy.get.and.returnValue(of(mockResult));

      service.getProductById('1').subscribe(result => {
        expect(result).toEqual(mockResult);
        done();
      });
    });

    it('should create product', (done) => {
      const product = { name: 'New Product' } as any;
      apiClientSpy.post.and.returnValue(of(product));

      service.createProduct(product).subscribe(result => {
        expect(result).toEqual(product);
        done();
      });
    });
  });

  describe('Warehouses', () => {
    it('should fetch warehouses', (done) => {
      const mockResult = mockPaginatedResponse([{ id: '1', name: 'Warehouse 1' } as WarehouseDto]);
      apiClientSpy.get.and.returnValue(of(mockResult));

      service.getWarehouses().subscribe(result => {
        expect(result).toEqual(mockResult);
        done();
      });
    });
  });
});
