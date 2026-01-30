import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { WarehouseStocksListComponent } from './warehouse-stocks-list.component';
import { WarehouseStocksService } from '../../../core/services/warehouse-stocks.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { FileService } from '../../../core/services/file.service';
import { NzModalService } from 'ng-zorro-antd/modal';

describe('WarehouseStocksListComponent', () => {
  let component: WarehouseStocksListComponent;
  let fixture: ComponentFixture<WarehouseStocksListComponent>;
  let warehouseStocksServiceSpy: jasmine.SpyObj<WarehouseStocksService>;
  let messageServiceSpy: jasmine.SpyObj<NzMessageService>;
  let fileServiceSpy: jasmine.SpyObj<FileService>;
  let modalServiceSpy: jasmine.SpyObj<NzModalService>;

  const mockResponse = {
    items: [{ warehouseName: 'W1', productName: 'P1', quantity: 10, reorderLevel: 5 }],
    total: 1
  };

  beforeEach(async () => {
    messageServiceSpy = jasmine.createSpyObj('NzMessageService', ['success', 'error']);
    warehouseStocksServiceSpy = jasmine.createSpyObj('WarehouseStocksService', ['getAll']);
    fileServiceSpy = jasmine.createSpyObj('FileService', ['saveFile']);
    modalServiceSpy = jasmine.createSpyObj('NzModalService', ['confirm']);

    warehouseStocksServiceSpy.getAll.and.returnValue(of(mockResponse as any));

    await TestBed.configureTestingModule({
      imports: [ WarehouseStocksListComponent, BrowserAnimationsModule, HttpClientTestingModule ],
      providers: [
        { provide: WarehouseStocksService, useValue: warehouseStocksServiceSpy },
        { provide: NzMessageService, useValue: messageServiceSpy },
        { provide: FileService, useValue: fileServiceSpy },
        { provide: NzModalService, useValue: modalServiceSpy }
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
