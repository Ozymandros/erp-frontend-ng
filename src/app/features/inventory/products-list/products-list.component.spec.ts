import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ProductsListComponent } from './products-list.component';
import { ProductsService } from '../../../core/services/products.service';
import { ProductDto, PaginatedResponse } from '../../../types/api.types';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { FileUtils } from '../../../core/utils/file-utils';

describe('ProductsListComponent', () => {
  let component: ProductsListComponent;
  let fixture: ComponentFixture<ProductsListComponent>;
  let productsServiceSpy: jasmine.SpyObj<ProductsService>;
  let messageServiceSpy: jasmine.SpyObj<NzMessageService>;
  let modalServiceSpy: jasmine.SpyObj<NzModalService>;

  const mockResponse = {
    items: [{ id: '1', sku: 'SKU1', name: 'Product 1', unitPrice: 10, quantityInStock: 100, reorderLevel: 10, createdAt: '', createdBy: '' }],
    total: 1
  };

  beforeEach(async () => {
    productsServiceSpy = jasmine.createSpyObj('ProductsService', ['getProducts', 'deleteProduct', 'exportToXlsx', 'exportToPdf']);
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

  it('should export to XLSX', () => {
    const mockBlob = new Blob(['data'], { type: 'application/octet-stream' });
    productsServiceSpy.exportToXlsx.and.returnValue(of(mockBlob));
    spyOn(FileUtils, 'saveFile');

    component.exportToXlsx();

    expect(productsServiceSpy.exportToXlsx).toHaveBeenCalled();
    expect(FileUtils.saveFile).toHaveBeenCalledWith(mockBlob, 'products.xlsx');
    expect(messageServiceSpy.success).toHaveBeenCalledWith('Products exported to XLSX successfully');
  });

  it('should handle export to XLSX error', () => {
    productsServiceSpy.exportToXlsx.and.returnValue(throwError(() => new Error('Error')));
    
    component.exportToXlsx();
    
    expect(productsServiceSpy.exportToXlsx).toHaveBeenCalled();
    expect(messageServiceSpy.error).toHaveBeenCalledWith('Failed to export products to XLSX');
  });

  it('should export to PDF', () => {
    const mockBlob = new Blob(['data'], { type: 'application/pdf' });
    productsServiceSpy.exportToPdf.and.returnValue(of(mockBlob));
    spyOn(FileUtils, 'saveFile');

    component.exportToPdf();

    expect(productsServiceSpy.exportToPdf).toHaveBeenCalled();
    expect(FileUtils.saveFile).toHaveBeenCalledWith(mockBlob, 'products.pdf');
    expect(messageServiceSpy.success).toHaveBeenCalledWith('Products exported to PDF successfully');
  });

  it('should handle export to PDF error', () => {
    productsServiceSpy.exportToPdf.and.returnValue(throwError(() => new Error('Error')));
    
    component.exportToPdf();
    
    expect(productsServiceSpy.exportToPdf).toHaveBeenCalled();
    expect(messageServiceSpy.error).toHaveBeenCalledWith('Failed to export products to PDF');
  });
});

