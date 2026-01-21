import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { DashboardComponent } from './dashboard.component';
import { UsersService } from '@/app/core/services/users.service';
import { InventoryService } from '@/app/core/services/inventory.service';
import { SalesService } from '@/app/core/services/sales.service';
import { of } from 'rxjs';
import { PaginatedResponse } from '@/app/types/api.types';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let usersServiceSpy: jasmine.SpyObj<UsersService>;
  let inventoryServiceSpy: jasmine.SpyObj<InventoryService>;
  let salesServiceSpy: jasmine.SpyObj<SalesService>;

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
    inventoryServiceSpy = jasmine.createSpyObj('InventoryService', ['getProducts', 'getWarehouses']);
    salesServiceSpy = jasmine.createSpyObj('SalesService', ['getCustomers']);

    usersServiceSpy.getUsers.and.returnValue(of({ ...emptyPaginatedResponse, total: 100 }));
    inventoryServiceSpy.getProducts.and.returnValue(of({ ...emptyPaginatedResponse, total: 50 }));
    inventoryServiceSpy.getWarehouses.and.returnValue(of({ ...emptyPaginatedResponse, total: 5 }));
    salesServiceSpy.getCustomers.and.returnValue(of({ ...emptyPaginatedResponse, total: 200 }));

    await TestBed.configureTestingModule({
      imports: [ DashboardComponent, BrowserAnimationsModule, HttpClientTestingModule ],
      providers: [
        { provide: UsersService, useValue: usersServiceSpy },
        { provide: InventoryService, useValue: inventoryServiceSpy },
        { provide: SalesService, useValue: salesServiceSpy }
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
