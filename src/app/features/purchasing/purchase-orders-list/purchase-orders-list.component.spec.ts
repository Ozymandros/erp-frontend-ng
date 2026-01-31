import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { PurchaseOrdersListComponent } from './purchase-orders-list.component';
import { PurchaseOrdersService } from '../../../core/services/purchase-orders.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { of } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { FileService } from '../../../core/services/file.service';
import { NzModalService } from 'ng-zorro-antd/modal';

describe('PurchaseOrdersListComponent', () => {
  let component: PurchaseOrdersListComponent;
  let fixture: ComponentFixture<PurchaseOrdersListComponent>;
  let purchaseOrdersServiceSpy: jasmine.SpyObj<PurchaseOrdersService>;
  let messageServiceSpy: jasmine.SpyObj<NzMessageService>;
  let fileServiceSpy: jasmine.SpyObj<FileService>;
  let modalServiceSpy: jasmine.SpyObj<NzModalService>;

  const mockResponse = {
    items: [{ id: '1', orderNumber: 'PO-1', supplierName: 'S1', totalAmount: 100, status: 'Pending', orderDate: new Date() }],
    total: 1
  };

  beforeEach(async () => {
    purchaseOrdersServiceSpy = jasmine.createSpyObj('PurchaseOrdersService', ['getAll', 'delete', 'exportToXlsx', 'exportToPdf']);
    messageServiceSpy = jasmine.createSpyObj('NzMessageService', ['success', 'error']);
    fileServiceSpy = jasmine.createSpyObj('FileService', ['saveFile']);
    modalServiceSpy = jasmine.createSpyObj('NzModalService', ['confirm']);

    purchaseOrdersServiceSpy.getAll.and.returnValue(of(mockResponse as any));

    await TestBed.configureTestingModule({
      imports: [ PurchaseOrdersListComponent ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: PurchaseOrdersService, useValue: purchaseOrdersServiceSpy },
        { provide: NzMessageService, useValue: messageServiceSpy },
        { provide: FileService, useValue: fileServiceSpy },
        { provide: NzModalService, useValue: modalServiceSpy },
        { provide: ActivatedRoute, useValue: {} }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PurchaseOrdersListComponent);
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
    purchaseOrdersServiceSpy.delete.and.returnValue(of(void 0));
    component.deleteOrder('1');
    expect(purchaseOrdersServiceSpy.delete).toHaveBeenCalledWith('1');
    expect(messageServiceSpy.success).toHaveBeenCalled();
  });
});
