import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { WarehouseStocksListComponent } from './warehouse-stocks-list.component';
import { InventoryService } from '@/app/core/services/inventory.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

describe('WarehouseStocksListComponent', () => {
  let component: WarehouseStocksListComponent;
  let fixture: ComponentFixture<WarehouseStocksListComponent>;
  let inventoryServiceSpy: jasmine.SpyObj<InventoryService>;
  let messageServiceSpy: jasmine.SpyObj<NzMessageService>;

  const mockResponse = {
    items: [{ warehouseName: 'W1', productName: 'P1', quantity: 10, reorderLevel: 5 }],
    total: 1
  };

  beforeEach(async () => {
    inventoryServiceSpy = jasmine.createSpyObj('InventoryService', ['getWarehouseStocks']);
    messageServiceSpy = jasmine.createSpyObj('NzMessageService', ['success', 'error']);
    inventoryServiceSpy.getWarehouseStocks.and.returnValue(of(mockResponse as any));

    await TestBed.configureTestingModule({
      imports: [ WarehouseStocksListComponent, BrowserAnimationsModule, HttpClientTestingModule ],
      providers: [
        { provide: InventoryService, useValue: inventoryServiceSpy },
        { provide: NzMessageService, useValue: messageServiceSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WarehouseStocksListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load stocks', () => {
    expect(component.stocks.length).toBe(1);
    expect(component.total).toBe(1);
  });
  
  it('should search stocks', () => {
    component.searchTerm = 'query';
    component.onSearch();
    expect(inventoryServiceSpy.getWarehouseStocks).toHaveBeenCalledWith(jasmine.objectContaining({ search: 'query' }));
  });
});
