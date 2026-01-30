import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { SupplierDetailComponent } from './supplier-detail.component';
import { SuppliersService } from '../../../core/services/suppliers.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

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
      imports: [ SupplierDetailComponent, BrowserAnimationsModule, HttpClientTestingModule ],
      providers: [
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
});
