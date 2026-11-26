import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ResourcesListComponent } from './resources-list.component';
import { ProjectResourcesService } from '../../../core/services/project-resources.service';
import { AppConfirmDialogService } from '../../../shared/services/app-confirm-dialog.service';
import { FileService } from '../../../core/services/file.service';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';

describe('ResourcesListComponent', () => {
  let component: ResourcesListComponent;
  let fixture: ComponentFixture<ResourcesListComponent>;
  let resourcesSpy: jasmine.SpyObj<ProjectResourcesService>;
  let confirmSpy: jasmine.SpyObj<AppConfirmDialogService>;

  beforeEach(async () => {
    resourcesSpy = jasmine.createSpyObj('ProjectResourcesService', [
      'getAll',
      'delete',
      'exportToXlsx',
      'exportToPdf',
    ]);
    confirmSpy = jasmine.createSpyObj('AppConfirmDialogService', [
      'deleteConfirm',
      'confirm',
      'create',
      'info',
      'success',
      'error',
      'warning',
    ]);
    resourcesSpy.getAll.and.returnValue(
      of({
        items: [{ id: '1', resourceNo: 'R1', name: 'Dev', baseUnitOfMeasure: 'HOUR' }],
        total: 1,
        page: 1,
        pageSize: 10,
        totalPages: 1,
        hasPreviousPage: false,
        hasNextPage: false,
      }),
    );

    await TestBed.configureTestingModule({
      imports: [ResourcesListComponent],
      providers: [
        provideHttpClient(withXhr()),
        provideHttpClientTesting(),
        { provide: ProjectResourcesService, useValue: resourcesSpy },
        { provide: NzMessageService, useValue: jasmine.createSpyObj('NzMessageService', ['success', 'error']) },
        { provide: AppConfirmDialogService, useValue: confirmSpy },
        { provide: FileService, useValue: jasmine.createSpyObj('FileService', ['saveFile']) },
        {
          provide: AuthService,
          useValue: {
            getModulePermissions: () =>
              of({
                canRead: true,
                canCreate: true,
                canUpdate: true,
                canDelete: true,
                canExport: true,
                canExecute: false,
              }),
          },
        },
        { provide: ThemeService, useValue: { effectiveTheme: () => 'light' } },
        { provide: ActivatedRoute, useValue: { queryParams: of({}) } },
      ],
    })
      .overrideComponent(ResourcesListComponent, {
        set: { providers: [{ provide: AppConfirmDialogService, useValue: confirmSpy }] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(ResourcesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should load resources', () => {
    expect(component.resources.length).toBe(1);
    expect(component.total).toBe(1);
  });

  it('should delete via confirm', () => {
    component.deleteResource({
      id: '1',
      resourceNo: 'R1',
      name: 'Dev',
      baseUnitOfMeasure: 'HOUR',
    });
    expect(confirmSpy.deleteConfirm).toHaveBeenCalled();
  });
});
