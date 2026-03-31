import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { NzMessageService } from 'ng-zorro-antd/message';
import { AppConfirmDialogService } from '../../../shared/services/app-confirm-dialog.service';
import { ActivitiesListComponent } from './activities-list.component';
import { CrmActivitiesService } from '../../../core/services/crm-activities.service';
import { FileService } from '../../../core/services/file.service';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';

describe('ActivitiesListComponent', () => {
  let component: ActivitiesListComponent;
  let fixture: ComponentFixture<ActivitiesListComponent>;
  let activitiesServiceSpy: jasmine.SpyObj<CrmActivitiesService>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    activitiesServiceSpy = jasmine.createSpyObj('CrmActivitiesService', ['getAll']);
    authServiceSpy = jasmine.createSpyObj('AuthService', ['getModulePermissions']);
    authServiceSpy.getModulePermissions.and.returnValue(
      of({ canRead: true, canCreate: true, canUpdate: true, canDelete: true, canExport: false }),
    );
    activitiesServiceSpy.getAll.and.returnValue(
      of({ items: [{ id: '1', subject: 'Call', type: 'Call', status: 'Open', dueAt: new Date().toISOString(), assignedToUsername: 'u' }], total: 1 } as any),
    );

    await TestBed.configureTestingModule({
      imports: [ActivitiesListComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: CrmActivitiesService, useValue: activitiesServiceSpy },
        { provide: NzMessageService, useValue: jasmine.createSpyObj('NzMessageService', ['success', 'error']) },
        { provide: AppConfirmDialogService, useValue: jasmine.createSpyObj('AppConfirmDialogService', ['deleteConfirm']) },
        { provide: FileService, useValue: jasmine.createSpyObj('FileService', ['saveFile']) },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: ThemeService, useValue: { effectiveTheme: () => 'light' } },
        { provide: ActivatedRoute, useValue: { queryParams: of({}) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ActivitiesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load activities', () => {
    expect(component.activities.length).toBe(1);
  });
});
