import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { CustomerDetailComponent } from './customer-detail.component';
import { CustomersService } from '../../../core/services/customers.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';

describe('CustomerDetailComponent', () => {
  let component: CustomerDetailComponent;
  let fixture: ComponentFixture<CustomerDetailComponent>;
  let customersServiceSpy: jasmine.SpyObj<CustomersService>;
  let messageServiceSpy: jasmine.SpyObj<NzMessageService>;
  let routerSpy: jasmine.SpyObj<Router>;

  const mockCustomer = { id: '1', name: 'Customer 1', email: 'c@c.com', isActive: true };

  beforeEach(async () => {
    customersServiceSpy = jasmine.createSpyObj('CustomersService', ['getById', 'create', 'update']);
    messageServiceSpy = jasmine.createSpyObj('NzMessageService', ['success', 'error']);

    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [ CustomerDetailComponent ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: CustomersService, useValue: customersServiceSpy },
        { provide: NzMessageService, useValue: messageServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => 'new' } } } }
      ]
    })
    .compileComponents();
  });

  function createComponent(id: string | null) {
      if (id && id !== 'new') {
        customersServiceSpy.getById.and.returnValue(of(mockCustomer as any));
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
    expect(customersServiceSpy.getById).toHaveBeenCalledWith('1');
    expect(component.customerForm.value.name).toBe('Customer 1');
  });

  it('should save new customer', () => {
    createComponent('new');
    customersServiceSpy.create.and.returnValue(of(mockCustomer as any));
    component.customerForm.patchValue({ name: 'New C', email: 'n@n.com' });
    component.save();
    expect(customersServiceSpy.create).toHaveBeenCalled();

    expect(messageServiceSpy.success).toHaveBeenCalled();
  });

  it('should update existing customer', () => {
    createComponent('1');
    customersServiceSpy.update.and.returnValue(of(mockCustomer as any));
    component.customerForm.patchValue({ name: 'Updated Customer' });
    component.save();
    expect(customersServiceSpy.update).toHaveBeenCalledWith('1', jasmine.any(Object));
    expect(messageServiceSpy.success).toHaveBeenCalled();
  });

  it('should handle load customer error', () => {
    createComponent('1');
    customersServiceSpy.getById.and.returnValue(throwError(() => ({ message: 'Load error' })));
    component.loadCustomer('1');
    expect(messageServiceSpy.error).toHaveBeenCalledWith(jasmine.stringContaining('Failed to load customer'));
  });

  it('should handle create customer error', () => {
    createComponent('new');
    customersServiceSpy.create.and.returnValue(throwError(() => ({ message: 'Create error' })));
    component.customerForm.patchValue({ name: 'Test', email: 'test@test.com' });
    component.save();
    expect(messageServiceSpy.error).toHaveBeenCalledWith(jasmine.stringContaining('Failed to create'));
  });

  it('should handle update customer error', () => {
    createComponent('1');
    customersServiceSpy.update.and.returnValue(throwError(() => ({ message: 'Update error' })));
    component.customerForm.patchValue({ name: 'Updated' });
    component.save();
    expect(messageServiceSpy.error).toHaveBeenCalledWith(jasmine.stringContaining('Failed to update'));
  });

  it('should not save invalid form', () => {
    createComponent('new');
    component.customerForm.patchValue({ name: '' });
    component.save();
    expect(customersServiceSpy.create).not.toHaveBeenCalled();
  });

  it('should reject invalid email', () => {
    createComponent('new');
    component.customerForm.patchValue({ email: 'invalid-email' });
    expect(component.customerForm.get('email')?.valid).toBe(false);
  });

  it('should accept valid email', () => {
    createComponent('new');
    component.customerForm.patchValue({ email: 'valid@example.com' });
    expect(component.customerForm.get('email')?.valid).toBe(true);
  });
});
