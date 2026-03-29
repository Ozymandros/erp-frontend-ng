import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { NzMessageService } from 'ng-zorro-antd/message';
import { AppConfirmDialogService } from '../../../shared/services/app-confirm-dialog.service';
import { LeadsListComponent } from './leads-list.component';
import { CrmLeadsService } from '../../../core/services/crm-leads.service';
import { FileService } from '../../../core/services/file.service';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';

describe('LeadsListComponent', () => {
  let component: LeadsListComponent;
  let fixture: ComponentFixture<LeadsListComponent>;
  let leadsServiceSpy: jasmine.SpyObj<CrmLeadsService>;
  let messageServiceSpy: jasmine.SpyObj<NzMessageService>;
  let confirmDialogSpy: jasmine.SpyObj<AppConfirmDialogService>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  const mockResponse = {
    items: [{ id: '1', title: 'L1', status: 'New', ownerUsername: 'u' }],
    total: 1,
  };

  beforeEach(async () => {
    leadsServiceSpy = jasmine.createSpyObj('CrmLeadsService', ['getAll', 'delete']);
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
    authServiceSpy = jasmine.createSpyObj('AuthService', ['getModulePermissions']);
    authServiceSpy.getModulePermissions.and.returnValue(
      of({ canRead: true, canCreate: true, canUpdate: true, canDelete: true, canExport: false }),
    );
    leadsServiceSpy.getAll.and.returnValue(of(mockResponse as any));

    await TestBed.configureTestingModule({
      imports: [LeadsListComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: CrmLeadsService, useValue: leadsServiceSpy },
        { provide: NzMessageService, useValue: messageServiceSpy },
        { provide: AppConfirmDialogService, useValue: confirmDialogSpy },
        { provide: FileService, useValue: jasmine.createSpyObj('FileService', ['saveFile']) },
        { provide: AuthService, useValue: authServiceSpy },
        {
          provide: ThemeService,
          useValue: { effectiveTheme: () => 'light' },
        },
        { provide: ActivatedRoute, useValue: { queryParams: of({}) } },
      ],
    })
      .overrideComponent(LeadsListComponent, {
        set: {
          providers: [{ provide: AppConfirmDialogService, useValue: confirmDialogSpy }],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(LeadsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load leads', () => {
    expect(component.leads.length).toBe(1);
    expect(component.total).toBe(1);
  });

  it('should delete lead when confirmed', () => {
    confirmDialogSpy.deleteConfirm.and.callFake((options: { nzOnOk?: () => void }) => {
      options.nzOnOk?.();
      return undefined as any;
    });
    leadsServiceSpy.delete.and.returnValue(of(void 0));
    component.deleteLead({ id: '1', title: 'L1' } as any);
    expect(leadsServiceSpy.delete).toHaveBeenCalledWith('1');
    expect(messageServiceSpy.success).toHaveBeenCalled();
  });

  it('should show error when load fails', (done) => {
    spyOn(console, 'error');
    leadsServiceSpy.getAll.and.returnValue(throwError(() => new Error('err')));
    const f = TestBed.createComponent(LeadsListComponent);
    f.detectChanges();
    setTimeout(() => {
      expect(messageServiceSpy.error).toHaveBeenCalledWith('Failed to load data');
      done();
    }, 50);
  });
});
