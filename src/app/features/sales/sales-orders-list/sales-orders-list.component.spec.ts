import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { SalesOrdersListComponent } from './sales-orders-list.component';
import { SalesService } from '@/app/core/services/sales.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

describe('SalesOrdersListComponent', () => {
  let component: SalesOrdersListComponent;
  let fixture: ComponentFixture<SalesOrdersListComponent>;
  let salesServiceSpy: jasmine.SpyObj<SalesService>;
  let messageServiceSpy: jasmine.SpyObj<NzMessageService>;

  const mockResponse = {
    items: [{ id: '1', orderNumber: 'SO-1', customerName: 'C1', totalAmount: 100, status: 'Confirmed', orderDate: new Date() }],
    total: 1
  };

  beforeEach(async () => {
    salesServiceSpy = jasmine.createSpyObj('SalesService', ['getSalesOrders', 'deleteSalesOrder']);
    messageServiceSpy = jasmine.createSpyObj('NzMessageService', ['success', 'error']);
    salesServiceSpy.getSalesOrders.and.returnValue(of(mockResponse as any));

    await TestBed.configureTestingModule({
      imports: [ SalesOrdersListComponent, BrowserAnimationsModule, HttpClientTestingModule ],
      providers: [
        { provide: SalesService, useValue: salesServiceSpy },
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
    salesServiceSpy.deleteSalesOrder.and.returnValue(of(undefined));
    component.deleteOrder('1');
    expect(salesServiceSpy.deleteSalesOrder).toHaveBeenCalledWith('1');
    expect(messageServiceSpy.success).toHaveBeenCalled();
  });
});
