import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CustomerDetailComponent } from './customer-detail.component';
import { SalesService } from '@/app/core/services/sales.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('CustomerDetailComponent', () => {
  let component: CustomerDetailComponent;
  let fixture: ComponentFixture<CustomerDetailComponent>;
  let salesServiceSpy: jasmine.SpyObj<SalesService>;
  let messageServiceSpy: jasmine.SpyObj<NzMessageService>;
  let routerSpy: jasmine.SpyObj<Router>;

  const mockCustomer = { id: '1', name: 'Customer 1', email: 'c@c.com', isActive: true };

  beforeEach(async () => {
    salesServiceSpy = jasmine.createSpyObj('SalesService', ['getCustomerById', 'createCustomer', 'updateCustomer']);
    messageServiceSpy = jasmine.createSpyObj('NzMessageService', ['success', 'error']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [ CustomerDetailComponent, BrowserAnimationsModule, HttpClientTestingModule ],
      providers: [
        { provide: SalesService, useValue: salesServiceSpy },
        { provide: NzMessageService, useValue: messageServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => 'new' } } } }
      ]
    })
    .compileComponents();
  });

  function createComponent(id: string | null) {
      if (id && id !== 'new') {
        salesServiceSpy.getCustomerById.and.returnValue(of(mockCustomer as any));
      }
      const route = TestBed.inject(ActivatedRoute);
      spyOn(route.snapshot.paramMap, 'get').and.returnValue(id);
      
      fixture = TestBed.createComponent(CustomerDetailComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
  }

  it('should create', () => {
    createComponent('new');
    expect(component).toBeTruthy();
  });

  it('should load customer in edit mode', () => {
    createComponent('1');
    expect(salesServiceSpy.getCustomerById).toHaveBeenCalledWith('1');
    expect(component.customerForm.value.name).toBe('Customer 1');
  });

  it('should save new customer', () => {
    createComponent('new');
    salesServiceSpy.createCustomer.and.returnValue(of(mockCustomer as any));
    component.customerForm.patchValue({ name: 'New C', email: 'n@n.com' });
    component.save();
    expect(salesServiceSpy.createCustomer).toHaveBeenCalled();
    expect(messageServiceSpy.success).toHaveBeenCalled();
  });
});
