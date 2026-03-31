import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { WarehousesListComponent } from './warehouses-list.component';
import { WarehousesService } from '../../../core/services/warehouses.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { AppConfirmDialogService } from '../../../shared/services/app-confirm-dialog.service';
import { FileService } from '../../../core/services/file.service';

import { of } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

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
    const authSpy = jasmine.createSpyObj('AuthService', ['getModulePermissions']);
    authSpy.getModulePermissions.and.returnValue(
      of({ canRead: true, canCreate: false, canUpdate: false, canDelete: true, canExport: false }),
    );

    await TestBed.configureTestingModule({
      imports: [ WarehousesListComponent ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: WarehousesService, useValue: warehousesServiceSpy },
        { provide: NzMessageService, useValue: messageServiceSpy },
        {
          provide: AppConfirmDialogService,
          useValue: {
            deleteConfirm: (options: { nzOnOk?: () => void }) => options.nzOnOk?.(),
          },
        },
        { provide: FileService, useValue: jasmine.createSpyObj('FileService', ['saveFile']) },
        { provide: AuthService, useValue: authSpy },
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
    expect(component.data.length).toBe(1);
    expect(component.total).toBe(1);
  });

  it('should delete warehouse', () => {
    warehousesServiceSpy.delete.and.returnValue(of(undefined));
    component.deleteWarehouse('1');
    expect(warehousesServiceSpy.delete).toHaveBeenCalledWith('1');

    expect(messageServiceSpy.success).toHaveBeenCalled();
  });
});
