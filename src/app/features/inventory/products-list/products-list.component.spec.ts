import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ProductsListComponent } from './products-list.component';
import { ProductsService } from '../../../core/services/products.service';
import { ProductDto, PaginatedResponse } from '../../../types/api.types';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

describe('ProductsListComponent', () => {
  let component: ProductsListComponent;
  let fixture: ComponentFixture<ProductsListComponent>;
  let productsServiceSpy: jasmine.SpyObj<ProductsService>;
  let messageServiceSpy: jasmine.SpyObj<NzMessageService>;
  let modalServiceSpy: jasmine.SpyObj<NzModalService>;

  const mockResponse = {
    items: [{ id: '1', sku: 'SKU1', name: 'Product 1', unitPrice: 10, stock: 100, isActive: true }],
    total: 1
  };

  beforeEach(async () => {
    productsServiceSpy = jasmine.createSpyObj('ProductsService', ['getProducts', 'deleteProduct']);
    productsServiceSpy.getProducts.and.returnValue(of({ items: [], total: 0 } as any));
    messageServiceSpy = jasmine.createSpyObj('NzMessageService', ['success', 'error']);
    modalServiceSpy = jasmine.createSpyObj('NzModalService', ['confirm', 'create', 'info', 'success', 'error', 'warning', 'open']);

    productsServiceSpy.getProducts.and.returnValue(of({
      items: mockResponse.items,
      total: mockResponse.total,
      page: 1,
      pageSize: 10,
      totalPages: 1,
      hasPreviousPage: false,
      hasNextPage: false
    } as PaginatedResponse<ProductDto>));

    await TestBed.configureTestingModule({
      imports: [ ProductsListComponent, BrowserAnimationsModule, HttpClientTestingModule ],
      providers: [
        { provide: ProductsService, useValue: productsServiceSpy },
        { provide: NzMessageService, useValue: messageServiceSpy },
        { provide: NzModalService, useValue: modalServiceSpy },
        { provide: ActivatedRoute, useValue: {} }
      ]
    })
    .overrideComponent(ProductsListComponent, {
      set: {
        providers: [
          { provide: NzModalService, useValue: modalServiceSpy }
        ]
      }
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
    expect(productsServiceSpy.getProducts).toHaveBeenCalledWith(jasmine.objectContaining({ search: 'query', page: 1 }));
  });

  it('should change page', () => {
    component.onPageChange(2);
    expect(productsServiceSpy.getProducts).toHaveBeenCalledWith(jasmine.objectContaining({ page: 2 }));
  });

  it('should delete product via modal', () => {
    modalServiceSpy.confirm.and.callFake((options: any) => {
      options.nzOnOk();
      return undefined as any;
    });
    productsServiceSpy.deleteProduct.and.returnValue(of(void 0));
    productsServiceSpy.getProducts.and.returnValue(of({ items: [], total: 0 } as any));
    
    component.deleteProduct(mockResponse.items[0] as any);
    
    expect(modalServiceSpy.confirm).toHaveBeenCalled();
    expect(productsServiceSpy.deleteProduct).toHaveBeenCalledWith('1');
    expect(messageServiceSpy.success).toHaveBeenCalled();
  });
});
