import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { StockOperationsComponent } from './stock-operations.component';
import { InventoryService } from '@/app/core/services/inventory.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

describe('StockOperationsComponent', () => {
  let component: StockOperationsComponent;
  let fixture: ComponentFixture<StockOperationsComponent>;
  let inventoryServiceSpy: jasmine.SpyObj<InventoryService>;
  let messageServiceSpy: jasmine.SpyObj<NzMessageService>;

  const mockProducts = { items: [{ id: 'p1', name: 'Product 1', sku: 'SKU1' }] };
  const mockWarehouses = { items: [{ id: 'w1', name: 'Warehouse 1' }] };

  beforeEach(async () => {
    inventoryServiceSpy = jasmine.createSpyObj('InventoryService', ['getProducts', 'getWarehouses']);
    messageServiceSpy = jasmine.createSpyObj('NzMessageService', ['success', 'error']);

    inventoryServiceSpy.getProducts.and.returnValue(of(mockProducts as any));
    inventoryServiceSpy.getWarehouses.and.returnValue(of(mockWarehouses as any));

    await TestBed.configureTestingModule({
      imports: [ StockOperationsComponent, BrowserAnimationsModule, HttpClientTestingModule ],
      providers: [
        { provide: InventoryService, useValue: inventoryServiceSpy },
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
    expect(inventoryServiceSpy.getProducts).toHaveBeenCalled();
    expect(inventoryServiceSpy.getWarehouses).toHaveBeenCalled();
    expect(component.products.length).toBe(1);
    expect(component.warehouses.length).toBe(1);
  });

  it('should submit adjustment', fakeAsync(() => {
    component.adjustmentForm.setValue({
      productId: 'p1',
      warehouseId: 'w1',
      quantity: 10,
      reason: 'Test'
    });

    component.submitAdjustment();
    expect(component.submitting).toBeTrue();
    
    tick(1000);
    
    expect(messageServiceSpy.success).toHaveBeenCalledWith('Stock adjustment applied successfully');
    expect(component.submitting).toBeFalse();
  }));
});
