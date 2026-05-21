import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CreditNotesService } from './credit-notes.service';
import { BILLING_ENDPOINTS } from '../api/endpoints.constants';

describe('CreditNotesService', () => {
  let service: CreditNotesService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CreditNotesService]
    });
    service = TestBed.inject(CreditNotesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get all credit notes', () => {
    const mockResponse = { items: [] as any, total: 0, page: 1, pageSize: 10, totalPages: 1, hasPreviousPage: false, hasNextPage: false };
    service.getAll({ page: 1, pageSize: 10 }).subscribe(response => {
      expect(response).toBeTruthy();
    });
    const req = httpMock.expectOne(req => req.url === BILLING_ENDPOINTS.CREDIT_NOTES);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should get credit note by id', () => {
    const mockCreditNote = { id: 'cn-1', originalInvoiceId: 'inv-1', reason: 'Test credit', status: 'Pending', totalNet: 100, totalTax: 10, totalGross: 110, createdAt: '2026-01-01', createdBy: 'user1' };
    service.getById('cn-1').subscribe(creditNote => {
      expect(creditNote).toBeTruthy();
    });
    const req = httpMock.expectOne(`${BILLING_ENDPOINTS.CREDIT_NOTES}/cn-1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockCreditNote);
  });

  it('should get credit notes by invoice', () => {
    const mockNotes = [{ id: 'cn-1', originalInvoiceId: 'inv-1', reason: 'Test', status: 'Pending', totalNet: 100, totalTax: 10, totalGross: 110, createdAt: '2026-01-01' }];
    service.getByInvoice('inv-1').subscribe(notes => {
      expect(notes).toBeTruthy();
    });
    const req = httpMock.expectOne(BILLING_ENDPOINTS.CREDIT_NOTES_BY_INVOICE('inv-1'));
    expect(req.request.method).toBe('GET');
    req.flush(mockNotes);
  });

  it('should create credit note', () => {
    const request = { invoiceId: 'inv-1', reason: 'Test credit', lines: [] };
    const mockCreditNote = { id: 'cn-1', originalInvoiceId: 'inv-1', reason: 'Test credit', status: 'Pending', totalNet: 0, totalTax: 0, totalGross: 0, createdAt: '2026-01-01', createdBy: 'user1' };
    service.create(request).subscribe(creditNote => {
      expect(creditNote).toBeTruthy();
    });
    const req = httpMock.expectOne(BILLING_ENDPOINTS.CREDIT_NOTES);
    expect(req.request.method).toBe('POST');
    req.flush(mockCreditNote);
  });

  it('should delete credit note', () => {
    service.delete('cn-1').subscribe(response => {
      expect(response).toBeTruthy();
    });
    const req = httpMock.expectOne(`${BILLING_ENDPOINTS.CREDIT_NOTES}/cn-1`);
    expect(req.request.method).toBe('DELETE');
    req.flush({});
  });

  it('should update credit note', () => {
    const update = { reason: 'Updated reason' };
    const mockCreditNote = { id: 'cn-1', originalInvoiceId: 'inv-1', reason: 'Updated reason', status: 'Pending', totalNet: 100, totalTax: 10, totalGross: 110 };
    service.update('cn-1', update).subscribe(creditNote => {
      expect(creditNote).toBeTruthy();
    });
    const req = httpMock.expectOne(`${BILLING_ENDPOINTS.CREDIT_NOTES}/cn-1`);
    expect(req.request.method).toBe('PUT');
    req.flush(mockCreditNote);
  });

  it('should export to xlsx', () => {
    const blob = new Blob(['test'], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    service.exportToXlsx().subscribe(data => {
      expect(data).toBeTruthy();
    });
    const req = httpMock.expectOne(BILLING_ENDPOINTS.CREDIT_NOTES_EXPORT_XLSX);
    expect(req.request.method).toBe('GET');
    req.flush(blob);
  });

  it('should export to pdf', () => {
    const blob = new Blob(['test'], { type: 'application/pdf' });
    service.exportToPdf().subscribe(data => {
      expect(data).toBeTruthy();
    });
    const req = httpMock.expectOne(BILLING_ENDPOINTS.CREDIT_NOTES_EXPORT_PDF);
    expect(req.request.method).toBe('GET');
    req.flush(blob);
  });
});