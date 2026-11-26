import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { finalize } from 'rxjs';
import { ProjectTasksService } from '../../../../core/services/project-tasks.service';
import { FileService } from '../../../../core/services/file.service';
import {
  CreateProjectTaskDto,
  ProjectTaskDto,
  ProjectTaskTreeNodeDto,
  ProjectTaskType,
  UpdateProjectTaskDto,
} from '../../../../types/projects.types';
import { ModulePermissions } from '../../../../types/api.types';
import { AppButtonComponent, AppInputComponent, AppThemedModalDirective } from '../../../../shared/components';
import { PROJECT_TASK_TYPE_OPTIONS } from '../../projects.constants';

@Component({
  selector: 'app-project-tasks-panel',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzTableModule,
    NzModalModule,
    NzSelectModule,
    NzPopconfirmModule,
    AppButtonComponent,
    AppInputComponent,
    AppThemedModalDirective,
  ],
  templateUrl: './project-tasks-panel.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectTasksPanelComponent implements OnChanges {
  @Input({ required: true }) projectId!: string;
  @Input() permissions: ModulePermissions | null = null;

  flatTasks: { task: ProjectTaskDto; level: number }[] = [];
  allTasks: ProjectTaskDto[] = [];
  loading = false;
  modalVisible = false;
  moveModalVisible = false;
  editingTask: ProjectTaskDto | null = null;
  moveTarget: ProjectTaskDto | null = null;
  form: FormGroup;
  moveForm: FormGroup;
  readonly taskTypeOptions = PROJECT_TASK_TYPE_OPTIONS;

  constructor(
    private readonly tasksService: ProjectTasksService,
    private readonly fileService: FileService,
    private readonly message: NzMessageService,
    private readonly fb: FormBuilder,
    private readonly cdr: ChangeDetectorRef,
  ) {
    this.form = this.fb.group({
      taskNo: ['', Validators.required],
      description: ['', Validators.required],
      taskType: [ProjectTaskType.Posting],
      parentTaskId: [null as string | null],
      sortOrder: [null as number | null],
    });
    this.moveForm = this.fb.group({
      newParentTaskId: [null as string | null],
      sortOrder: [null as number | null],
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['projectId'] && this.projectId) {
      this.load();
    }
  }

  load(): void {
    this.loading = true;
    this.tasksService
      .getTree(this.projectId)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: (tree) => {
          this.flatTasks = this.flattenTree(tree);
          this.allTasks = this.flatTasks.map((x) => x.task);
        },
        error: () => this.message.error('Failed to load tasks'),
      });
  }

  private flattenTree(nodes: ProjectTaskTreeNodeDto[], acc: { task: ProjectTaskDto; level: number }[] = []): {
    task: ProjectTaskDto;
    level: number;
  }[] {
    for (const node of nodes) {
      acc.push({ task: node.task, level: node.level });
      if (node.children?.length) {
        this.flattenTree(node.children, acc);
      }
    }
    return acc;
  }

  openCreate(): void {
    this.editingTask = null;
    this.form.reset({ taskType: ProjectTaskType.Posting, parentTaskId: null, sortOrder: null });
    this.modalVisible = true;
  }

  openEdit(task: ProjectTaskDto): void {
    this.editingTask = task;
    this.form.patchValue({
      taskNo: task.taskNo,
      description: task.description,
      taskType: this.taskTypeOptions.find((o) => o.label === task.taskType)?.value ?? ProjectTaskType.Posting,
      parentTaskId: task.parentTaskId,
    });
    this.modalVisible = true;
  }

  openMove(task: ProjectTaskDto): void {
    this.moveTarget = task;
    this.moveForm.reset({ newParentTaskId: task.parentTaskId, sortOrder: task.sortOrder });
    this.moveModalVisible = true;
  }

  saveTask(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.value;
    if (this.editingTask) {
      const dto: UpdateProjectTaskDto = {
        taskNo: v.taskNo,
        description: v.description,
        taskType: v.taskType,
      };
      this.tasksService.update(this.projectId, this.editingTask.id, dto).subscribe({
        next: () => {
          this.message.success('Task updated');
          this.modalVisible = false;
          this.load();
        },
        error: () => this.message.error('Failed to update task'),
      });
    } else {
      const dto: CreateProjectTaskDto = {
        taskNo: v.taskNo,
        description: v.description,
        taskType: v.taskType,
        parentTaskId: v.parentTaskId,
        sortOrder: v.sortOrder,
      };
      this.tasksService.create(this.projectId, dto).subscribe({
        next: () => {
          this.message.success('Task created');
          this.modalVisible = false;
          this.load();
        },
        error: () => this.message.error('Failed to create task'),
      });
    }
  }

  saveMove(): void {
    if (!this.moveTarget) {
      return;
    }
    const v = this.moveForm.value;
    this.tasksService
      .move(this.projectId, this.moveTarget.id, {
        newParentTaskId: v.newParentTaskId,
        sortOrder: v.sortOrder,
      })
      .subscribe({
        next: () => {
          this.message.success('Task moved');
          this.moveModalVisible = false;
          this.load();
        },
        error: () => this.message.error('Failed to move task'),
      });
  }

  deleteTask(task: ProjectTaskDto): void {
    this.tasksService.delete(this.projectId, task.id).subscribe({
      next: () => {
        this.message.success('Task deleted');
        this.load();
      },
      error: () => this.message.error('Failed to delete task'),
    });
  }

  exportXlsx(): void {
    this.tasksService.exportToXlsx(this.projectId).subscribe({
      next: (blob) => this.fileService.saveFile(blob, 'project-tasks.xlsx'),
      error: () => this.message.error('Export failed'),
    });
  }
}
