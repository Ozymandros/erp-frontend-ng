import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { SupplierDetailComponent } from './supplier-detail.component';
import { SuppliersService } from '../../../core/services/suppliers.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';

describe('SupplierDetailComponent', () => {
  let component: SupplierDetailComponent;
  let fixture: ComponentFixture<SupplierDetailComponent>;
  let suppliersServiceSpy: jasmine.SpyObj<SuppliersService>;
  let messageServiceSpy: jasmine.SpyObj<NzMessageService>;
  let routerSpy: jasmine.SpyObj<Router>;

  const mockSupplier = { 
    id: '1', 
    name: 'Supplier 1', 
    contactName: 'Contact 1',
    email: 's@s.com', 
    phoneNumber: '+1234567890',
    isActive: true 
  };

  beforeEach(async () => {
    suppliersServiceSpy = jasmine.createSpyObj('SuppliersService', ['getById', 'create', 'update']);
    messageServiceSpy = jasmine.createSpyObj('NzMessageService', ['success', 'error']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [ SupplierDetailComponent ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: SuppliersService, useValue: suppliersServiceSpy },
        { provide: NzMessageService, useValue: messageServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => 'new' } } } }
      ]
    })
    .compileComponents();
  });

  function createComponent(id: string | null) {
      if (id && id !== 'new') {
        suppliersServiceSpy.getById.and.returnValue(of(mockSupplier as any));
      }
      const route = TestBed.inject(ActivatedRoute);
      spyOn(route.snapshot.paramMap, 'get').and.returnValue(id);
      
      fixture = TestBed.createComponent(SupplierDetailComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
  }

  it('should create', () => {
    createComponent('new');
    expect(component).toBeTruthy();
  });

  it('should load supplier in edit mode', () => {
    createComponent('1');
    expect(suppliersServiceSpy.getById).toHaveBeenCalledWith('1');
    expect(component.supplierForm.value.name).toBe('Supplier 1');
  });

  it('should save new supplier', () => {
    createComponent('new');
    suppliersServiceSpy.create.and.returnValue(of(mockSupplier as any));
    component.supplierForm.patchValue({ 
      name: 'New S', 
      contactName: 'New Contact',
      email: 'n@n.com',
      phoneNumber: '+0987654321'
    });
    component.save();
    expect(suppliersServiceSpy.create).toHaveBeenCalled();
    expect(messageServiceSpy.success).toHaveBeenCalled();
  });

  it('should update existing supplier', () => {
    createComponent('1');
    suppliersServiceSpy.update.and.returnValue(of(mockSupplier as any));
    component.supplierForm.patchValue({ name: 'Updated Supplier' });
    component.save();
    expect(suppliersServiceSpy.update).toHaveBeenCalledWith('1', jasmine.any(Object));
    expect(messageServiceSpy.success).toHaveBeenCalled();
  });

  it('should handle load supplier error', () => {
    createComponent('1');
    suppliersServiceSpy.getById.and.returnValue(throwError(() => ({ message: 'Load error' })));
    component.loadSupplier('1');
    expect(messageServiceSpy.error).toHaveBeenCalledWith(jasmine.stringContaining('Failed to load supplier'));
  });

  it('should handle create supplier error', () => {
    createComponent('new');
    suppliersServiceSpy.create.and.returnValue(throwError(() => ({ message: 'Create error' })));
    component.supplierForm.patchValue({ 
      name: 'Test', 
      contactName: 'Contact',
      email: 'test@test.com',
      phoneNumber: '+1234567890'
    });
    component.save();
    expect(messageServiceSpy.error).toHaveBeenCalledWith(jasmine.stringContaining('Failed to create'));
  });

  it('should handle update supplier error', () => {
    createComponent('1');
    suppliersServiceSpy.update.and.returnValue(throwError(() => ({ message: 'Update error' })));
    component.supplierForm.patchValue({ name: 'Updated' });
    component.save();
    expect(messageServiceSpy.error).toHaveBeenCalledWith(jasmine.stringContaining('Failed to update'));
  });

  it('should not save invalid form', () => {
    createComponent('new');
    component.supplierForm.patchValue({ name: '' });
    component.save();
    expect(suppliersServiceSpy.create).not.toHaveBeenCalled();
    expect(component.supplierForm.touched).toBe(true);
  });

  it('should accept valid phone numbers', () => {
    createComponent('new');
    component.supplierForm.patchValue({ phoneNumber: '+1234567890' });
    expect(component.supplierForm.get('phoneNumber')?.valid).toBe(true);
  });

  it('should reject phone with too few digits', () => {
    createComponent('new');
    component.supplierForm.patchValue({ phoneNumber: '+123' });
    expect(component.supplierForm.get('phoneNumber')?.valid).toBe(false);
  });

  it('should reject phone with too many digits', () => {
    createComponent('new');
    component.supplierForm.patchValue({ phoneNumber: '+1234567890123456' });
    expect(component.supplierForm.get('phoneNumber')?.valid).toBe(false);
  });

  it('should reject phone with invalid characters', () => {
    createComponent('new');
    component.supplierForm.patchValue({ phoneNumber: '123!@#456' });
    expect(component.supplierForm.get('phoneNumber')?.valid).toBe(false);
  });

  it('should load supplier with fallback values', () => {
    const supplierWithMissingFields = {
      id: '2',
      name: 'Supplier 2',
      contactName: null,
      email: 'test@example.com',
      phone: null,
      phoneNumber: null,
      address: null
    };
    createComponent('2');
    suppliersServiceSpy.getById.and.returnValue(of(supplierWithMissingFields as any));
    component.loadSupplier('2');
    expect(component.supplierForm.value.contactName).toBe('Supplier 2');
    expect(component.supplierForm.value.address).toBe('');
  });

  it('should handle error without message on load', () => {
    createComponent('1');
    suppliersServiceSpy.getById.and.returnValue(throwError(() => ({})));
    component.loadSupplier('1');
    expect(messageServiceSpy.error).toHaveBeenCalledWith(jasmine.stringContaining('Unknown error'));
  });

  it('should handle error without message on save', () => {
    createComponent('new');
    suppliersServiceSpy.create.and.returnValue(throwError(() => ({})));
    component.supplierForm.patchValue({ 
      name: 'Test', 
      contactName: 'Contact',
      email: 'test@test.com',
      phoneNumber: '+1234567890'
    });
    component.save();
    expect(messageServiceSpy.error).toHaveBeenCalledWith(jasmine.stringContaining('Unknown error'));
  });
});

import { throwError } from 'rxjs';
