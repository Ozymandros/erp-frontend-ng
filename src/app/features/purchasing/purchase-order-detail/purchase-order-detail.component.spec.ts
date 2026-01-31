import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { NZ_I18N, en_US } from 'ng-zorro-antd/i18n';
import { NzMessageService } from 'ng-zorro-antd/message';
import { of } from 'rxjs';
import { ProductsService } from '../../../core/services/products.service';
import { PurchaseOrdersService } from '../../../core/services/purchase-orders.service';
import { SuppliersService } from '../../../core/services/suppliers.service';
import { createOrderDetailFixture } from '../../../core/testing/order-detail-spec.helper';
import { PurchaseOrderDetailComponent } from './purchase-order-detail.component';

describe('PurchaseOrderDetailComponent', () => {
  let component: PurchaseOrderDetailComponent;
  let _fixture: ComponentFixture<PurchaseOrderDetailComponent>;
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

  function createComponent(id: string | null) {
    const result = createOrderDetailFixture(id, PurchaseOrderDetailComponent, {
      getByIdSpy: purchaseOrdersServiceSpy.getById,
      mockOrder
    });
    _fixture = result.fixture;
    component = result.component;
  }

  it('should create', () => {
    createComponent('new');
    expect(component).toBeTruthy();
  });

  it('should load order in view mode', () => {
    createComponent('1');
    expect(purchaseOrdersServiceSpy.getById).toHaveBeenCalledWith('1');
    expect(component.order?.orderNumber).toBe('PO-001');
  });

  it('should initialize form for new order', () => {
    createComponent('new');
    expect(component.orderForm).toBeDefined();
    expect(component.lines.length).toBe(1);
  });

  it('should add and remove lines', () => {
    createComponent('new');
    component.addLine();
    expect(component.lines.length).toBe(2);
    component.removeLine(1);
    expect(component.lines.length).toBe(1);
  });

  it('should submit new order', () => {
    createComponent('new');
    purchaseOrdersServiceSpy.create.and.returnValue(of(mockOrder as any));
    component.orderForm.patchValue({ 
      orderNumber: 'PO-NEW', 
      supplierId: 'S1',
      orderDate: new Date()
    });
    component.lines.at(0).patchValue({ productId: 'P1', quantity: 2, unitPrice: 50 });
    
    component.submitOrder();
    expect(purchaseOrdersServiceSpy.create).toHaveBeenCalled();
    expect(messageServiceSpy.success).toHaveBeenCalled();
  });
});
