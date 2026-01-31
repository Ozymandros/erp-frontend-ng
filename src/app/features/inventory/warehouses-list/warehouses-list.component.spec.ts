import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { WarehousesListComponent } from './warehouses-list.component';
import { WarehousesService } from '../../../core/services/warehouses.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { FileService } from '../../../core/services/file.service';

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
    warehousesServiceSpy = jasmine.createSpyObj('WarehousesService', ['getAll', 'delete', 'exportToXlsx', 'exportToPdf']);
    messageServiceSpy = jasmine.createSpyObj('NzMessageService', ['success', 'error']);
    warehousesServiceSpy.getAll.and.returnValue(of(mockResponse as any));
    warehousesServiceSpy.delete.and.returnValue(of(void 0));

    await TestBed.configureTestingModule({
      imports: [ WarehousesListComponent ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: WarehousesService, useValue: warehousesServiceSpy },
        { provide: NzMessageService, useValue: messageServiceSpy },
        { 
          provide: NzModalService, 
          useValue: {
            confirm: (options: any) => options.nzOnOk()
          }
        },
        { provide: FileService, useValue: jasmine.createSpyObj('FileService', ['saveFile']) },
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
    warehousesServiceSpy.delete.and.returnValue(of(undefined));
    component.deleteWarehouse('1');
    expect(warehousesServiceSpy.delete).toHaveBeenCalledWith('1');

    expect(messageServiceSpy.success).toHaveBeenCalled();
  });
});
