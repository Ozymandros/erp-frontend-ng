import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { PurchaseOrdersListComponent } from './purchase-orders-list.component';
import { PurchasingService } from '@/app/core/services/purchasing.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

describe('PurchaseOrdersListComponent', () => {
  let component: PurchaseOrdersListComponent;
  let fixture: ComponentFixture<PurchaseOrdersListComponent>;
  let purchasingServiceSpy: jasmine.SpyObj<PurchasingService>;
  let messageServiceSpy: jasmine.SpyObj<NzMessageService>;

  const mockResponse = {
    items: [{ id: '1', orderNumber: 'PO-1', supplierName: 'S1', totalAmount: 100, status: 'Pending', orderDate: new Date() }],
    total: 1
  };

  beforeEach(async () => {
    purchasingServiceSpy = jasmine.createSpyObj('PurchasingService', ['getPurchaseOrders', 'deletePurchaseOrder']);
    messageServiceSpy = jasmine.createSpyObj('NzMessageService', ['success', 'error']);
    purchasingServiceSpy.getPurchaseOrders.and.returnValue(of(mockResponse as any));

    await TestBed.configureTestingModule({
      imports: [ PurchaseOrdersListComponent, BrowserAnimationsModule, HttpClientTestingModule ],
      providers: [
        { provide: PurchasingService, useValue: purchasingServiceSpy },
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
    expect(component.orders.length).toBe(1);
    expect(component.total).toBe(1);
  });

  it('should delete order', () => {
    purchasingServiceSpy.deletePurchaseOrder.and.returnValue(of(undefined));
    component.deleteOrder('1');
    expect(purchasingServiceSpy.deletePurchaseOrder).toHaveBeenCalledWith('1');
    expect(messageServiceSpy.success).toHaveBeenCalled();
  });
});
