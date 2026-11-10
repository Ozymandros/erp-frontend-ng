import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ProjectsListComponent } from './projects-list.component';
import { ProjectsService } from '../../../core/services/projects.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { AppConfirmDialogService } from '../../../shared/services/app-confirm-dialog.service';
import { FileService } from '../../../core/services/file.service';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';
import { ActivatedRoute } from '@angular/router';

describe('ProjectsListComponent', () => {
  let component: ProjectsListComponent;
  let fixture: ComponentFixture<ProjectsListComponent>;

  beforeEach(async () => {
    const projectsSpy = jasmine.createSpyObj('ProjectsService', ['getAll', 'delete', 'exportToXlsx', 'exportToPdf']);
    projectsSpy.getAll.and.returnValue(of({ items: [], total: 0, page: 1, pageSize: 10, totalPages: 0, hasPreviousPage: false, hasNextPage: false }));

    await TestBed.configureTestingModule({
      imports: [ProjectsListComponent],
      providers: [
        { provide: ProjectsService, useValue: projectsSpy },
        { provide: NzMessageService, useValue: jasmine.createSpyObj('NzMessageService', ['success', 'error']) },
        { provide: AppConfirmDialogService, useValue: jasmine.createSpyObj('AppConfirmDialogService', ['deleteConfirm']) },
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
                canExecute: true,
              }),
          },
        },
        { provide: ThemeService, useValue: { effectiveTheme: () => 'light' } },
        { provide: ActivatedRoute, useValue: { queryParams: of({}) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and load projects', () => {
    expect(component).toBeTruthy();
    expect(component.projects).toEqual([]);
  });
});
