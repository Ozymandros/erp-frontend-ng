import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { InventoryTransactionsListComponent } from './inventory-transactions-list.component';
import { InventoryService } from '@/app/core/services/inventory.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

describe('InventoryTransactionsListComponent', () => {
  let component: InventoryTransactionsListComponent;
  let fixture: ComponentFixture<InventoryTransactionsListComponent>;
  let inventoryServiceSpy: jasmine.SpyObj<InventoryService>;
  let messageServiceSpy: jasmine.SpyObj<NzMessageService>;

  const mockResponse = {
    items: [{ transactionType: 'Sale', productName: 'P1', quantity: 5, createdAt: new Date() }],
    total: 1
  };

  beforeEach(async () => {
    inventoryServiceSpy = jasmine.createSpyObj('InventoryService', ['getInventoryTransactions']);
    messageServiceSpy = jasmine.createSpyObj('NzMessageService', ['success', 'error']);
    inventoryServiceSpy.getInventoryTransactions.and.returnValue(of(mockResponse as any));

    await TestBed.configureTestingModule({
      imports: [ InventoryTransactionsListComponent, BrowserAnimationsModule, HttpClientTestingModule ],
      providers: [
        { provide: InventoryService, useValue: inventoryServiceSpy },
        { provide: NzMessageService, useValue: messageServiceSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InventoryTransactionsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load transactions', () => {
    expect(component.transactions.length).toBe(1);
    expect(component.total).toBe(1);
  });
  
  it('should search transactions', () => {
    component.searchTerm = 'query';
    component.onSearch();
    expect(inventoryServiceSpy.getInventoryTransactions).toHaveBeenCalledWith(jasmine.objectContaining({ search: 'query' }));
  });
});
