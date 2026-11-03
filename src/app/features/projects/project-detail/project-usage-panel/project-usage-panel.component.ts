import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ProjectPostingService } from '../../../../core/services/project-posting.service';
import { ProjectTasksService } from '../../../../core/services/project-tasks.service';
import { ProjectResourcesService } from '../../../../core/services/project-resources.service';
import { PostUsageDto, ProjectLineKind, ProjectTaskDto, ResourceDto } from '../../../../types/projects.types';
import { ModulePermissions } from '../../../../types/api.types';
import { AppButtonComponent, AppInputComponent, AppInputNumberComponent } from '../../../../shared/components';
import { canRunProjectOperations } from '../../projects.constants';

@Component({
  selector: 'app-project-usage-panel',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzSelectModule,
    AppButtonComponent,
    AppInputComponent,
    AppInputNumberComponent,
  ],
  templateUrl: './project-usage-panel.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectUsagePanelComponent implements OnChanges {
  @Input({ required: true }) projectId!: string;
  @Input() permissions: ModulePermissions | null = null;

  form: FormGroup;
  tasks: ProjectTaskDto[] = [];
  resources: ResourceDto[] = [];
  posting = false;

  constructor(
    private readonly postingService: ProjectPostingService,
    private readonly tasksService: ProjectTasksService,
    private readonly resourcesService: ProjectResourcesService,
    private readonly message: NzMessageService,
    private readonly fb: FormBuilder,
    private readonly cdr: ChangeDetectorRef,
  ) {
    this.form = this.fb.group({
      projectTaskId: ['', Validators.required],
      resourceId: [null as string | null],
      description: [''],
      quantity: [1, Validators.required],
      kind: [ProjectLineKind.Resource],
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['projectId'] && this.projectId) {
      this.tasksService.list(this.projectId).subscribe((t) => {
        this.tasks = t;
        this.cdr.markForCheck();
      });
      this.resourcesService.getAll({ page: 1, pageSize: 100 }).subscribe((res) => {
        this.resources = res.items ?? [];
        this.cdr.markForCheck();
      });
    }
  }

  get canPost(): boolean {
    return this.permissions ? canRunProjectOperations(this.permissions) : false;
  }

  submit(): void {
    if (!this.canPost || this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.posting = true;
    const dto = this.form.value as PostUsageDto;
    this.postingService.postUsage(this.projectId, dto).subscribe({
      next: () => {
        this.message.success('Usage posted');
        this.posting = false;
        this.form.reset({ quantity: 1, kind: ProjectLineKind.Resource });
        this.cdr.markForCheck();
      },
      error: () => {
        this.message.error('Failed to post usage');
        this.posting = false;
        this.cdr.markForCheck();
      },
    });
  }
}
