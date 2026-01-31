import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { InventoryTransactionsListComponent } from './inventory-transactions-list.component';
import { NzMessageService } from 'ng-zorro-antd/message';
import { of } from 'rxjs';
import { InventoryTransactionsService } from '../../../core/services/inventory-transactions.service';
import { FileService } from '../../../core/services/file.service';
import { NzModalService } from 'ng-zorro-antd/modal';

describe('InventoryTransactionsListComponent', () => {
  let component: InventoryTransactionsListComponent;
  let fixture: ComponentFixture<InventoryTransactionsListComponent>;
  let inventoryTransactionsServiceSpy: jasmine.SpyObj<InventoryTransactionsService>;
  let messageServiceSpy: jasmine.SpyObj<NzMessageService>;
  let fileServiceSpy: jasmine.SpyObj<FileService>;
  let modalServiceSpy: jasmine.SpyObj<NzModalService>;

  const mockResponse = {
    items: [{ transactionType: 'Sale', productName: 'P1', quantity: 5, createdAt: new Date() }],
    total: 1
  };

  beforeEach(async () => {
    inventoryTransactionsServiceSpy = jasmine.createSpyObj('InventoryTransactionsService', ['getAll']);
    messageServiceSpy = jasmine.createSpyObj('NzMessageService', ['success', 'error']);
    fileServiceSpy = jasmine.createSpyObj('FileService', ['saveFile']);
    modalServiceSpy = jasmine.createSpyObj('NzModalService', ['confirm']);

    inventoryTransactionsServiceSpy.getAll.and.returnValue(of(mockResponse as any));

    await TestBed.configureTestingModule({
      imports: [ InventoryTransactionsListComponent ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: InventoryTransactionsService, useValue: inventoryTransactionsServiceSpy },
        { provide: NzMessageService, useValue: messageServiceSpy },
        { provide: FileService, useValue: fileServiceSpy },
        { provide: NzModalService, useValue: modalServiceSpy }
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
    expect(component.data.length).toBe(1);
    expect(component.total).toBe(1);
  });
  
  it('should search transactions', () => {
    component.searchTerm = 'query';
    component.onSearch();
    expect(inventoryTransactionsServiceSpy.getAll).toHaveBeenCalled();
  });
});
