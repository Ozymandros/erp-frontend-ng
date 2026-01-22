import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { SalesOrdersListComponent } from './sales-orders-list.component';
import { SalesOrdersService } from '../../../core/services/sales-orders.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

describe('SalesOrdersListComponent', () => {
  let component: SalesOrdersListComponent;
  let fixture: ComponentFixture<SalesOrdersListComponent>;
  let salesOrdersServiceSpy: jasmine.SpyObj<SalesOrdersService>;
  let messageServiceSpy: jasmine.SpyObj<NzMessageService>;

  const mockResponse = {
    items: [{ id: '1', orderNumber: 'SO-1', customerName: 'C1', totalAmount: 100, status: 'Confirmed', orderDate: new Date() }],
    total: 1
  };

  beforeEach(async () => {
    salesOrdersServiceSpy = jasmine.createSpyObj('SalesOrdersService', ['getSalesOrders', 'deleteSalesOrder']);
    messageServiceSpy = jasmine.createSpyObj('NzMessageService', ['success', 'error']);
    salesOrdersServiceSpy.getSalesOrders.and.returnValue(of(mockResponse as any));

    await TestBed.configureTestingModule({
      imports: [ SalesOrdersListComponent, BrowserAnimationsModule, HttpClientTestingModule ],
      providers: [
        { provide: SalesOrdersService, useValue: salesOrdersServiceSpy },
        { provide: NzMessageService, useValue: messageServiceSpy },
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
    expect(component.orders.length).toBe(1);
    expect(component.total).toBe(1);
  });

  it('should delete order', () => {
    salesOrdersServiceSpy.deleteSalesOrder.and.returnValue(of(void 0));
    component.deleteOrder('1');
    expect(salesOrdersServiceSpy.getSalesOrders).toHaveBeenCalled();
    expect(messageServiceSpy.success).toHaveBeenCalled();
  });
});
