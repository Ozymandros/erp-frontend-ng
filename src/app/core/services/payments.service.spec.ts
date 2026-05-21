import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PaymentsService } from './payments.service';
import { BILLING_ENDPOINTS } from '../api/endpoints.constants';

describe('PaymentsService', () => {
  let service: PaymentsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PaymentsService]
    });
    service = TestBed.inject(PaymentsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get all payments', () => {
    const mockResponse = { items: [] as any, total: 0, page: 1, pageSize: 10, totalPages: 1, hasPreviousPage: false, hasNextPage: false };
    service.getAll({ page: 1, pageSize: 10 }).subscribe(response => {
      expect(response).toBeTruthy();
    });
    const req = httpMock.expectOne(req => req.url === BILLING_ENDPOINTS.PAYMENTS);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should get payment by id', () => {
    const mockPayment = { id: 'pmt-1', invoiceId: 'inv-1', amount: 100, currency: 'USD', method: 'Cash', status: 'Completed', paidAt: '2026-01-01', createdAt: '2026-01-01', createdBy: 'user1' };
    service.getById('pmt-1').subscribe(payment => {
      expect(payment).toBeTruthy();
    });
    const req = httpMock.expectOne(`${BILLING_ENDPOINTS.PAYMENTS}/pmt-1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockPayment);
  });

  it('should get payments by invoice', () => {
    const mockPayments = [{ id: 'pmt-1', invoiceId: 'inv-1', amount: 100, currency: 'USD', method: 'Cash', status: 'Completed', paidAt: '2026-01-01' }];
    service.getByInvoice('inv-1').subscribe(payments => {
      expect(payments).toBeTruthy();
    });
    const req = httpMock.expectOne(BILLING_ENDPOINTS.PAYMENTS_BY_INVOICE('inv-1'));
    expect(req.request.method).toBe('GET');
    req.flush(mockPayments);
  });

  it('should create payment', () => {
    const request = { invoiceId: 'inv-1', amount: 100, method: 'Cash', paidAt: '2026-01-01T00:00:00Z' };
    const mockPayment = { id: 'pmt-1', invoiceId: 'inv-1', amount: 100, currency: 'USD', method: 'Cash', status: 'Completed', paidAt: '2026-01-01', createdAt: '2026-01-01', createdBy: 'user1' };
    service.create(request).subscribe(payment => {
      expect(payment).toBeTruthy();
    });
    const req = httpMock.expectOne(BILLING_ENDPOINTS.PAYMENTS);
    expect(req.request.method).toBe('POST');
    req.flush(mockPayment);
  });

  it('should delete payment', () => {
    service.delete('pmt-1').subscribe(response => {
      expect(response).toBeTruthy();
    });
    const req = httpMock.expectOne(`${BILLING_ENDPOINTS.PAYMENTS}/pmt-1`);
    expect(req.request.method).toBe('DELETE');
    req.flush({});
  });

  it('should update payment', () => {
    const update = { amount: 200 };
    const mockPayment = { id: 'pmt-1', invoiceId: 'inv-1', amount: 200, currency: 'USD', method: 'Cash', status: 'Completed', paidAt: '2026-01-01' };
    service.update('pmt-1', update).subscribe(payment => {
      expect(payment).toBeTruthy();
    });
    const req = httpMock.expectOne(`${BILLING_ENDPOINTS.PAYMENTS}/pmt-1`);
    expect(req.request.method).toBe('PUT');
    req.flush(mockPayment);
  });

  it('should export to xlsx', () => {
    const blob = new Blob(['test'], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    service.exportToXlsx().subscribe(data => {
      expect(data).toBeTruthy();
    });
    const req = httpMock.expectOne(BILLING_ENDPOINTS.PAYMENTS_EXPORT_XLSX);
    expect(req.request.method).toBe('GET');
    req.flush(blob);
  });

  it('should export to pdf', () => {
    const blob = new Blob(['test'], { type: 'application/pdf' });
    service.exportToPdf().subscribe(data => {
      expect(data).toBeTruthy();
    });
    const req = httpMock.expectOne(BILLING_ENDPOINTS.PAYMENTS_EXPORT_PDF);
    expect(req.request.method).toBe('GET');
    req.flush(blob);
  });
});