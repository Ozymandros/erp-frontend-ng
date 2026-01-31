import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { SuppliersListComponent } from './suppliers-list.component';
import { SuppliersService } from '../../../core/services/suppliers.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { of } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

describe('SuppliersListComponent', () => {
  let component: SuppliersListComponent;
  let fixture: ComponentFixture<SuppliersListComponent>;
  let suppliersServiceSpy: jasmine.SpyObj<SuppliersService>;
  let messageServiceSpy: jasmine.SpyObj<NzMessageService>;
  let modalServiceSpy: jasmine.SpyObj<NzModalService>;

  const mockResponse = {
    items: [{ id: '1', name: 'Supplier 1', email: 's@s.com', isActive: true }],
    total: 1
  };

  beforeEach(async () => {
    suppliersServiceSpy = jasmine.createSpyObj('SuppliersService', ['getAll', 'delete', 'exportToXlsx', 'exportToPdf']);
    messageServiceSpy = jasmine.createSpyObj('NzMessageService', ['success', 'error']);
    modalServiceSpy = jasmine.createSpyObj('NzModalService', ['confirm', 'create', 'info', 'success', 'error', 'warning', 'open']);

    suppliersServiceSpy.getAll.and.returnValue(of(mockResponse as any));

    await TestBed.configureTestingModule({
      imports: [ SuppliersListComponent ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: SuppliersService, useValue: suppliersServiceSpy },
        { provide: NzMessageService, useValue: messageServiceSpy },
        { provide: NzModalService, useValue: modalServiceSpy },
        { provide: ActivatedRoute, useValue: {} }
      ]
    })
    .overrideComponent(SuppliersListComponent, {
      set: {
        providers: [
          { provide: NzModalService, useValue: modalServiceSpy }
        ]
      }
    })
    .compileComponents();

    fixture = TestBed.createComponent(SuppliersListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load suppliers', () => {
    expect(component.suppliers.length).toBe(1);
    expect(component.total).toBe(1);
  });

  it('should delete supplier', () => {
    modalServiceSpy.confirm.and.callFake((options: any) => {
      options.nzOnOk();
      return undefined as any;
    });
    suppliersServiceSpy.delete.and.returnValue(of(void 0));
    
    component.deleteSupplier({ id: '1', name: 'Supplier 1' } as any);
    
    expect(suppliersServiceSpy.delete).toHaveBeenCalledWith('1');
    expect(messageServiceSpy.success).toHaveBeenCalled();
  });
});
