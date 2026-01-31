import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { SalesOrdersListComponent } from './sales-orders-list.component';
import { SalesOrdersService } from '../../../core/services/sales-orders.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { of, throwError } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { FileService } from '../../../core/services/file.service';
import { NzModalService } from 'ng-zorro-antd/modal';

describe('SalesOrdersListComponent', () => {
  let component: SalesOrdersListComponent;
  let fixture: ComponentFixture<SalesOrdersListComponent>;
  let salesOrdersServiceSpy: jasmine.SpyObj<SalesOrdersService>;
  let messageServiceSpy: jasmine.SpyObj<NzMessageService>;
  let fileServiceSpy: jasmine.SpyObj<FileService>;
  let modalServiceSpy: jasmine.SpyObj<NzModalService>;

  const mockResponse = {
    items: [{ id: '1', orderNumber: 'SO-1', customerName: 'C1', totalAmount: 100, status: 'Confirmed', orderDate: new Date() }],
    total: 1
  };

  beforeEach(async () => {
    salesOrdersServiceSpy = jasmine.createSpyObj('SalesOrdersService', ['getAll', 'delete', 'exportToXlsx', 'exportToPdf']);
    messageServiceSpy = jasmine.createSpyObj('NzMessageService', ['success', 'error']);
    fileServiceSpy = jasmine.createSpyObj('FileService', ['saveFile']);
    modalServiceSpy = jasmine.createSpyObj('NzModalService', ['confirm']);

    salesOrdersServiceSpy.getAll.and.returnValue(of(mockResponse as any));

    await TestBed.configureTestingModule({
      imports: [ SalesOrdersListComponent ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: SalesOrdersService, useValue: salesOrdersServiceSpy },
        { provide: NzMessageService, useValue: messageServiceSpy },
        { provide: FileService, useValue: fileServiceSpy },
        { provide: NzModalService, useValue: modalServiceSpy },
        { provide: ActivatedRoute, useValue: {} }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SalesOrdersListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load orders', () => {
    expect(component.data.length).toBe(1);
    expect(component.total).toBe(1);
  });

  it('should delete order', () => {
    salesOrdersServiceSpy.delete.and.returnValue(of(void 0));
    component.deleteOrder('1');
    expect(salesOrdersServiceSpy.delete).toHaveBeenCalledWith('1');
    expect(messageServiceSpy.success).toHaveBeenCalled();
  });

  it('should export to XLSX', () => {
    const mockBlob = new Blob(['data'], { type: 'application/octet-stream' });
    salesOrdersServiceSpy.exportToXlsx.and.returnValue(of(mockBlob));
    
    component.exportToXlsx();

    expect(salesOrdersServiceSpy.exportToXlsx).toHaveBeenCalled();
    expect(fileServiceSpy.saveFile).toHaveBeenCalledWith(mockBlob, 'export.xlsx');
    expect(messageServiceSpy.success).toHaveBeenCalledWith('Exported to XLSX successfully');
  });

  it('should handle export to XLSX error', () => {
    spyOn(console, 'error'); // Suppress console error
    salesOrdersServiceSpy.exportToXlsx.and.returnValue(throwError(() => new Error('Error')));
    
    component.exportToXlsx();
    
    expect(salesOrdersServiceSpy.exportToXlsx).toHaveBeenCalled();
    expect(messageServiceSpy.error).toHaveBeenCalledWith('Failed to export to XLSX');
  });

  it('should export to PDF', () => {
    const mockBlob = new Blob(['data'], { type: 'application/pdf' });
    salesOrdersServiceSpy.exportToPdf.and.returnValue(of(mockBlob));
    
    component.exportToPdf();

    expect(salesOrdersServiceSpy.exportToPdf).toHaveBeenCalled();
    expect(fileServiceSpy.saveFile).toHaveBeenCalledWith(mockBlob, 'export.pdf');
    expect(messageServiceSpy.success).toHaveBeenCalledWith('Exported to PDF successfully');
  });

  it('should handle export to PDF error', () => {
    spyOn(console, 'error'); // Suppress console error
    salesOrdersServiceSpy.exportToPdf.and.returnValue(throwError(() => new Error('Error')));
    
    component.exportToPdf();
    
    expect(salesOrdersServiceSpy.exportToPdf).toHaveBeenCalled();
    expect(messageServiceSpy.error).toHaveBeenCalledWith('Failed to export to PDF');
  });
});

