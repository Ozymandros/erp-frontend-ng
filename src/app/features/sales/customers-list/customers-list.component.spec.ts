import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CustomersListComponent } from './customers-list.component';
import { SalesService } from '@/app/core/services/sales.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

describe('CustomersListComponent', () => {
  let component: CustomersListComponent;
  let fixture: ComponentFixture<CustomersListComponent>;
  let salesServiceSpy: jasmine.SpyObj<SalesService>;
  let messageServiceSpy: jasmine.SpyObj<NzMessageService>;
  let modalServiceSpy: jasmine.SpyObj<NzModalService>;

  const mockResponse = {
    items: [{ id: '1', name: 'Customer 1', email: 'c@c.com', isActive: true }],
    total: 1
  };

  beforeEach(async () => {
    salesServiceSpy = jasmine.createSpyObj('SalesService', ['getCustomers', 'deleteCustomer']);
    messageServiceSpy = jasmine.createSpyObj('NzMessageService', ['success', 'error']);
    modalServiceSpy = jasmine.createSpyObj('NzModalService', ['confirm']);

    salesServiceSpy.getCustomers.and.returnValue(of(mockResponse as any));

    await TestBed.configureTestingModule({
      imports: [ CustomersListComponent, BrowserAnimationsModule, HttpClientTestingModule ],
      providers: [
        { provide: SalesService, useValue: salesServiceSpy },
        { provide: NzMessageService, useValue: messageServiceSpy },
        { provide: NzModalService, useValue: modalServiceSpy },
        { provide: ActivatedRoute, useValue: {} }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomersListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load customers', () => {
    expect(component.customers.length).toBe(1);
    expect(component.total).toBe(1);
  });

  it('should delete customer', () => {
    modalServiceSpy.confirm.and.callFake((options: any) => {
      options.nzOnOk();
      return undefined as any;
    });
    salesServiceSpy.deleteCustomer.and.returnValue(of(undefined));
    
    component.deleteCustomer(mockResponse.items[0] as any);
    
    expect(salesServiceSpy.deleteCustomer).toHaveBeenCalledWith('1');
    expect(messageServiceSpy.success).toHaveBeenCalled();
  });
});
