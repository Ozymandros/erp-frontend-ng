import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { StockOperationsComponent } from './stock-operations.component';
import { StockOperationsService } from '../../../core/services/stock-operations.service';
import { ProductsService } from '../../../core/services/products.service';
import { WarehousesService } from '../../../core/services/warehouses.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

describe('StockOperationsComponent', () => {
  let component: StockOperationsComponent;
  let fixture: ComponentFixture<StockOperationsComponent>;
  let stockOperationsServiceSpy: jasmine.SpyObj<StockOperationsService>;
  let productsServiceSpy: jasmine.SpyObj<ProductsService>;
  let warehousesServiceSpy: jasmine.SpyObj<WarehousesService>;
  let messageServiceSpy: jasmine.SpyObj<NzMessageService>;

  const mockProducts = { items: [{ id: 'p1', name: 'Product 1', sku: 'SKU1' }] };
  const mockWarehouses = { items: [{ id: 'w1', name: 'Warehouse 1' }] };

  beforeEach(async () => {
    stockOperationsServiceSpy = jasmine.createSpyObj('StockOperationsService', ['reserve', 'transfer', 'adjust']);
    productsServiceSpy = jasmine.createSpyObj('ProductsService', ['getAll']);
    warehousesServiceSpy = jasmine.createSpyObj('WarehousesService', ['getAll']);
    messageServiceSpy = jasmine.createSpyObj('NzMessageService', ['success', 'error']);

    productsServiceSpy.getAll.and.returnValue(of(mockProducts as any));
    warehousesServiceSpy.getAll.and.returnValue(of(mockWarehouses as any));

    await TestBed.configureTestingModule({
      imports: [ StockOperationsComponent, BrowserAnimationsModule, HttpClientTestingModule ],
      providers: [
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

  it('should load data on init', () => {
    expect(productsServiceSpy.getAll).toHaveBeenCalled();

    expect(warehousesServiceSpy.getAll).toHaveBeenCalled();

    expect(component.products.length).toBe(1);
    expect(component.warehouses.length).toBe(1);
  });

  it('should submit adjustment', () => {
    stockOperationsServiceSpy.adjust.and.returnValue(of(void 0));
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
});
