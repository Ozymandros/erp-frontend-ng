import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { NZ_I18N, en_US } from 'ng-zorro-antd/i18n';
import { NzMessageService } from 'ng-zorro-antd/message';
import { of, throwError } from 'rxjs';
import { ProductsService } from '../../../core/services/products.service';
import { PurchaseOrdersService } from '../../../core/services/purchase-orders.service';
import { SuppliersService } from '../../../core/services/suppliers.service';
import { runCommonOrderDetailTests } from '../../../core/testing/order-detail-spec.helper';
import { PurchaseOrderDetailComponent } from './purchase-order-detail.component';

describe('PurchaseOrderDetailComponent', () => {
  let purchaseOrdersServiceSpy: jasmine.SpyObj<PurchaseOrdersService>;
  let productsServiceSpy: jasmine.SpyObj<ProductsService>;
  let suppliersServiceSpy: jasmine.SpyObj<SuppliersService>;
  let messageServiceSpy: jasmine.SpyObj<NzMessageService>;
  let routerSpy: jasmine.SpyObj<Router>;

  const mockOrder = { 
    id: '1', 
    orderNumber: 'PO-001', 
    supplierId: 'S1', 
    totalAmount: 100, 
    status: 0,
    lines: [{ productId: 'P1', quantity: 1, unitPrice: 100, lineTotal: 100 }]
  };

  const mockProducts = { items: [{ id: 'P1', name: 'Product 1', unitPrice: 100 }], total: 1 };
  const mockSuppliers = { items: [{ id: 'S1', name: 'Supplier 1' }], total: 1 };

  beforeEach(async () => {
    purchaseOrdersServiceSpy = jasmine.createSpyObj('PurchaseOrdersService', ['getById', 'create']);
    productsServiceSpy = jasmine.createSpyObj('ProductsService', ['getAll']);
    suppliersServiceSpy = jasmine.createSpyObj('SuppliersService', ['getAll']);
    messageServiceSpy = jasmine.createSpyObj('NzMessageService', ['success', 'error', 'warning']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    productsServiceSpy.getAll.and.returnValue(of(mockProducts as any));
    suppliersServiceSpy.getAll.and.returnValue(of(mockSuppliers as any));

    await TestBed.configureTestingModule({
      imports: [ PurchaseOrderDetailComponent ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: PurchaseOrdersService, useValue: purchaseOrdersServiceSpy },
        { provide: ProductsService, useValue: productsServiceSpy },
        { provide: SuppliersService, useValue: suppliersServiceSpy },
        { provide: NzMessageService, useValue: messageServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: NZ_I18N, useValue: en_US },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => 'new' } } } }
      ]
    })
    .compileComponents();
  });

  runCommonOrderDetailTests(PurchaseOrderDetailComponent, {
    getByIdSpy: () => purchaseOrdersServiceSpy.getById,
    createSpy: () => purchaseOrdersServiceSpy.create,
    mockOrder,
    orderNumberPrefix: 'PO',
    entityIdField: 'supplierId',
    entityIdValue: 'S1'
  });

  describe('Additional coverage tests', () => {
    let component: PurchaseOrderDetailComponent;
    let fixture: any;

    beforeEach(() => {
      fixture = TestBed.createComponent(PurchaseOrderDetailComponent);
      component = fixture.componentInstance;
    });

    it('should handle timeout error with timeout message', fakeAsync(() => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [PurchaseOrderDetailComponent],
        providers: [
          provideHttpClient(),
          provideHttpClientTesting(),
          { provide: NZ_I18N, useValue: en_US },
          { provide: PurchaseOrdersService, useValue: purchaseOrdersServiceSpy },
          { provide: SuppliersService, useValue: suppliersServiceSpy },
          { provide: ProductsService, useValue: productsServiceSpy },
          { provide: Router, useValue: { navigate: jasmine.createSpy('navigate') } },
          { provide: NzMessageService, useValue: messageServiceSpy },
          { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => '1' } } } }
        ]
      });
      
      purchaseOrdersServiceSpy.getById.and.returnValue(throwError(() => ({ message: 'Timeout has occurred' })));
      fixture = TestBed.createComponent(PurchaseOrderDetailComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      tick();

      expect(component.loadError).toContain('Request timed out');
    }));

    it('should handle error without message', fakeAsync(() => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [PurchaseOrderDetailComponent],
        providers: [
          provideHttpClient(),
          provideHttpClientTesting(),
          { provide: NZ_I18N, useValue: en_US },
          { provide: PurchaseOrdersService, useValue: purchaseOrdersServiceSpy },
          { provide: SuppliersService, useValue: suppliersServiceSpy },
          { provide: ProductsService, useValue: productsServiceSpy },
          { provide: Router, useValue: { navigate: jasmine.createSpy('navigate') } },
          { provide: NzMessageService, useValue: messageServiceSpy },
          { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => '1' } } } }
        ]
      });
      
      purchaseOrdersServiceSpy.getById.and.returnValue(throwError(() => ({})));
      fixture = TestBed.createComponent(PurchaseOrderDetailComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      tick();

      expect(component.loadError).toBe('Failed to load order.');
    }));

    it('should prevent removing last line with warning', () => {
      fixture.detectChanges();
      component.removeLine(0);
      expect(messageServiceSpy.warning).toHaveBeenCalledWith('At least one order line is required');
      expect(component.lines.length).toBe(1);
    });

    it('should mark all form controls as dirty when invalid', () => {
      fixture.detectChanges();
      component.orderForm.get('orderNumber')?.setValue('');
      component.orderForm.get('supplierId')?.setValue('');
      component.submitOrder();
      
      expect(component.orderForm.get('orderNumber')?.dirty).toBeTrue();
      expect(component.orderForm.get('supplierId')?.dirty).toBeTrue();
    });

    it('should mark line controls as dirty when invalid', () => {
      fixture.detectChanges();
      component.lines.at(0).get('productId')?.setValue('');
      component.submitOrder();
      
      expect(component.lines.at(0).get('productId')?.dirty).toBeTrue();
    });

    it('should set unitPrice when product is selected', (done) => {
      fixture.detectChanges();
      const line = component.lines.at(0);
      line.get('productId')?.setValue('P1');
      
      setTimeout(() => {
        expect(line.get('unitPrice')?.value).toBe(100);
        done();
      }, 50);
    });

    it('should not set unitPrice when product not found', (done) => {
      fixture.detectChanges();
      const line = component.lines.at(0);
      line.patchValue({ unitPrice: 50 }, { emitEvent: false });
      line.get('productId')?.setValue('NONEXISTENT');
      
      setTimeout(() => {
        expect(line.get('unitPrice')?.value).toBe(50);
        done();
      }, 50);
    });

    it('should calculate total correctly', () => {
      fixture.detectChanges();
      component.addLine();
      component.lines.at(0).patchValue({ quantity: 2, unitPrice: 10 });
      component.lines.at(1).patchValue({ quantity: 3, unitPrice: 5 });
      
      expect(component.calculateTotal()).toBe(35);
    });
  });
});
