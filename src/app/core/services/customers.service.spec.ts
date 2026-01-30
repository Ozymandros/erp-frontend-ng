import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { CustomersService } from './customers.service';
import { ApiClientService } from '../api/http-client.service';
import { CustomerDto, PaginatedResponse } from '../types/api.types';

describe('CustomersService', () => {
  let service: CustomersService;
  let apiClientSpy: jasmine.SpyObj<ApiClientService>;

  beforeEach(() => {
    apiClientSpy = jasmine.createSpyObj('ApiClientService', ['get', 'post', 'put', 'delete', 'download']);

    TestBed.configureTestingModule({
      providers: [
        CustomersService,
        { provide: ApiClientService, useValue: apiClientSpy }
      ]
    });
    service = TestBed.inject(CustomersService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch customers list', (done) => {
    const mockCustomers: PaginatedResponse<CustomerDto> = {
      items: [{ id: '1', name: 'Cust1' } as unknown as CustomerDto],
      total: 1,
      page: 1,
      pageSize: 10,
      totalPages: 1,
      hasPreviousPage: false,
      hasNextPage: false
    };

    apiClientSpy.get.and.returnValue(of(mockCustomers));

    service.getAll().subscribe(response => {
      expect(response).toEqual(mockCustomers);
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
