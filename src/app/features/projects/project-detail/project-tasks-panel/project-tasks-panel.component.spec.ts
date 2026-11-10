import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ProjectTasksPanelComponent } from './project-tasks-panel.component';
import { ProjectTasksService } from '../../../../core/services/project-tasks.service';
import { FileService } from '../../../../core/services/file.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ThemeService } from '../../../../core/services/theme.service';
import { ProjectTaskType } from '../../../../types/projects.types';

describe('ProjectTasksPanelComponent', () => {
  let component: ProjectTasksPanelComponent;
  let fixture: ComponentFixture<ProjectTasksPanelComponent>;
  let tasksSpy: jasmine.SpyObj<ProjectTasksService>;
  let messageSpy: jasmine.SpyObj<NzMessageService>;
  let fileSpy: jasmine.SpyObj<FileService>;

  const task = {
    id: 't1',
    projectId: 'p1',
    taskNo: '10',
    description: 'Task',
    taskType: 'Posting',
  };

  beforeEach(async () => {
    tasksSpy = jasmine.createSpyObj('ProjectTasksService', [
      'getTree',
      'create',
      'update',
      'delete',
      'move',
      'exportToXlsx',
    ]);
    messageSpy = jasmine.createSpyObj('NzMessageService', ['success', 'error']);
    fileSpy = jasmine.createSpyObj('FileService', ['saveFile']);
    tasksSpy.getTree.and.returnValue(
      of([{ task, level: 0, children: [{ task: { ...task, id: 't2', taskNo: '20' }, level: 1, children: [] }] }]),
    );

    await TestBed.configureTestingModule({
      imports: [ProjectTasksPanelComponent],
      providers: [
        { provide: ProjectTasksService, useValue: tasksSpy },
        { provide: FileService, useValue: fileSpy },
        { provide: NzMessageService, useValue: messageSpy },
        { provide: ThemeService, useValue: { effectiveTheme: () => 'light' } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectTasksPanelComponent);
    component = fixture.componentInstance;
    component.projectId = 'p1';
    component.permissions = {
      canRead: true,
      canCreate: true,
      canUpdate: true,
      canDelete: true,
      canExport: true,
      canExecute: true,
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

  it('should flatten tree on load', () => {
    expect(component.flatTasks.length).toBe(2);
    expect(component.allTasks.length).toBe(2);
  });

  it('should create task', () => {
    tasksSpy.create.and.returnValue(of(task));
    component.openCreate();
    component.form.patchValue({ taskNo: '30', description: 'New', taskType: ProjectTaskType.Posting });
    component.saveTask();
    expect(tasksSpy.create).toHaveBeenCalled();
    expect(messageSpy.success).toHaveBeenCalled();
  });

  it('should update task', () => {
    tasksSpy.update.and.returnValue(of(task));
    component.openEdit(task);
    component.saveTask();
    expect(tasksSpy.update).toHaveBeenCalled();
  });

  it('should move and delete task', () => {
    tasksSpy.move.and.returnValue(of(task));
    tasksSpy.delete.and.returnValue(of(void 0));
    component.openMove(task);
    component.saveMove();
    expect(tasksSpy.move).toHaveBeenCalled();
    component.deleteTask(task);
    expect(tasksSpy.delete).toHaveBeenCalled();
  });

  it('should export', () => {
    tasksSpy.exportToXlsx.and.returnValue(of(new Blob()));
    component.exportXlsx();
    expect(fileSpy.saveFile).toHaveBeenCalled();
  });
});
