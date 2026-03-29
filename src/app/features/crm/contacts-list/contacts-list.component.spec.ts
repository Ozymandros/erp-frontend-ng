import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
import { NzMessageService } from 'ng-zorro-antd/message';
import { AppConfirmDialogService } from '../../../shared/services/app-confirm-dialog.service';
import { ContactsListComponent } from './contacts-list.component';
import { CrmContactsService } from '../../../core/services/crm-contacts.service';
import { FileService } from '../../../core/services/file.service';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';

describe('ContactsListComponent', () => {
  let component: ContactsListComponent;
  let fixture: ComponentFixture<ContactsListComponent>;

  beforeEach(async () => {
    const contactsServiceSpy = jasmine.createSpyObj('CrmContactsService', ['getAll', 'delete']);
    contactsServiceSpy.getAll.and.returnValue(
      of({
        items: [
          {
            id: '1',
            accountId: 'a1',
            fullName: 'Jane',
            isPrimary: false,
            isActive: true,
            createdAt: new Date().toISOString(),
          },
        ],
        total: 1,
      } as any),
    );
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getModulePermissions']);
    authServiceSpy.getModulePermissions.and.returnValue(
      of({ canRead: true, canCreate: true, canUpdate: true, canDelete: true, canExport: false }),
    );

    await TestBed.configureTestingModule({
      imports: [ContactsListComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: CrmContactsService, useValue: contactsServiceSpy },
        { provide: NzMessageService, useValue: jasmine.createSpyObj('NzMessageService', ['success', 'error']) },
        { provide: AppConfirmDialogService, useValue: jasmine.createSpyObj('AppConfirmDialogService', ['deleteConfirm']) },
        { provide: FileService, useValue: jasmine.createSpyObj('FileService', ['saveFile']) },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: ThemeService, useValue: { effectiveTheme: () => 'light' } },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { queryParamMap: convertToParamMap({}) },
            queryParams: of({}),
            queryParamMap: of(convertToParamMap({})),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ContactsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load contacts', () => {
    expect(component.contacts.length).toBe(1);
  });
});
