import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { DashboardComponent } from './dashboard.component';
import { UsersService } from '../../core/services/users.service';
import { ProductsService } from '../../core/services/products.service';
import { WarehousesService } from '../../core/services/warehouses.service';
import { CustomersService } from '../../core/services/customers.service';
import { of } from 'rxjs';
import { PaginatedResponse } from '../../types/api.types';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let usersServiceSpy: jasmine.SpyObj<UsersService>;
  let productsServiceSpy: jasmine.SpyObj<ProductsService>;
  let warehousesServiceSpy: jasmine.SpyObj<WarehousesService>;
  let customersServiceSpy: jasmine.SpyObj<CustomersService>;

  const emptyPaginatedResponse: PaginatedResponse<any> = {
    items: [],
    total: 10,
    page: 1,
    pageSize: 10,
    totalPages: 1,
    hasPreviousPage: false,
    hasNextPage: false
  };

  beforeEach(async () => {
    usersServiceSpy = jasmine.createSpyObj('UsersService', ['getUsers']);
    productsServiceSpy = jasmine.createSpyObj('ProductsService', ['getProducts']);
    warehousesServiceSpy = jasmine.createSpyObj('WarehousesService', ['getWarehouses']);
    customersServiceSpy = jasmine.createSpyObj('CustomersService', ['getCustomers']);

    usersServiceSpy.getUsers.and.returnValue(of({ ...emptyPaginatedResponse, total: 100 }));
    productsServiceSpy.getProducts.and.returnValue(of({ total: 50, items: [] } as any));
    warehousesServiceSpy.getWarehouses.and.returnValue(of({ total: 5, items: [] } as any));
    customersServiceSpy.getCustomers.and.returnValue(of({ total: 200, items: [] } as any));

    await TestBed.configureTestingModule({
      imports: [ DashboardComponent, BrowserAnimationsModule, HttpClientTestingModule ],
      providers: [
        { provide: UsersService, useValue: usersServiceSpy },
        { provide: ProductsService, useValue: productsServiceSpy },
        { provide: WarehousesService, useValue: warehousesServiceSpy },
        { provide: CustomersService, useValue: customersServiceSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load stats on init', () => {
    expect(component.userCount).toBe(100);
    expect(component.productCount).toBe(50);
    expect(component.warehouseCount).toBe(5);
    expect(component.customerCount).toBe(200);
    expect(component.loading).toBeFalse();
  });
});
