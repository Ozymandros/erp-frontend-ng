import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { SuppliersService } from './suppliers.service';
import { ApiClientService } from '../api/http-client.service';
import { PURCHASING_ENDPOINTS } from '../api/endpoints.constants';
import { SupplierDto, PaginatedResponse } from '../../types/api.types';

describe('SuppliersService', () => {
  let service: SuppliersService;
  let apiClientSpy: jasmine.SpyObj<ApiClientService>;

  beforeEach(() => {
    apiClientSpy = jasmine.createSpyObj('ApiClientService', ['get', 'post', 'put', 'delete', 'download']);

    TestBed.configureTestingModule({
      providers: [
        SuppliersService,
        { provide: ApiClientService, useValue: apiClientSpy }
      ]
    });
    service = TestBed.inject(SuppliersService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch suppliers list', (done) => {
    const mockSuppliers: PaginatedResponse<SupplierDto> = {
      items: [{ id: '1', name: 'Supplier 1' } as unknown as SupplierDto],
      total: 1,
      page: 1,
      pageSize: 10,
      totalPages: 1,
      hasPreviousPage: false,
      hasNextPage: false
    };
    apiClientSpy.get.and.returnValue(of(mockSuppliers));

    service.getAll().subscribe(response => {
      expect(response).toEqual(mockSuppliers);
      expect(apiClientSpy.get).toHaveBeenCalledWith(PURCHASING_ENDPOINTS.SUPPLIERS, undefined);
      done();
    });
  });

  it('should get supplier by id', (done) => {
    const mockSupplier = { id: '1', name: 'Supplier 1', email: '', createdAt: '', createdBy: '' } as SupplierDto;
    apiClientSpy.get.and.returnValue(of(mockSupplier));

    service.getById('1').subscribe(response => {
      expect(response).toEqual(mockSupplier);
      expect(apiClientSpy.get).toHaveBeenCalledWith(`${PURCHASING_ENDPOINTS.SUPPLIERS}/1`);
      done();
    });
  });

  it('should delete supplier', (done) => {
    apiClientSpy.delete.and.returnValue(of(undefined as never));

    service.delete('1').subscribe(() => {
      expect(apiClientSpy.delete).toHaveBeenCalledWith(`${PURCHASING_ENDPOINTS.SUPPLIERS}/1`);
      done();
    });
  });
});
