import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ProductDetailComponent } from './product-detail.component';
import { ProductsService } from '../../../core/services/products.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
describe('ProductDetailComponent', () => {
  let component: ProductDetailComponent;
  let fixture: ComponentFixture<ProductDetailComponent>;
  let productsServiceSpy: jasmine.SpyObj<ProductsService>;
  let messageServiceSpy: jasmine.SpyObj<NzMessageService>;
  let routerSpy: jasmine.SpyObj<Router>;

  const mockProduct = { id: '1', sku: 'SKU1', name: 'Product 1', unitPrice: 10, stock: 100, isActive: true };

  beforeEach(async () => {
    productsServiceSpy = jasmine.createSpyObj('ProductsService', ['getById', 'create', 'update']);
    messageServiceSpy = jasmine.createSpyObj('NzMessageService', ['success', 'error']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [ ProductDetailComponent ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ProductsService, useValue: productsServiceSpy },
        { provide: NzMessageService, useValue: messageServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => 'new' } } } }
      ]
    })
    .compileComponents();
  });

  function createComponent(id: string | null) {
      if (id && id !== 'new') {
        productsServiceSpy.getById.and.returnValue(of(mockProduct as any));
      }
      const route = TestBed.inject(ActivatedRoute);
      spyOn(route.snapshot.paramMap, 'get').and.returnValue(id);
      
      fixture = TestBed.createComponent(ProductDetailComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
  }

  it('should create', () => {
    createComponent('new');
    expect(component).toBeTruthy();
  });

  it('should load product in edit mode', () => {
    createComponent('1');
    expect(productsServiceSpy.getById).toHaveBeenCalledWith('1');
    expect(component.productForm.value.sku).toBe('SKU1');
  });

  it('should save new product', () => {
    createComponent('new');
    productsServiceSpy.create.and.returnValue(of(mockProduct as any));
    component.productForm.patchValue({ sku: 'SKU2', name: 'P2', unitPrice: 10, stock: 100 });
    component.save();
    expect(productsServiceSpy.create).toHaveBeenCalled();

    expect(messageServiceSpy.success).toHaveBeenCalled();
  });
});
