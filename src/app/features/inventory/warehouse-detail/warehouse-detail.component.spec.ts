import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { WarehouseDetailComponent } from './warehouse-detail.component';
import { WarehousesService } from '../../../core/services/warehouses.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';

describe('WarehouseDetailComponent', () => {
  let component: WarehouseDetailComponent;
  let fixture: ComponentFixture<WarehouseDetailComponent>;
  let warehousesServiceSpy: jasmine.SpyObj<WarehousesService>;
  let messageServiceSpy: jasmine.SpyObj<NzMessageService>;
  let routerSpy: jasmine.SpyObj<Router>;

  const mockWarehouse = { id: '1', name: 'Warehouse 1', location: 'Loc 1', isActive: true };

  beforeEach(async () => {
    warehousesServiceSpy = jasmine.createSpyObj('WarehousesService', ['getById', 'create', 'update']);
    warehousesServiceSpy.getById.and.returnValue(of(mockWarehouse as any));
    warehousesServiceSpy.create.and.returnValue(of(mockWarehouse as any));
    warehousesServiceSpy.update.and.returnValue(of(mockWarehouse as any));
    messageServiceSpy = jasmine.createSpyObj('NzMessageService', ['success', 'error']);

    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [ WarehouseDetailComponent ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: WarehousesService, useValue: warehousesServiceSpy },
        { provide: NzMessageService, useValue: messageServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => 'new' } } } }
      ]
    })
    .compileComponents();
  });

  function createComponent(id: string | null) {
      if (id && id !== 'new') {
        warehousesServiceSpy.getById.and.returnValue(of(mockWarehouse as any));
      }
      const route = TestBed.inject(ActivatedRoute);
      spyOn(route.snapshot.paramMap, 'get').and.returnValue(id);
      
      fixture = TestBed.createComponent(WarehouseDetailComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
  }

  it('should create', () => {
    createComponent('new');
    expect(component).toBeTruthy();
  });

  it('should load warehouse in edit mode', () => {
    createComponent('1');
    expect(warehousesServiceSpy.getById).toHaveBeenCalledWith('1');
    expect(component.warehouseForm.value.name).toBe('Warehouse 1');
  });

  it('should save new warehouse', () => {
    createComponent('new');
    warehousesServiceSpy.create.and.returnValue(of(mockWarehouse as any));
    component.warehouseForm.patchValue({ name: 'New W' });
    component.save();
    expect(warehousesServiceSpy.create).toHaveBeenCalled();
    expect(messageServiceSpy.success).toHaveBeenCalled();
  });

  it('should update existing warehouse', () => {
    createComponent('1');
    warehousesServiceSpy.update.and.returnValue(of(mockWarehouse as any));
    component.warehouseForm.patchValue({ name: 'Updated Warehouse' });
    component.save();
    expect(warehousesServiceSpy.update).toHaveBeenCalledWith('1', jasmine.any(Object));
    expect(messageServiceSpy.success).toHaveBeenCalled();
  });

  it('should handle load warehouse error', () => {
    createComponent('1');
    warehousesServiceSpy.getById.and.returnValue(throwError(() => ({ message: 'Load error' })));
    component.loadWarehouse('1');
    expect(messageServiceSpy.error).toHaveBeenCalledWith(jasmine.stringContaining('Failed to load warehouse'));
  });

  it('should handle create warehouse error', () => {
    createComponent('new');
    warehousesServiceSpy.create.and.returnValue(throwError(() => ({ message: 'Create error' })));
    component.warehouseForm.patchValue({ name: 'Test' });
    component.save();
    expect(messageServiceSpy.error).toHaveBeenCalledWith(jasmine.stringContaining('Operation failed'));
  });

  it('should handle update warehouse error', () => {
    createComponent('1');
    warehousesServiceSpy.update.and.returnValue(throwError(() => ({ message: 'Update error' })));
    component.warehouseForm.patchValue({ name: 'Updated' });
    component.save();
    expect(messageServiceSpy.error).toHaveBeenCalledWith(jasmine.stringContaining('Operation failed'));
  });

  it('should not save invalid form', () => {
    createComponent('new');
    component.warehouseForm.patchValue({ name: '' });
    component.save();
    expect(warehousesServiceSpy.create).not.toHaveBeenCalled();
  });
});
