import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { SalesOrderDetailComponent } from './sales-order-detail.component';
import { SalesOrdersService } from '../../../core/services/sales-orders.service';
import { CustomersService } from '../../../core/services/customers.service';
import { ProductsService } from '../../../core/services/products.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { NZ_I18N, en_US } from 'ng-zorro-antd/i18n';
import { createOrderDetailFixture } from '../../../core/testing/order-detail-spec.helper';

describe('SalesOrderDetailComponent', () => {
  let component: SalesOrderDetailComponent;
  let _fixture: ComponentFixture<SalesOrderDetailComponent>;
  let salesOrdersServiceSpy: jasmine.SpyObj<SalesOrdersService>;
  let customersServiceSpy: jasmine.SpyObj<CustomersService>;
  let productsServiceSpy: jasmine.SpyObj<ProductsService>;
  let messageServiceSpy: jasmine.SpyObj<NzMessageService>;
  let routerSpy: jasmine.SpyObj<Router>;

  const mockOrder = { 
    id: '1', 
    orderNumber: 'SO-001', 
    customerId: 'C1', 
    totalAmount: 100, 
    status: 0,
    lines: [{ productId: 'P1', quantity: 1, unitPrice: 100, lineTotal: 100 }]
  };

  const mockCustomers = { items: [{ id: 'C1', name: 'Customer 1' }], total: 1 };
  const mockProducts = { items: [{ id: 'P1', name: 'Product 1', unitPrice: 100 }], total: 1 };

  beforeEach(async () => {
    salesOrdersServiceSpy = jasmine.createSpyObj('SalesOrdersService', ['getById', 'create']);
    customersServiceSpy = jasmine.createSpyObj('CustomersService', ['getAll']);
    productsServiceSpy = jasmine.createSpyObj('ProductsService', ['getAll']);
    messageServiceSpy = jasmine.createSpyObj('NzMessageService', ['success', 'error', 'warning']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    customersServiceSpy.getAll.and.returnValue(of(mockCustomers as any));
    productsServiceSpy.getAll.and.returnValue(of(mockProducts as any));

    await TestBed.configureTestingModule({
      imports: [ SalesOrderDetailComponent ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: SalesOrdersService, useValue: salesOrdersServiceSpy },
        { provide: CustomersService, useValue: customersServiceSpy },
        { provide: ProductsService, useValue: productsServiceSpy },
        { provide: NzMessageService, useValue: messageServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: NZ_I18N, useValue: en_US },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => 'new' } } } }
      ]
    })
    .compileComponents();
  });

  function createComponent(id: string | null) {
    const result = createOrderDetailFixture(id, SalesOrderDetailComponent, {
      getByIdSpy: salesOrdersServiceSpy.getById,
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
    expect(salesOrdersServiceSpy.getById).toHaveBeenCalledWith('1');
    expect(component.order?.orderNumber).toBe('SO-001');
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
    salesOrdersServiceSpy.create.and.returnValue(of(mockOrder as any));
    component.orderForm.patchValue({ 
      orderNumber: 'SO-NEW', 
      customerId: 'C1',
      orderDate: new Date()
    });
    component.lines.at(0).patchValue({ productId: 'P1', quantity: 2, unitPrice: 50 });
    
    component.submitOrder();
    expect(salesOrdersServiceSpy.create).toHaveBeenCalled();
    expect(messageServiceSpy.success).toHaveBeenCalled();
  });
});
