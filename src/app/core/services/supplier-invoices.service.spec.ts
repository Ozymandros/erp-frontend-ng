import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { SupplierInvoicesService } from './supplier-invoices.service';
import { ApiClientService } from '../api/http-client.service';
import { BILLING_ENDPOINTS } from '../api/endpoints.constants';
import type { CreateSupplierInvoiceDto, SupplierInvoiceDto } from '../../types/api.types';

describe('SupplierInvoicesService', () => {
  let service: SupplierInvoicesService;
  let apiClientSpy: jasmine.SpyObj<ApiClientService>;

  beforeEach(() => {
    apiClientSpy = jasmine.createSpyObj('ApiClientService', ['get', 'post']);
    TestBed.configureTestingModule({
      providers: [SupplierInvoicesService, { provide: ApiClientService, useValue: apiClientSpy }],
    });
    service = TestBed.inject(SupplierInvoicesService);
  });

  it('should fetch supplier invoices by purchase order', (done) => {
    const rows = [{ id: 'si1', invoiceNumber: 'SI-1' }] as SupplierInvoiceDto[];
    apiClientSpy.get.and.returnValue(of(rows));

    service.getByPurchaseOrder('po1').subscribe((result) => {
      expect(result).toEqual(rows);
      expect(apiClientSpy.get).toHaveBeenCalledWith(BILLING_ENDPOINTS.SUPPLIER_INVOICES_BY_PO('po1'));
      done();
    });
  });

  it('should create supplier invoice', (done) => {
    const dto = {
      invoiceNumber: 'SI-1',
      supplierId: 's1',
      purchaseOrderId: 'po1',
      currency: 'USD',
      lines: [{ productId: 'p1', quantity: 1, unitPrice: 10 }],
    } satisfies CreateSupplierInvoiceDto;
    const created = { id: 'si1', ...dto, lines: dto.lines } as SupplierInvoiceDto;
    apiClientSpy.post.and.returnValue(of(created));

    service.create(dto).subscribe((result) => {
      expect(result).toEqual(created);
      expect(apiClientSpy.post).toHaveBeenCalledWith(BILLING_ENDPOINTS.SUPPLIER_INVOICES, dto);
      done();
    });
  });
});
