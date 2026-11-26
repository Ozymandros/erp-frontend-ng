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
import { InvoiceRequestDto, PlanningLineDto } from '../../../../types/projects.types';
import { ModulePermissions } from '../../../../types/api.types';
import { AppButtonComponent, AppInputNumberComponent, AppThemedModalDirective } from '../../../../shared/components';
import { canRunProjectOperations } from '../../projects.constants';

@Component({
  selector: 'app-project-invoices-panel',
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
  templateUrl: './project-invoices-panel.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectInvoicesPanelComponent implements OnChanges {
  @Input({ required: true }) projectId!: string;
  @Input() permissions: ModulePermissions | null = null;

  requests: InvoiceRequestDto[] = [];
  billableLines: PlanningLineDto[] = [];
  loading = false;
  modalVisible = false;
  form: FormGroup;

  constructor(
    private readonly postingService: ProjectPostingService,
    private readonly planningService: ProjectPlanningLinesService,
    private readonly message: NzMessageService,
    private readonly fb: FormBuilder,
    private readonly cdr: ChangeDetectorRef,
  ) {
    this.form = this.fb.group({
      taxRate: [21, [Validators.min(0), Validators.max(100)]],
      lines: this.fb.array([this.createLineGroup()]),
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['projectId'] && this.projectId) {
      this.load();
      this.planningService.list(this.projectId).subscribe((lines) => {
        this.billableLines = lines.filter(
          (l) => (l.quantityToInvoice ?? 0) > 0 || l.lineType?.includes('Billable'),
        );
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
      quantity: [null as number | null],
    });
  }

  load(): void {
    this.loading = true;
    this.postingService
      .listInvoiceRequests(this.projectId)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: (items) => {
          this.requests = items;
        },
        error: () => this.message.error('Failed to load invoice requests'),
      });
  }

  openCreate(): void {
    this.form.reset({ taxRate: 21 });
    this.lineControls.clear();
    this.lineControls.push(this.createLineGroup());
    this.modalVisible = true;
  }

  submit(): void {
    const v = this.form.value;
    this.postingService
      .createInvoiceRequest(this.projectId, {
        taxRate: v.taxRate,
        lines: v.lines,
      })
      .subscribe({
        next: () => {
          this.message.success('Invoice request submitted');
          this.modalVisible = false;
          this.load();
        },
        error: () => this.message.error('Failed to create invoice request'),
      });
  }
}
