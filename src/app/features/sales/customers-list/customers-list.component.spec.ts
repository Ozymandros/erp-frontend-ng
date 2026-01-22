import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CustomersListComponent } from './customers-list.component';
import { CustomersService } from '../../../core/services/customers.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

describe('CustomersListComponent', () => {
  let component: CustomersListComponent;
  let fixture: ComponentFixture<CustomersListComponent>;
  let customersServiceSpy: jasmine.SpyObj<CustomersService>;
  let messageServiceSpy: jasmine.SpyObj<NzMessageService>;
  let modalServiceSpy: jasmine.SpyObj<NzModalService>;

  const mockResponse = {
    items: [{ id: '1', name: 'Customer 1', email: 'c@c.com', isActive: true }],
    total: 1
  };

  beforeEach(async () => {
    customersServiceSpy = jasmine.createSpyObj('CustomersService', ['getCustomers', 'deleteCustomer']);
    messageServiceSpy = jasmine.createSpyObj('NzMessageService', ['success', 'error']);
    modalServiceSpy = jasmine.createSpyObj('NzModalService', ['confirm', 'create', 'info', 'success', 'error', 'warning', 'open']);

    customersServiceSpy.getCustomers.and.returnValue(of(mockResponse as any));

    await TestBed.configureTestingModule({
      imports: [ CustomersListComponent, BrowserAnimationsModule, HttpClientTestingModule ],
      providers: [
        { provide: CustomersService, useValue: customersServiceSpy },
        { provide: NzMessageService, useValue: messageServiceSpy },
        { provide: NzModalService, useValue: modalServiceSpy },
        { provide: ActivatedRoute, useValue: {} }
      ]
    })
    .overrideComponent(CustomersListComponent, {
      set: {
        providers: [
          { provide: NzModalService, useValue: modalServiceSpy }
        ]
      }
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
    customersServiceSpy.deleteCustomer.and.returnValue(of(void 0));
    
    component.deleteCustomer({ id: '1' } as any);
    
    expect(customersServiceSpy.deleteCustomer).toHaveBeenCalledWith('1');
    expect(messageServiceSpy.success).toHaveBeenCalled();
  });
});
