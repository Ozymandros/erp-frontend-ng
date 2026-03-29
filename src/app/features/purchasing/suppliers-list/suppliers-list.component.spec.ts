import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { SuppliersListComponent } from './suppliers-list.component';
import { SuppliersService } from '../../../core/services/suppliers.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { AppConfirmDialogService } from '../../../shared/services/app-confirm-dialog.service';
import { FileService } from '../../../core/services/file.service';
import { of } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

describe('SuppliersListComponent', () => {
  let component: SuppliersListComponent;
  let fixture: ComponentFixture<SuppliersListComponent>;
  let suppliersServiceSpy: jasmine.SpyObj<SuppliersService>;
  let messageServiceSpy: jasmine.SpyObj<NzMessageService>;
  let confirmDialogSpy: jasmine.SpyObj<AppConfirmDialogService>;

  const mockResponse = {
    items: [{ id: '1', name: 'Supplier 1', email: 's@s.com', isActive: true }],
    total: 1
  };

  beforeEach(async () => {
    const authSpy = jasmine.createSpyObj('AuthService', ['getModulePermissions']);
    authSpy.getModulePermissions.and.returnValue(
      of({ canRead: true, canCreate: false, canUpdate: false, canDelete: true, canExport: false }),
    );
    suppliersServiceSpy = jasmine.createSpyObj('SuppliersService', ['getAll', 'delete', 'exportToXlsx', 'exportToPdf']);
    messageServiceSpy = jasmine.createSpyObj('NzMessageService', ['success', 'error']);
    confirmDialogSpy = jasmine.createSpyObj('AppConfirmDialogService', [
      'deleteConfirm',
      'confirm',
      'create',
      'info',
      'success',
      'error',
      'warning',
    ]);

    suppliersServiceSpy.getAll.and.returnValue(of(mockResponse as any));

    await TestBed.configureTestingModule({
      imports: [ SuppliersListComponent ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: SuppliersService, useValue: suppliersServiceSpy },
        { provide: NzMessageService, useValue: messageServiceSpy },
        { provide: AppConfirmDialogService, useValue: confirmDialogSpy },
        { provide: FileService, useValue: jasmine.createSpyObj('FileService', ['saveFile']) },
        { provide: AuthService, useValue: authSpy },
        { provide: ActivatedRoute, useValue: {} }
      ]
    })
    .overrideComponent(SuppliersListComponent, {
      set: {
        providers: [
          { provide: AppConfirmDialogService, useValue: confirmDialogSpy }
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
    expect(component.data.length).toBe(1);
    expect(component.total).toBe(1);
  });

  it('should delete supplier', () => {
    confirmDialogSpy.deleteConfirm.and.callFake((options: any) => {
      options.nzOnOk();
      return undefined as any;
    });
    suppliersServiceSpy.delete.and.returnValue(of(void 0));
    
    component.deleteSupplier({ id: '1', name: 'Supplier 1' } as any);
    
    expect(suppliersServiceSpy.delete).toHaveBeenCalledWith('1');
    expect(messageServiceSpy.success).toHaveBeenCalled();
  });
});
