import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ProjectPlanningPanelComponent } from './project-planning-panel.component';
import { ProjectPlanningLinesService } from '../../../../core/services/project-planning-lines.service';
import { ProjectTasksService } from '../../../../core/services/project-tasks.service';
import { FileService } from '../../../../core/services/file.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ThemeService } from '../../../../core/services/theme.service';

describe('ProjectPlanningPanelComponent', () => {
  let component: ProjectPlanningPanelComponent;
  let fixture: ComponentFixture<ProjectPlanningPanelComponent>;
  let planningSpy: jasmine.SpyObj<ProjectPlanningLinesService>;
  let fileSpy: jasmine.SpyObj<FileService>;

  const line = {
    id: 'l1',
    projectId: 'p1',
    projectTaskId: 't1',
    lineNo: 1,
    description: 'Line',
    quantity: 1,
    kind: 'Resource',
    lineType: 'Budget and billable',
  };

  beforeEach(async () => {
    planningSpy = jasmine.createSpyObj('ProjectPlanningLinesService', [
      'list',
      'create',
      'update',
      'delete',
      'exportToXlsx',
    ]);
    fileSpy = jasmine.createSpyObj('FileService', ['saveFile']);
    planningSpy.list.and.returnValue(of([line]));

    await TestBed.configureTestingModule({
      imports: [ProjectPlanningPanelComponent],
      providers: [
        { provide: ProjectPlanningLinesService, useValue: planningSpy },
        {
          provide: ProjectTasksService,
          useValue: { list: () => of([{ id: 't1', taskNo: '10', description: 'T', projectId: 'p1' }]) },
        },
        { provide: FileService, useValue: fileSpy },
        { provide: NzMessageService, useValue: jasmine.createSpyObj('NzMessageService', ['success', 'error']) },
        { provide: ThemeService, useValue: { effectiveTheme: () => 'light' } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectPlanningPanelComponent);
    component = fixture.componentInstance;
    component.projectId = 'p1';
    component.permissions = {
      canRead: true,
      canCreate: true,
      canUpdate: true,
      canDelete: true,
      canExport: true,
      canExecute: false,
    };
    component.ngOnChanges({
      projectId: {
        currentValue: 'p1',
        previousValue: undefined,
        firstChange: true,
        isFirstChange: () => true,
      },
    });
    fixture.detectChanges();
  });

  it('should load lines', () => {
    expect(component.lines.length).toBe(1);
  });

  it('should create update delete and export', () => {
    planningSpy.create.and.returnValue(of(line));
    planningSpy.update.and.returnValue(of(line));
    planningSpy.delete.and.returnValue(of(void 0));
    planningSpy.exportToXlsx.and.returnValue(of(new Blob()));

    component.openCreate();
    component.form.patchValue({ projectTaskId: 't1', quantity: 2, description: 'New' });
    component.saveLine();
    expect(planningSpy.create).toHaveBeenCalled();

    component.openEdit(line);
    component.saveLine();
    expect(planningSpy.update).toHaveBeenCalled();

    component.deleteLine(line);
    expect(planningSpy.delete).toHaveBeenCalled();

    component.exportXlsx();
    expect(fileSpy.saveFile).toHaveBeenCalled();
  });

  it('should filter by task', () => {
    component.onFilterChange('t1');
    expect(planningSpy.list).toHaveBeenCalledWith('p1', 't1');
  });
});
