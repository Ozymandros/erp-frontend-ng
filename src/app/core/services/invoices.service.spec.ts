import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { InvoicesService } from './invoices.service';
import { BILLING_ENDPOINTS } from '../api/endpoints.constants';

describe('InvoicesService', () => {
  let service: InvoicesService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [InvoicesService]
    });
    service = TestBed.inject(InvoicesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get all invoices', () => {
    const mockResponse = { items: [] as any, total: 0, page: 1, pageSize: 10, totalPages: 1, hasPreviousPage: false, hasNextPage: false };
    service.getAll({ page: 1, pageSize: 10 }).subscribe(response => {
      expect(response).toBeTruthy();
    });
    const req = httpMock.expectOne(req => req.url === BILLING_ENDPOINTS.INVOICES);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should get invoice by id', () => {
    const mockInvoice = { id: '123', invoiceNumber: 'INV-001', customerId: 'c1', currency: 'USD', status: 'Draft', issueDate: '2026-01-01', dueDate: '2026-01-31', totalNet: 100, totalTax: 10, totalGross: 110, outstandingAmount: 110, lines: [], createdAt: '2026-01-01', updatedAt: '2026-01-01' };
    service.getById('123').subscribe(invoice => {
      expect(invoice).toBeTruthy();
    });
    const req = httpMock.expectOne(`${BILLING_ENDPOINTS.INVOICES}/123`);
    expect(req.request.method).toBe('GET');
    req.flush(mockInvoice);
  });

  it('should get invoices by customer', () => {
    const mockInvoices = [{ id: '123', invoiceNumber: 'INV-001', customerId: 'c1', currency: 'USD', status: 'Draft', issueDate: '2026-01-01', dueDate: '2026-01-31', totalNet: 100, totalTax: 10, totalGross: 110, outstandingAmount: 110, lines: [], createdAt: '2026-01-01', updatedAt: '2026-01-01' }];
    service.getByCustomer('cust-1').subscribe(invoices => {
      expect(invoices).toBeTruthy();
    });
    const req = httpMock.expectOne(BILLING_ENDPOINTS.INVOICES_BY_CUSTOMER('cust-1'));
    expect(req.request.method).toBe('GET');
    req.flush(mockInvoices);
  });

  it('should get invoices by order', () => {
    const mockInvoices = [{ id: '123', invoiceNumber: 'INV-001', customerId: 'c1', currency: 'USD', status: 'Draft', issueDate: '2026-01-01', dueDate: '2026-01-31', totalNet: 100, totalTax: 10, totalGross: 110, outstandingAmount: 110, lines: [], createdAt: '2026-01-01', updatedAt: '2026-01-01' }];
    service.getByOrder('order-1').subscribe(invoices => {
      expect(invoices).toBeTruthy();
    });
    const req = httpMock.expectOne(BILLING_ENDPOINTS.INVOICES_BY_ORDER('order-1'));
    expect(req.request.method).toBe('GET');
    req.flush(mockInvoices);
  });

  it('should create invoice', () => {
    const request = { invoiceNumber: 'INV-001', customerId: 'c1', currency: 'USD', lines: [] };
    const mockInvoice = { id: '123', invoiceNumber: 'INV-001', customerId: 'c1', currency: 'USD', status: 'Draft', issueDate: '2026-01-01', dueDate: '2026-01-31', totalNet: 0, totalTax: 0, totalGross: 0, outstandingAmount: 0, lines: [], createdAt: '2026-01-01', updatedAt: '2026-01-01' };
    service.create(request).subscribe(invoice => {
      expect(invoice).toBeTruthy();
    });
    const req = httpMock.expectOne(BILLING_ENDPOINTS.INVOICES);
    expect(req.request.method).toBe('POST');
    req.flush(mockInvoice);
  });

  it('should update invoice', () => {
    const update = { status: 'Issued' };
    const mockInvoice = { id: '123', invoiceNumber: 'INV-001', customerId: 'c1', currency: 'USD', status: 'Issued', issueDate: '2026-01-01', dueDate: '2026-01-31', totalNet: 100, totalTax: 10, totalGross: 110, outstandingAmount: 110, lines: [], createdAt: '2026-01-01', updatedAt: '2026-01-01' };
    service.update('123', update).subscribe(invoice => {
      expect(invoice).toBeTruthy();
    });
    const req = httpMock.expectOne(`${BILLING_ENDPOINTS.INVOICES}/123`);
    expect(req.request.method).toBe('PUT');
    req.flush(mockInvoice);
  });

  it('should delete invoice', () => {
    service.delete('123').subscribe(response => {
      expect(response).toBeTruthy();
    });
    const req = httpMock.expectOne(`${BILLING_ENDPOINTS.INVOICES}/123`);
    expect(req.request.method).toBe('DELETE');
    req.flush({});
  });

  it('should issue invoice', () => {
    const request = { invoiceNumber: 'INV-001', issueDate: '2026-01-01T00:00:00Z' };
    const mockInvoice = { id: '123', invoiceNumber: 'INV-001', customerId: 'c1', currency: 'USD', status: 'Issued', issueDate: '2026-01-01', dueDate: '2026-01-31', totalNet: 100, totalTax: 10, totalGross: 110, outstandingAmount: 110, lines: [], createdAt: '2026-01-01', updatedAt: '2026-01-01' };
    service.issue('123', request).subscribe(invoice => {
      expect(invoice).toBeTruthy();
    });
    const req = httpMock.expectOne(BILLING_ENDPOINTS.INVOICE_ISSUE('123'));
    expect(req.request.method).toBe('POST');
    req.flush(mockInvoice);
  });

  it('should cancel invoice', () => {
    const request = { reason: 'Cancelled' };
    const mockInvoice = { id: '123', invoiceNumber: 'INV-001', customerId: 'c1', currency: 'USD', status: 'Cancelled', issueDate: '2026-01-01', dueDate: '2026-01-31', totalNet: 100, totalTax: 10, totalGross: 110, outstandingAmount: 110, lines: [], createdAt: '2026-01-01', updatedAt: '2026-01-01' };
    service.cancel('123', request).subscribe(invoice => {
      expect(invoice).toBeTruthy();
    });
    const req = httpMock.expectOne(BILLING_ENDPOINTS.INVOICE_CANCEL('123'));
    expect(req.request.method).toBe('POST');
    req.flush(mockInvoice);
  });

  it('should record payment', () => {
    const request = { invoiceId: '123', amount: 100, method: 'Cash', paidAt: '2026-01-01T00:00:00Z' };
    const mockInvoice = { id: '123', invoiceNumber: 'INV-001', customerId: 'c1', currency: 'USD', status: 'Paid', issueDate: '2026-01-01', dueDate: '2026-01-31', totalNet: 100, totalTax: 10, totalGross: 110, outstandingAmount: 0, lines: [], createdAt: '2026-01-01', updatedAt: '2026-01-01' };
    service.recordPayment('123', request).subscribe(invoice => {
      expect(invoice).toBeTruthy();
    });
    const req = httpMock.expectOne(BILLING_ENDPOINTS.INVOICE_PAYMENTS('123'));
    expect(req.request.method).toBe('POST');
    req.flush(mockInvoice);
  });

  it('should get credit notes by invoice', () => {
    const mockNotes = [{ id: 'cn-1', originalInvoiceId: 'inv-1', reason: 'Test', status: 'Pending', totalNet: 100, totalTax: 10, totalGross: 110, createdAt: '2026-01-01' }];
    service.getCreditNotes('123').subscribe(notes => {
      expect(notes).toBeTruthy();
    });
    const req = httpMock.expectOne(BILLING_ENDPOINTS.CREDIT_NOTES_BY_INVOICE('123'));
    expect(req.request.method).toBe('GET');
    req.flush(mockNotes);
  });

  it('should get payments by invoice', () => {
    const mockPayments = [{ id: 'pmt-1', invoiceId: 'inv-1', amount: 100, currency: 'USD', method: 'Cash', status: 'Completed', paidAt: '2026-01-01' }];
    service.getPayments('123').subscribe(payments => {
      expect(payments).toBeTruthy();
    });
    const req = httpMock.expectOne(BILLING_ENDPOINTS.PAYMENTS_BY_INVOICE('123'));
    expect(req.request.method).toBe('GET');
    req.flush(mockPayments);
  });

  it('should export to xlsx', () => {
    const blob = new Blob(['test'], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    service.exportToXlsx().subscribe(data => {
      expect(data).toBeTruthy();
    });
    const req = httpMock.expectOne(BILLING_ENDPOINTS.INVOICES_EXPORT_XLSX);
    expect(req.request.method).toBe('GET');
    req.flush(blob);
  });

  it('should export to pdf', () => {
    const blob = new Blob(['test'], { type: 'application/pdf' });
    service.exportToPdf().subscribe(data => {
      expect(data).toBeTruthy();
    });
    const req = httpMock.expectOne(BILLING_ENDPOINTS.INVOICES_EXPORT_PDF);
    expect(req.request.method).toBe('GET');
    req.flush(blob);
  });

  it('should get by order', () => {
    const mockInvoices = [{ id: '123', invoiceNumber: 'INV-001', customerId: 'c1', currency: 'USD', status: 'Draft', issueDate: '2026-01-01', dueDate: '2026-01-31', totalNet: 100, totalTax: 10, totalGross: 110, outstandingAmount: 110, lines: [], createdAt: '2026-01-01', updatedAt: '2026-01-01' }];
    service.getByOrder('order-1').subscribe(invoices => {
      expect(invoices).toBeTruthy();
    });
    const req = httpMock.expectOne(BILLING_ENDPOINTS.INVOICES_BY_ORDER('order-1'));
    expect(req.request.method).toBe('GET');
    req.flush(mockInvoices);
  });

  it('should get all without params', () => {
    const mockResponse = { items: [] as any, total: 0, page: 1, pageSize: 10, totalPages: 1, hasPreviousPage: false, hasNextPage: false };
    service.getAll().subscribe(response => {
      expect(response).toBeTruthy();
    });
    const req = httpMock.expectOne(req => req.url === BILLING_ENDPOINTS.INVOICES);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });
});