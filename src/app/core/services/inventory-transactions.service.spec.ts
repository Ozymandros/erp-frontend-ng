import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { InventoryTransactionsService } from './inventory-transactions.service';
import { ApiClientService } from '../api/http-client.service';
import { InventoryTransactionDto, PaginatedResponse } from '../types/api.types';

describe('InventoryTransactionsService', () => {
  let service: InventoryTransactionsService;
  let apiClientSpy: jasmine.SpyObj<ApiClientService>;

  beforeEach(() => {
    apiClientSpy = jasmine.createSpyObj('ApiClientService', ['get', 'post', 'put', 'delete', 'download']);

    TestBed.configureTestingModule({
      providers: [
        InventoryTransactionsService,
        { provide: ApiClientService, useValue: apiClientSpy }
      ]
    });
    service = TestBed.inject(InventoryTransactionsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch transactions list', (done) => {
    const mockData: PaginatedResponse<InventoryTransactionDto> = {
      items: [{ id: '1', transactionType: 'IN' } as unknown as InventoryTransactionDto],
      total: 1,
      page: 1,
      pageSize: 10,
      totalPages: 1,
      hasPreviousPage: false,
      hasNextPage: false
    };

    apiClientSpy.get.and.returnValue(of(mockData));

    service.getInventoryTransactions().subscribe(response => {
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
