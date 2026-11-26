import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzMessageService } from 'ng-zorro-antd/message';
import { finalize } from 'rxjs';
import { ProjectPostingService } from '../../../../core/services/project-posting.service';
import { ProjectPlanningLinesService } from '../../../../core/services/project-planning-lines.service';
import { WarehousesService } from '../../../../core/services/warehouses.service';
import { ConsumptionOrderDto, PlanningLineDto } from '../../../../types/projects.types';
import { ModulePermissions } from '../../../../types/api.types';
import { WarehouseDto } from '../../../../types/api.types';
import { AppButtonComponent, AppInputNumberComponent, AppThemedModalDirective } from '../../../../shared/components';
import { canRunProjectOperations } from '../../projects.constants';

@Component({
  selector: 'app-project-consumption-panel',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzTableModule,
    NzModalModule,
    NzSelectModule,
    AppButtonComponent,
    AppInputNumberComponent,
    AppThemedModalDirective,
  ],
  templateUrl: './project-consumption-panel.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectConsumptionPanelComponent implements OnChanges {
  @Input({ required: true }) projectId!: string;
  @Input() permissions: ModulePermissions | null = null;

  orders: ConsumptionOrderDto[] = [];
  itemLines: PlanningLineDto[] = [];
  warehouses: WarehouseDto[] = [];
  loading = false;
  modalVisible = false;
  form: FormGroup;

  constructor(
    private readonly postingService: ProjectPostingService,
    private readonly planningService: ProjectPlanningLinesService,
    private readonly warehousesService: WarehousesService,
    private readonly message: NzMessageService,
    private readonly fb: FormBuilder,
    private readonly cdr: ChangeDetectorRef,
  ) {
    this.form = this.fb.group({
      warehouseId: ['', Validators.required],
      lines: this.fb.array([this.createLineGroup()]),
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['projectId'] && this.projectId) {
      this.load();
      this.planningService.list(this.projectId).subscribe((lines) => {
        this.itemLines = lines.filter((l) => l.kind?.toLowerCase() === 'item');
        this.cdr.markForCheck();
      });
      this.warehousesService.getAll({ page: 1, pageSize: 100 }).subscribe((res) => {
        this.warehouses = res.items ?? [];
        this.cdr.markForCheck();
      });
    }
  }

  get lineControls(): FormArray {
    return this.form.get('lines') as FormArray;
  }

  get canCreate(): boolean {
    return this.permissions ? canRunProjectOperations(this.permissions) : false;
  }

  private createLineGroup(): FormGroup {
    return this.fb.group({
      planningLineId: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
    });
  }

  load(): void {
    this.loading = true;
    this.postingService
      .listConsumptionOrders(this.projectId)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: (items) => {
          this.orders = items;
        },
        error: () => this.message.error('Failed to load consumption orders'),
      });
  }

  openCreate(): void {
    this.form.reset();
    this.lineControls.clear();
    this.lineControls.push(this.createLineGroup());
    this.modalVisible = true;
  }

  addLine(): void {
    this.lineControls.push(this.createLineGroup());
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.value;
    this.postingService
      .createConsumptionOrder(this.projectId, {
        warehouseId: v.warehouseId,
        lines: v.lines,
      })
      .subscribe({
        next: () => {
          this.message.success('Consumption order created');
          this.modalVisible = false;
          this.load();
        },
        error: () => this.message.error('Failed to create consumption order'),
      });
  }
}
