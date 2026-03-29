import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { RolesListComponent } from './roles-list.component';
import { RolesService } from '../../../core/services/roles.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { AppConfirmDialogService } from '../../../shared/services/app-confirm-dialog.service';
import { FileService } from '../../../core/services/file.service';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';

describe('RolesListComponent', () => {
  let component: RolesListComponent;
  let fixture: ComponentFixture<RolesListComponent>;
  let rolesServiceSpy: jasmine.SpyObj<RolesService>;
  let messageServiceSpy: jasmine.SpyObj<NzMessageService>;
  let confirmDialogSpy: jasmine.SpyObj<AppConfirmDialogService>;
  let fileServiceSpy: jasmine.SpyObj<FileService>;

  const mockResponse = {
    items: [{ id: '1', name: 'Admin', description: 'Desc', permissions: [], createdAt: new Date() }],
    total: 1
  };

  beforeEach(async () => {
    rolesServiceSpy = jasmine.createSpyObj('RolesService', ['getAll', 'delete', 'exportToXlsx', 'exportToPdf']);
    messageServiceSpy = jasmine.createSpyObj('NzMessageService', ['success', 'error']);
    confirmDialogSpy = jasmine.createSpyObj('AppConfirmDialogService', ['deleteConfirm']);
    fileServiceSpy = jasmine.createSpyObj('FileService', ['saveFile']);

    rolesServiceSpy.getAll.and.returnValue(of(mockResponse as any));
    const authSpy = jasmine.createSpyObj('AuthService', ['getModulePermissions']);
    authSpy.getModulePermissions.and.returnValue(
      of({ canRead: true, canCreate: false, canUpdate: false, canDelete: true, canExport: true }),
    );

    await TestBed.configureTestingModule({
      imports: [ RolesListComponent ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: RolesService, useValue: rolesServiceSpy },
        { provide: NzMessageService, useValue: messageServiceSpy },
        { provide: AppConfirmDialogService, useValue: confirmDialogSpy },
        { provide: FileService, useValue: fileServiceSpy },
        { provide: AuthService, useValue: authSpy },
        { provide: ThemeService, useValue: { effectiveTheme: () => 'light' } },
        { provide: ActivatedRoute, useValue: {} }
      ]
    })
    .overrideComponent(RolesListComponent, {
      set: {
        providers: [
          { provide: AppConfirmDialogService, useValue: confirmDialogSpy }
        ]
      }
    })
    .compileComponents();

    fixture = TestBed.createComponent(RolesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load roles', () => {
    expect(component.roles.length).toBe(1);
    expect(component.total).toBe(1);
  });

  it('should delete role', () => {
    confirmDialogSpy.deleteConfirm.and.callFake((options: any) => {
      options.nzOnOk();
      return undefined as any;
    });
    rolesServiceSpy.delete.and.returnValue(of(undefined));
    component.deleteRole('1');
    expect(rolesServiceSpy.delete).toHaveBeenCalledWith('1');
    expect(messageServiceSpy.success).toHaveBeenCalled();
  });
});

