import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { WarehousesListComponent } from './warehouses-list.component';
import { InventoryService } from '@/app/core/services/inventory.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

describe('WarehousesListComponent', () => {
  let component: WarehousesListComponent;
  let fixture: ComponentFixture<WarehousesListComponent>;
  let inventoryServiceSpy: jasmine.SpyObj<InventoryService>;
  let messageServiceSpy: jasmine.SpyObj<NzMessageService>;

  const mockResponse = {
    items: [{ id: '1', name: 'Warehouse 1', location: 'Loc 1', isActive: true }],
    total: 1
  };

  beforeEach(async () => {
    inventoryServiceSpy = jasmine.createSpyObj('InventoryService', ['getWarehouses', 'deleteWarehouse']);
    messageServiceSpy = jasmine.createSpyObj('NzMessageService', ['success', 'error']);
    inventoryServiceSpy.getWarehouses.and.returnValue(of(mockResponse as any));

    await TestBed.configureTestingModule({
      imports: [ WarehousesListComponent, BrowserAnimationsModule, HttpClientTestingModule ],
      providers: [
        { provide: InventoryService, useValue: inventoryServiceSpy },
        { provide: NzMessageService, useValue: messageServiceSpy },
        { provide: ActivatedRoute, useValue: {} }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WarehousesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load warehouses', () => {
    expect(component.warehouses.length).toBe(1);
    expect(component.total).toBe(1);
  });

  it('should delete warehouse', () => {
    inventoryServiceSpy.deleteWarehouse.and.returnValue(of(undefined));
    component.deleteWarehouse('1');
    expect(inventoryServiceSpy.deleteWarehouse).toHaveBeenCalledWith('1');
    expect(messageServiceSpy.success).toHaveBeenCalled();
  });
});
