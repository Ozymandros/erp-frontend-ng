import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ProductsListComponent } from './products-list.component';
import { ProductsService } from '../../../core/services/products.service';
import { ProductDto, PaginatedResponse } from '../../../types/api.types';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { of, throwError } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { FileService } from '../../../core/services/file.service';


describe('ProductsListComponent', () => {
  let component: ProductsListComponent;
  let fixture: ComponentFixture<ProductsListComponent>;
  let productsServiceSpy: jasmine.SpyObj<ProductsService>;
  let messageServiceSpy: jasmine.SpyObj<NzMessageService>;
  let modalServiceSpy: jasmine.SpyObj<NzModalService>;
  let fileServiceSpy: jasmine.SpyObj<FileService>;

  const mockResponse = {
    items: [{ id: '1', sku: 'SKU1', name: 'Product 1', unitPrice: 10, quantityInStock: 100, reorderLevel: 10, createdAt: '', createdBy: '' }],
    total: 1
  };

  beforeEach(async () => {
    productsServiceSpy = jasmine.createSpyObj('ProductsService', ['getAll', 'delete', 'exportToXlsx', 'exportToPdf']);
    productsServiceSpy.getAll.and.returnValue(of({ items: [], total: 0 } as any));
    messageServiceSpy = jasmine.createSpyObj('NzMessageService', ['success', 'error']);
    modalServiceSpy = jasmine.createSpyObj('NzModalService', ['confirm', 'create', 'info', 'success', 'error', 'warning', 'open']);
    fileServiceSpy = jasmine.createSpyObj('FileService', ['saveFile']);

    productsServiceSpy.getAll.and.returnValue(of({
      items: mockResponse.items,
      total: mockResponse.total,
      page: 1,
      pageSize: 10,
      totalPages: 1,
      hasPreviousPage: false,
      hasNextPage: false
    } as PaginatedResponse<ProductDto>));

    await TestBed.configureTestingModule({
      imports: [ ProductsListComponent ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ProductsService, useValue: productsServiceSpy },
        { provide: NzMessageService, useValue: messageServiceSpy },
        { provide: NzModalService, useValue: modalServiceSpy },
        { provide: FileService, useValue: fileServiceSpy },
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

  it('should search products', fakeAsync(() => {
    component.searchTerm = 'query';
    component.onSearch();
    tick(300);
    expect(productsServiceSpy.getAll).toHaveBeenCalledWith(jasmine.objectContaining({ SearchTerm: 'query', page: 1 }));
  }));

  it('should change page', () => {
    component.onPageChange(2);
    expect(productsServiceSpy.getAll).toHaveBeenCalledWith(jasmine.objectContaining({ page: 2 }));
  });

  it('should delete product via modal', () => {
    modalServiceSpy.confirm.and.callFake((options: any) => {
      options.nzOnOk();
      return undefined as any;
    });
    productsServiceSpy.delete.and.returnValue(of(void 0));
    productsServiceSpy.getAll.and.returnValue(of({ items: [], total: 0 } as any));
    
    component.deleteProduct(mockResponse.items[0] as any);
    
    expect(modalServiceSpy.confirm).toHaveBeenCalled();
    expect(productsServiceSpy.delete).toHaveBeenCalledWith('1');
    expect(messageServiceSpy.success).toHaveBeenCalled();
    });


  it('should export to XLSX', () => {
    const mockBlob = new Blob(['data'], { type: 'application/octet-stream' });
    productsServiceSpy.exportToXlsx.and.returnValue(of(mockBlob));

    component.exportToXlsx('products.xlsx');

    expect(productsServiceSpy.exportToXlsx).toHaveBeenCalled();
    expect(fileServiceSpy.saveFile).toHaveBeenCalledWith(mockBlob, 'products.xlsx');
    expect(messageServiceSpy.success).toHaveBeenCalledWith('Exported to XLSX successfully');
  });

  it('should handle export to XLSX error', () => {
    spyOn(console, 'error');
    productsServiceSpy.exportToXlsx.and.returnValue(throwError(() => new Error('Error')));
    
    component.exportToXlsx();
    
    expect(productsServiceSpy.exportToXlsx).toHaveBeenCalled();
    expect(messageServiceSpy.error).toHaveBeenCalledWith('Failed to export to XLSX');
  });

  it('should export to PDF', () => {
    const mockBlob = new Blob(['data'], { type: 'application/pdf' });
    productsServiceSpy.exportToPdf.and.returnValue(of(mockBlob));

    component.exportToPdf('products.pdf');

    expect(productsServiceSpy.exportToPdf).toHaveBeenCalled();
    expect(fileServiceSpy.saveFile).toHaveBeenCalledWith(mockBlob, 'products.pdf');
    expect(messageServiceSpy.success).toHaveBeenCalledWith('Exported to PDF successfully');
  });

  it('should handle export to PDF error', () => {
    spyOn(console, 'error');
    productsServiceSpy.exportToPdf.and.returnValue(throwError(() => new Error('Error')));
    
    component.exportToPdf();
    
    expect(productsServiceSpy.exportToPdf).toHaveBeenCalled();
    expect(messageServiceSpy.error).toHaveBeenCalledWith('Failed to export to PDF');
  });
});

