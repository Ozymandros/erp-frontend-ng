import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ProductsListComponent } from './products-list.component';
import { InventoryService } from '@/app/core/services/inventory.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

describe('ProductsListComponent', () => {
  let component: ProductsListComponent;
  let fixture: ComponentFixture<ProductsListComponent>;
  let inventoryServiceSpy: jasmine.SpyObj<InventoryService>;
  let messageServiceSpy: jasmine.SpyObj<NzMessageService>;
  let modalServiceSpy: jasmine.SpyObj<NzModalService>;

  const mockResponse = {
    items: [{ id: '1', sku: 'SKU1', name: 'Product 1', unitPrice: 10, stock: 100, isActive: true }],
    total: 1
  };

  beforeEach(async () => {
    inventoryServiceSpy = jasmine.createSpyObj('InventoryService', ['getProducts', 'deleteProduct']);
    messageServiceSpy = jasmine.createSpyObj('NzMessageService', ['success', 'error']);
    modalServiceSpy = jasmine.createSpyObj('NzModalService', ['confirm']);

    inventoryServiceSpy.getProducts.and.returnValue(of(mockResponse as any));

    await TestBed.configureTestingModule({
      imports: [ ProductsListComponent, BrowserAnimationsModule, HttpClientTestingModule ],
      providers: [
        { provide: InventoryService, useValue: inventoryServiceSpy },
        { provide: NzMessageService, useValue: messageServiceSpy },
        { provide: NzModalService, useValue: modalServiceSpy },
        { provide: ActivatedRoute, useValue: {} }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load products', () => {
    expect(component.products.length).toBe(1);
    expect(component.total).toBe(1);
  });

  it('should search products', () => {
    component.searchText = 'query';
    component.onSearch();
    expect(inventoryServiceSpy.getProducts).toHaveBeenCalledWith(jasmine.objectContaining({ search: 'query', page: 1 }));
  });

  it('should change page', () => {
    component.onPageChange(2);
    expect(inventoryServiceSpy.getProducts).toHaveBeenCalledWith(jasmine.objectContaining({ page: 2 }));
  });

  it('should delete product via modal', () => {
    modalServiceSpy.confirm.and.callFake((options: any) => {
      options.nzOnOk();
      return undefined as any;
    });
    inventoryServiceSpy.deleteProduct.and.returnValue(of(undefined));
    
    component.deleteProduct(mockResponse.items[0] as any);
    
    expect(modalServiceSpy.confirm).toHaveBeenCalled();
    expect(inventoryServiceSpy.deleteProduct).toHaveBeenCalledWith('1');
    expect(messageServiceSpy.success).toHaveBeenCalled();
  });
});
