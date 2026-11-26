import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { finalize } from 'rxjs';
import { ProjectPlanningLinesService } from '../../../../core/services/project-planning-lines.service';
import { ProjectTasksService } from '../../../../core/services/project-tasks.service';
import { FileService } from '../../../../core/services/file.service';
import {
  CreateUpdatePlanningLineDto,
  PlanningLineDto,
  PlanningLineType,
  ProjectLineKind,
  ProjectTaskDto,
} from '../../../../types/projects.types';
import { ModulePermissions } from '../../../../types/api.types';
import { AppButtonComponent, AppInputComponent, AppInputNumberComponent, AppThemedModalDirective } from '../../../../shared/components';
import { PLANNING_LINE_TYPE_OPTIONS, PROJECT_LINE_KIND_OPTIONS } from '../../projects.constants';

@Component({
  selector: 'app-project-planning-panel',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NzTableModule,
    NzModalModule,
    NzSelectModule,
    NzPopconfirmModule,
    AppButtonComponent,
    AppInputComponent,
    AppInputNumberComponent,
    AppThemedModalDirective,
  ],
  templateUrl: './project-planning-panel.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectPlanningPanelComponent implements OnChanges {
  @Input({ required: true }) projectId!: string;
  @Input() permissions: ModulePermissions | null = null;

  lines: PlanningLineDto[] = [];
  tasks: ProjectTaskDto[] = [];
  filterTaskId: string | null = null;
  loading = false;
  modalVisible = false;
  editingLine: PlanningLineDto | null = null;
  form: FormGroup;
  readonly lineTypeOptions = PLANNING_LINE_TYPE_OPTIONS;
  readonly kindOptions = PROJECT_LINE_KIND_OPTIONS;

  constructor(
    private readonly planningService: ProjectPlanningLinesService,
    private readonly tasksService: ProjectTasksService,
    private readonly fileService: FileService,
    private readonly message: NzMessageService,
    private readonly fb: FormBuilder,
    private readonly cdr: ChangeDetectorRef,
  ) {
    this.form = this.fb.group({
      projectTaskId: ['', Validators.required],
      lineType: [PlanningLineType.BudgetAndBillable],
      kind: [ProjectLineKind.Resource],
      resourceId: [null as string | null],
      productId: [null as string | null],
      warehouseId: [null as string | null],
      description: [''],
      quantity: [1, Validators.required],
      unitPrice: [null as number | null],
      lineDiscountPercent: [0],
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['projectId'] && this.projectId) {
      this.tasksService.list(this.projectId).subscribe((t) => {
        this.tasks = t;
        this.cdr.markForCheck();
      });
      this.load();
    }
  }

  load(): void {
    this.loading = true;
    this.planningService
      .list(this.projectId, this.filterTaskId ?? undefined)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: (items) => {
          this.lines = items;
        },
        error: () => this.message.error('Failed to load planning lines'),
      });
  }

  onFilterChange(taskId: string | null): void {
    this.filterTaskId = taskId;
    this.load();
  }

  openCreate(): void {
    this.editingLine = null;
    this.form.reset({
      lineType: PlanningLineType.BudgetAndBillable,
      kind: ProjectLineKind.Resource,
      quantity: 1,
      lineDiscountPercent: 0,
    });
    this.modalVisible = true;
  }

  openEdit(line: PlanningLineDto): void {
    this.editingLine = line;
    this.form.patchValue({
      projectTaskId: line.projectTaskId,
      lineType: this.lineTypeOptions.find((o) => o.label === line.lineType)?.value,
      kind: this.kindOptions.find((o) => o.label === line.kind)?.value,
      resourceId: line.resourceId,
      productId: line.productId,
      warehouseId: line.warehouseId,
      description: line.description,
      quantity: line.quantity,
      unitPrice: line.unitPrice,
      lineDiscountPercent: line.lineDiscountPercent,
    });
    this.modalVisible = true;
  }

  saveLine(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const dto = this.form.value as CreateUpdatePlanningLineDto;
    const req = this.editingLine
      ? this.planningService.update(this.projectId, this.editingLine.id, dto)
      : this.planningService.create(this.projectId, dto);
    req.subscribe({
      next: () => {
        this.message.success('Planning line saved');
        this.modalVisible = false;
        this.load();
      },
      error: () => this.message.error('Failed to save planning line'),
    });
  }

  deleteLine(line: PlanningLineDto): void {
    this.planningService.delete(this.projectId, line.id).subscribe({
      next: () => {
        this.message.success('Line deleted');
        this.load();
      },
      error: () => this.message.error('Failed to delete line'),
    });
  }

  exportXlsx(): void {
    this.planningService.exportToXlsx(this.projectId).subscribe({
      next: (blob) => this.fileService.saveFile(blob, 'planning-lines.xlsx'),
      error: () => this.message.error('Export failed'),
    });
  }
}
