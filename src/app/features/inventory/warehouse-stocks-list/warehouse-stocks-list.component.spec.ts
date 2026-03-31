import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { WarehouseStocksListComponent } from './warehouse-stocks-list.component';
import { WarehouseStocksService } from '../../../core/services/warehouse-stocks.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { of } from 'rxjs';
import { FileService } from '../../../core/services/file.service';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';
import { AppConfirmDialogService } from '../../../shared/services/app-confirm-dialog.service';

describe('WarehouseStocksListComponent', () => {
  let component: WarehouseStocksListComponent;
  let fixture: ComponentFixture<WarehouseStocksListComponent>;
  let warehouseStocksServiceSpy: jasmine.SpyObj<WarehouseStocksService>;
  let messageServiceSpy: jasmine.SpyObj<NzMessageService>;
  let fileServiceSpy: jasmine.SpyObj<FileService>;
  let confirmDialogSpy: jasmine.SpyObj<AppConfirmDialogService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let activatedRouteSpy: any;

  const mockResponse = {
    items: [{ warehouseName: 'W1', productName: 'P1', quantity: 10, reorderLevel: 5 }],
    total: 1
  };

  beforeEach(async () => {
    messageServiceSpy = jasmine.createSpyObj('NzMessageService', ['success', 'error']);
    warehouseStocksServiceSpy = jasmine.createSpyObj('WarehouseStocksService', ['getAll']);
    fileServiceSpy = jasmine.createSpyObj('FileService', ['saveFile']);
    confirmDialogSpy = jasmine.createSpyObj('AppConfirmDialogService', ['deleteConfirm']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    activatedRouteSpy = { queryParams: of({}) };

    warehouseStocksServiceSpy.getAll.and.returnValue(of(mockResponse as any));
    const authSpy = jasmine.createSpyObj('AuthService', ['getModulePermissions']);
    authSpy.getModulePermissions.and.returnValue(
      of({ canRead: true, canCreate: false, canUpdate: false, canDelete: true, canExport: false }),
    );

    await TestBed.configureTestingModule({
      imports: [ WarehouseStocksListComponent ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: WarehouseStocksService, useValue: warehouseStocksServiceSpy },
        { provide: NzMessageService, useValue: messageServiceSpy },
        { provide: FileService, useValue: fileServiceSpy },
        { provide: AppConfirmDialogService, useValue: confirmDialogSpy },
        { provide: AuthService, useValue: authSpy },
        { provide: ThemeService, useValue: { effectiveTheme: () => 'light' } },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy }
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
    expect(component.data.length).toBe(1);
    expect(component.total).toBe(1);
  });
  
  it('should search stocks', fakeAsync(() => {
    component.searchTerm = 'query';
    component.onSearch();
    tick(300);
    expect(warehouseStocksServiceSpy.getAll).toHaveBeenCalledWith(jasmine.objectContaining({ SearchTerm: 'query' }));
  }));
});
