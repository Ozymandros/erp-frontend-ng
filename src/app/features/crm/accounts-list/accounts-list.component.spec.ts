import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { NzMessageService } from 'ng-zorro-antd/message';
import { AppConfirmDialogService } from '../../../shared/services/app-confirm-dialog.service';
import { AccountsListComponent } from './accounts-list.component';
import { CrmAccountsService } from '../../../core/services/crm-accounts.service';
import { FileService } from '../../../core/services/file.service';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';

describe('AccountsListComponent', () => {
  let component: AccountsListComponent;
  let fixture: ComponentFixture<AccountsListComponent>;

  beforeEach(async () => {
    const accountsServiceSpy = jasmine.createSpyObj('CrmAccountsService', ['getAll']);
    accountsServiceSpy.getAll.and.returnValue(
      of({
        items: [
          {
            id: '1',
            customerId: 'c1',
            name: 'Acme',
            isActive: true,
            lastSyncedAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
          },
        ],
        total: 1,
      } as any),
    );
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getModulePermissions']);
    authServiceSpy.getModulePermissions.and.returnValue(
      of({ canRead: true, canCreate: false, canUpdate: false, canDelete: false, canExport: false }),
    );

    await TestBed.configureTestingModule({
      imports: [AccountsListComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: CrmAccountsService, useValue: accountsServiceSpy },
        { provide: NzMessageService, useValue: jasmine.createSpyObj('NzMessageService', ['success', 'error']) },
        { provide: AppConfirmDialogService, useValue: jasmine.createSpyObj('AppConfirmDialogService', ['deleteConfirm']) },
        { provide: FileService, useValue: jasmine.createSpyObj('FileService', ['saveFile']) },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: ThemeService, useValue: { effectiveTheme: () => 'light' } },
        { provide: ActivatedRoute, useValue: { queryParams: of({}) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AccountsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load accounts', () => {
    expect(component.accounts.length).toBe(1);
  });
});
