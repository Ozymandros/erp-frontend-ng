import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { StockOperationsComponent } from './stock-operations.component';
import { StockOperationsService } from '../../../core/services/stock-operations.service';
import { ProductsService } from '../../../core/services/products.service';
import { WarehousesService } from '../../../core/services/warehouses.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { of, throwError } from 'rxjs';
import { ProductDto, WarehouseDto, PaginatedResponse } from '../../../types/api.types';

describe('StockOperationsComponent', () => {
  let component: StockOperationsComponent;
  let fixture: ComponentFixture<StockOperationsComponent>;
  let stockOperationsServiceSpy: jasmine.SpyObj<StockOperationsService>;
  let productsServiceSpy: jasmine.SpyObj<ProductsService>;
  let warehousesServiceSpy: jasmine.SpyObj<WarehousesService>;
  let messageServiceSpy: jasmine.SpyObj<NzMessageService>;

  const mockProducts: PaginatedResponse<ProductDto> = { 
    items: [{ id: 'p1', name: 'Product 1', sku: 'SKU1', unitPrice: 10, createdAt: '', createdBy: '', quantityInStock: 100, reorderLevel: 10 }],
    total: 1,
    page: 1,
    pageSize: 50,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false
  };
  const mockWarehouses: PaginatedResponse<WarehouseDto> = { 
    items: [{ id: 'w1', name: 'Warehouse 1', location: 'Loc 1', createdAt: '', createdBy: '' }],
    total: 1,
    page: 1,
    pageSize: 50,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false
  };

  beforeEach(async () => {
    stockOperationsServiceSpy = jasmine.createSpyObj('StockOperationsService', ['reserve', 'transfer', 'adjust']);
    productsServiceSpy = jasmine.createSpyObj('ProductsService', ['getAll', 'getById']);
    warehousesServiceSpy = jasmine.createSpyObj('WarehousesService', ['getAll', 'getById']);
    messageServiceSpy = jasmine.createSpyObj('NzMessageService', ['success', 'error', 'warning']);

    productsServiceSpy.getAll.and.returnValue(of(mockProducts));
    warehousesServiceSpy.getAll.and.returnValue(of(mockWarehouses));

    await TestBed.configureTestingModule({
      imports: [ StockOperationsComponent ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: StockOperationsService, useValue: stockOperationsServiceSpy },
        { provide: ProductsService, useValue: productsServiceSpy },
        { provide: WarehousesService, useValue: warehousesServiceSpy },
        { provide: NzMessageService, useValue: messageServiceSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StockOperationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load products on search', fakeAsync(() => {
    component.onProductSearch('prod');
    tick(300);
    expect(productsServiceSpy.getAll).toHaveBeenCalled();
    expect(component.products.length).toBe(1);
  }));

  it('should load warehouses on search', fakeAsync(() => {
    component.onWarehouseSearch('ware');
    tick(300);
    expect(warehousesServiceSpy.getAll).toHaveBeenCalled();
    expect(component.warehouses.length).toBe(1);
  }));

  it('should submit adjustment', () => {
    stockOperationsServiceSpy.adjust.and.returnValue(of(undefined));
    component.adjustmentForm.setValue({
      productId: 'p1',
      warehouseId: 'w1',
      quantity: 10,
      reason: 'Test'
    });

    component.submitAdjustment();
    expect(component.submitting).toBeFalse();
    expect(stockOperationsServiceSpy.adjust).toHaveBeenCalled();
    expect(messageServiceSpy.success).toHaveBeenCalledWith('Stock adjustment completed successfully');
  });

  it('should clear products when search term is too short', fakeAsync(() => {
    component.products = mockProducts.items;
    component.onProductSearch('ab');
    tick(300);
    expect(component.products.length).toBe(0);
    expect(component.notFoundProductText).toBe('Type at least 3 characters to search');
  }));

  it('should handle product search error', fakeAsync(() => {
    productsServiceSpy.getAll.and.returnValue(throwError(() => new Error('Search failed')));
    component.onProductSearch('abc');
    tick(300);
    expect(messageServiceSpy.error).toHaveBeenCalledWith('Failed to load products');
    expect(component.productSearching).toBeFalse();
  }));

  it('should load selected product if not in search results', fakeAsync(() => {
    productsServiceSpy.getAll.and.returnValue(of({ items: [] } as any));
    productsServiceSpy.getById.and.returnValue(of({ id: 'p2', name: 'Product 2' } as any));
    
    component.adjustmentForm.patchValue({ productId: 'p2' });
    component.onProductSearch('find');
    tick(300);
    
    expect(productsServiceSpy.getById).toHaveBeenCalledWith('p2');
    expect(component.products.length).toBe(1);
    expect(component.products[0].id).toBe('p2');
  }));

  it('should skip debounce when pasting a long term', fakeAsync(() => {
    component.onProductSearch('longterm-pasted');
    tick(10); 
    expect(productsServiceSpy.getAll).toHaveBeenCalled();
  }));

  it('should update open states', () => {
    component.onProductOpenChange(true);
    expect(component.productDropdownOpen).toBeTrue();
    component.onWarehouseOpenChange(true);
    expect(component.warehouseDropdownOpen).toBeTrue();
  });

  it('should handle document paste', fakeAsync(() => {
    const text = 'pasted-product';
    const event = {
      clipboardData: { getData: () => text },
      stopPropagation: () => {},
      preventDefault: () => {}
    } as any;

    component.productDropdownOpen = true;
    component.onDocumentPaste(event);
    tick(10);
    expect(productsServiceSpy.getAll).toHaveBeenCalled();
    expect(component.productSearchTerm).toBe(text);
  }));
});
