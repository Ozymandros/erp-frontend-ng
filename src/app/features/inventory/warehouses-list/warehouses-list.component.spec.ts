import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { WarehousesListComponent } from './warehouses-list.component';
import { WarehousesService } from '../../../core/services/warehouses.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

describe('WarehousesListComponent', () => {
  let component: WarehousesListComponent;
  let fixture: ComponentFixture<WarehousesListComponent>;
  let warehousesServiceSpy: jasmine.SpyObj<WarehousesService>;
  let messageServiceSpy: jasmine.SpyObj<NzMessageService>;

  const mockResponse = {
    items: [{ id: '1', name: 'Warehouse 1', location: 'Loc 1', isActive: true }],
    total: 1
  };

  beforeEach(async () => {
    warehousesServiceSpy = jasmine.createSpyObj('WarehousesService', ['getWarehouses', 'deleteWarehouse']);
    messageServiceSpy = jasmine.createSpyObj('NzMessageService', ['success', 'error']);
    warehousesServiceSpy.getWarehouses.and.returnValue(of(mockResponse as any));
    warehousesServiceSpy.deleteWarehouse.and.returnValue(of(void 0));

    await TestBed.configureTestingModule({
      imports: [ WarehousesListComponent, BrowserAnimationsModule, HttpClientTestingModule ],
      providers: [
        { provide: WarehousesService, useValue: warehousesServiceSpy },
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
    warehousesServiceSpy.deleteWarehouse.and.returnValue(of(undefined));
    component.deleteWarehouse('1');
    expect(warehousesServiceSpy.deleteWarehouse).toHaveBeenCalledWith('1');
    expect(messageServiceSpy.success).toHaveBeenCalled();
  });
});
