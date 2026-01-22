import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { PurchaseOrdersListComponent } from './purchase-orders-list.component';
import { PurchaseOrdersService } from '../../../core/services/purchase-orders.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

describe('PurchaseOrdersListComponent', () => {
  let component: PurchaseOrdersListComponent;
  let fixture: ComponentFixture<PurchaseOrdersListComponent>;
  let purchaseOrdersServiceSpy: jasmine.SpyObj<PurchaseOrdersService>;
  let messageServiceSpy: jasmine.SpyObj<NzMessageService>;

  const mockResponse = {
    items: [{ id: '1', orderNumber: 'PO-1', supplierName: 'S1', totalAmount: 100, status: 'Pending', orderDate: new Date() }],
    total: 1
  };

  beforeEach(async () => {
    // The original code had a typo using 'purchasingServiceSpy' instead of 'purchaseOrdersServiceSpy'
    // The instruction adds the correct initialization for 'purchaseOrdersServiceSpy'
    // and updates the mock return value for 'getPurchaseOrders' using the correct spy.
    // The 'purchasingServiceSpy' line is left as is, but it's not used later.
    let purchasingServiceSpy = jasmine.createSpyObj('PurchasingService', ['getPurchaseOrders', 'deletePurchaseOrder']); // This line was in the original code
    purchaseOrdersServiceSpy = jasmine.createSpyObj('PurchaseOrdersService', ['getPurchaseOrders', 'deletePurchaseOrder']);
    messageServiceSpy = jasmine.createSpyObj('NzMessageService', ['success', 'error']);
    purchaseOrdersServiceSpy.getPurchaseOrders.and.returnValue(of({ items: [], total: 0 } as any));

    await TestBed.configureTestingModule({
      imports: [ PurchaseOrdersListComponent, BrowserAnimationsModule, HttpClientTestingModule ],
      providers: [
        { provide: PurchaseOrdersService, useValue: purchaseOrdersServiceSpy },
        { provide: NzMessageService, useValue: messageServiceSpy },
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
    // After the change in beforeEach, getPurchaseOrders now returns an empty array.
    // So, the component's orders and total will be 0 initially.
    expect(component.orders.length).toBe(0);
    expect(component.total).toBe(0);
  });

  it('should delete order', () => {
    purchaseOrdersServiceSpy.deletePurchaseOrder.and.returnValue(of(void 0));
    component.deleteOrder('1');
    expect(purchaseOrdersServiceSpy.deletePurchaseOrder).toHaveBeenCalledWith('1');
    expect(messageServiceSpy.success).toHaveBeenCalled();
  });
});
