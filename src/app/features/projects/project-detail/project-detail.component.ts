import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzMessageService } from 'ng-zorro-antd/message';
import { finalize } from 'rxjs';
import { ProjectsService } from '../../../core/services/projects.service';
import { CustomersService } from '../../../core/services/customers.service';
import { ProjectCurrenciesService } from '../../../core/services/project-currencies.service';
import { AuthService } from '../../../core/services/auth.service';
import {
  ChangeProjectStatusDto,
  CopyProjectDto,
  CreateProjectDto,
  CurrencyDto,
  ProjectBlocked,
  ProjectDto,
  ProjectStatisticsDto,
  ProjectStatus,
  UpdateProjectDto,
} from '../../../types/projects.types';
import { CustomerDto, ModulePermissions } from '../../../types/api.types';
import { AppButtonComponent, AppInputComponent, AppThemedModalDirective } from '../../../shared/components';
import { APP_PATHS } from '../../../core/constants/routes.constants';
import {
  PROJECT_BLOCKED_OPTIONS,
  PROJECT_STATUS_OPTIONS,
  canRunProjectOperations,
  projectStatusTagColor,
} from '../projects.constants';
import { ProjectTasksPanelComponent } from './project-tasks-panel/project-tasks-panel.component';
import { ProjectPlanningPanelComponent } from './project-planning-panel/project-planning-panel.component';
import { ProjectLedgerPanelComponent } from './project-ledger-panel/project-ledger-panel.component';
import { ProjectUsagePanelComponent } from './project-usage-panel/project-usage-panel.component';
import { ProjectConsumptionPanelComponent } from './project-consumption-panel/project-consumption-panel.component';
import { ProjectInvoicesPanelComponent } from './project-invoices-panel/project-invoices-panel.component';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    NzFormModule,
    NzCardModule,
    NzSelectModule,
    NzModalModule,
    NzDescriptionsModule,
    NzTagModule,
    NzDatePickerModule,
    NzCheckboxModule,
    AppButtonComponent,
    AppInputComponent,
    AppThemedModalDirective,
    ProjectTasksPanelComponent,
    ProjectPlanningPanelComponent,
    ProjectLedgerPanelComponent,
    ProjectUsagePanelComponent,
    ProjectConsumptionPanelComponent,
    ProjectInvoicesPanelComponent,
  ],
  templateUrl: './project-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./project-detail.component.css'],
})
export class ProjectDetailComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly projectsService = inject(ProjectsService);
  private readonly customersService = inject(CustomersService);
  private readonly currenciesService = inject(ProjectCurrenciesService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly message = inject(NzMessageService);
  private readonly authService = inject(AuthService);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly paths = APP_PATHS.PROJECTS;
  readonly statusOptions = PROJECT_STATUS_OPTIONS;
  readonly blockedOptions = PROJECT_BLOCKED_OPTIONS;
  readonly statusTagColor = projectStatusTagColor;

  form: FormGroup;
  projectId: string | null = null;
  isNewMode = false;
  loading = false;
  saving = false;
  project: ProjectDto | null = null;
  statistics: ProjectStatisticsDto | null = null;
  customers: CustomerDto[] = [];
  currencies: CurrencyDto[] = [];
  permissions: ModulePermissions = {
    canRead: false,
    canCreate: false,
    canUpdate: false,
    canDelete: false,
    canExport: false,
    canExecute: false,
  };

  statusModalVisible = false;
  copyModalVisible = false;
  statusForm: FormGroup;
  copyForm: FormGroup;
  activeTab: 'tasks' | 'planning' | 'ledger' | 'usage' | 'consumption' | 'invoices' = 'tasks';

  constructor() {
    this.form = this.fb.group({
      description: ['', Validators.required],
      customerId: ['', Validators.required],
      projectManagerUserId: [null as string | null],
      startingDate: [null as Date | null],
      endingDate: [null as Date | null],
      currencyCode: [''],
      blocked: [ProjectBlocked.None],
      externalReference: [''],
    });
    this.statusForm = this.fb.group({
      status: [ProjectStatus.Open, Validators.required],
    });
    this.copyForm = this.fb.group({
      description: [''],
      includePlanningLines: [true],
    });
  }

  ngOnInit(): void {
    this.projectId = this.route.snapshot.paramMap.get('id');
    this.isNewMode = !this.projectId;

    this.authService.getModulePermissions('projects').subscribe((p) => {
      this.permissions = p;
      this.cdr.markForCheck();
    });

    this.customersService.getAll({ page: 1, pageSize: 200 }).subscribe((res) => {
      this.customers = res.items ?? [];
      this.cdr.markForCheck();
    });
    this.currenciesService.list().subscribe((c) => {
      this.currencies = c;
      this.cdr.markForCheck();
    });

    if (!this.isNewMode && this.projectId) {
      this.loadProject(this.projectId);
    }
  }

  get canRunOps(): boolean {
    return canRunProjectOperations(this.permissions);
  }

  loadProject(id: string): void {
    this.loading = true;
    this.projectsService
      .getById(id)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: (p) => {
          this.project = p;
          this.patchForm(p);
          this.loadStatistics(id);
        },
        error: () => this.message.error('Failed to load project'),
      });
  }

  loadStatistics(id: string): void {
    this.projectsService.getStatistics(id).subscribe({
      next: (s) => {
        this.statistics = s;
        this.cdr.markForCheck();
      },
    });
  }

  private patchForm(p: ProjectDto): void {
    const blocked =
      this.blockedOptions.find((o) => o.label.toLowerCase() === (p.blocked ?? '').toLowerCase())?.value ??
      ProjectBlocked.None;
    this.form.patchValue({
      description: p.description,
      customerId: p.customerId,
      projectManagerUserId: p.projectManagerUserId,
      currencyCode: p.currencyCode,
      blocked,
      externalReference: p.externalReference ?? '',
    });
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving = true;
    const raw = this.form.value;

    if (this.isNewMode) {
      const dto: CreateProjectDto = {
        description: raw.description,
        customerId: raw.customerId,
        projectManagerUserId: raw.projectManagerUserId,
        currencyCode: raw.currencyCode || null,
        externalReference: raw.externalReference || null,
        startingDate: raw.startingDate ? (raw.startingDate as Date).toISOString() : null,
        endingDate: raw.endingDate ? (raw.endingDate as Date).toISOString() : null,
      };
      this.projectsService
        .create(dto)
        .pipe(
          finalize(() => {
            this.saving = false;
            this.cdr.markForCheck();
          }),
        )
        .subscribe({
          next: (created) => {
            this.message.success('Project created');
            this.router.navigate([this.paths.DETAIL(created.id)]);
          },
          error: () => this.message.error('Failed to create project'),
        });
      return;
    }

    if (!this.projectId) {
      return;
    }

    const dto: UpdateProjectDto = {
      description: raw.description,
      customerId: raw.customerId,
      projectManagerUserId: raw.projectManagerUserId,
      currencyCode: raw.currencyCode,
      blocked: raw.blocked,
      externalReference: raw.externalReference || null,
      startingDate: raw.startingDate ? (raw.startingDate as Date).toISOString() : null,
      endingDate: raw.endingDate ? (raw.endingDate as Date).toISOString() : null,
    };

    this.projectsService
      .update(this.projectId, dto)
      .pipe(
        finalize(() => {
          this.saving = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: (p) => {
          this.message.success('Project updated');
          this.project = p;
          this.loadStatistics(this.projectId!);
        },
        error: () => this.message.error('Failed to update project'),
      });
  }

  openStatusModal(): void {
    this.statusModalVisible = true;
  }

  applyStatus(): void {
    if (!this.projectId || !this.canRunOps) {
      return;
    }
    const dto: ChangeProjectStatusDto = { status: this.statusForm.value.status };
    this.projectsService.changeStatus(this.projectId, dto).subscribe({
      next: (p) => {
        this.message.success('Status updated');
        this.project = p;
        this.statusModalVisible = false;
        this.cdr.markForCheck();
      },
      error: () => this.message.error('Failed to change status'),
    });
  }

  openCopyModal(): void {
    this.copyModalVisible = true;
  }

  copyProject(): void {
    if (!this.projectId || !this.canRunOps) {
      return;
    }
    const dto: CopyProjectDto = this.copyForm.value;
    this.projectsService.copy(this.projectId, dto).subscribe({
      next: (p) => {
        this.message.success('Project copied');
        this.copyModalVisible = false;
        this.router.navigate([this.paths.DETAIL(p.id)]);
      },
      error: () => this.message.error('Failed to copy project'),
    });
  }
}
