import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { catchError, finalize, forkJoin, of } from 'rxjs';
import { CrmOpportunitiesService } from '../../../core/services/crm-opportunities.service';
import { CustomersService } from '../../../core/services/customers.service';
import { ProductsService } from '../../../core/services/products.service';
import { AuthService } from '../../../core/services/auth.service';
import {
  CreateOpportunityLineDto,
  MarkOpportunityWonRequest,
  OpportunityDto,
  OpportunityLineDto,
} from '../../../types/crm.types';
import { CreateUpdateSalesOrderLineDto, CustomerDto, ProductDto } from '../../../types/api.types';
import { AppButtonComponent, AppInputComponent, AppThemedModalDirective } from '../../../shared/components';
import { APP_PATHS } from '../../../core/constants/routes.constants';
import { CRM_OPPORTUNITY_STAGES } from '../crm.constants';

@Component({
  selector: 'app-opportunity-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
    NzFormModule,
    NzCardModule,
    NzGridModule,
    NzSpinModule,
    NzTableModule,
    NzTagModule,
    NzSelectModule,
    NzDatePickerModule,
    NzModalModule,
    NzSpaceModule,
    AppButtonComponent,
    AppInputComponent,
    AppThemedModalDirective,
  ],
  templateUrl: './opportunity-detail.component.html',
  styleUrls: ['./opportunity-detail.component.css'],
})
export class OpportunityDetailComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly opportunitiesService = inject(CrmOpportunitiesService);
  private readonly customersService = inject(CustomersService);
  private readonly productsService = inject(ProductsService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly message = inject(NzMessageService);
  private readonly authService = inject(AuthService);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly paths = APP_PATHS.CRM;
  readonly stages = [...CRM_OPPORTUNITY_STAGES];

  opportunityId: string | null = null;
  isNewMode = false;
  loading = false;
  saving = false;
  opportunity: OpportunityDto | null = null;
  lines: OpportunityLineDto[] = [];

  customers: CustomerDto[] = [];
  products: ProductDto[] = [];

  createForm: FormGroup;
  forecastForm: FormGroup;
  moveStage: string = CRM_OPPORTUNITY_STAGES[0];
  expectedClose: Date | null = null;

  lostModalVisible = false;
  lostReason = '';
  lostSaving = false;

  wonModalVisible = false;
  wonConvert = false;
  quoteValidityDays = 30;
  quoteLines: CreateUpdateSalesOrderLineDto[] = [];
  wonSaving = false;

  lineModalVisible = false;
  lineForm: FormGroup;
  editingLine: OpportunityLineDto | null = null;

  constructor() {
    this.createForm = this.fb.group({
      customerId: ['', Validators.required],
      name: ['', Validators.required],
      leadId: [''],
    });

    this.forecastForm = this.fb.group({
      probability: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
      expectedAmount: [null as number | null],
    });

    this.lineForm = this.fb.group({
      description: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(0.0001)]],
      unitPrice: [0, [Validators.required, Validators.min(0)]],
      discountPercent: [0, [Validators.min(0), Validators.max(100)]],
      productId: [''],
    });
  }

  /** Avoid NG0100 when finalize() flips flags in the same CD turn as HTTP completion. */
  private endDeferred(update: () => void): void {
    queueMicrotask(() => {
      update();
      this.cdr.markForCheck();
    });
  }

  ngOnInit(): void {
    this.opportunityId = this.route.snapshot.paramMap.get('id');
    this.isNewMode = !this.opportunityId;

    const u = this.authService.getCurrentUser()?.username;

    if (this.isNewMode) {
      this.loadCustomers();
      if (u) {
        /* owner set on create via API body */
      }
    } else if (this.opportunityId) {
      this.loadOpportunity(this.opportunityId);
    }
  }

  loadCustomers(): void {
    this.customersService.getAll({ page: 1, pageSize: 200 }).subscribe({
      next: (res) => (this.customers = res.items ?? []),
      error: () => this.message.error('Failed to load customers'),
    });
  }

  loadProducts(): void {
    this.productsService.getAll({ page: 1, pageSize: 200 }).subscribe({
      next: (res) => (this.products = res.items ?? []),
      error: () => this.message.error('Failed to load products'),
    });
  }

  loadOpportunity(id: string): void {
    this.loading = true;
    forkJoin({
      opp: this.opportunitiesService.getById(id),
      lines: this.opportunitiesService.listLines(id).pipe(catchError(() => of([] as OpportunityLineDto[]))),
    })
      .pipe(finalize(() => this.endDeferred(() => (this.loading = false))))
      .subscribe({
        next: ({ opp, lines: lineRows }) => {
          this.opportunity = opp;
          this.lines = lineRows ?? [];
          this.moveStage = opp.stage;
          this.forecastForm.patchValue({
            probability: opp.probability,
            expectedAmount: opp.expectedAmount ?? null,
          });
          this.expectedClose = opp.expectedCloseDate ? new Date(opp.expectedCloseDate) : null;
          this.loadCustomers();
          this.loadProducts();
        },
        error: (err) => this.message.error('Failed to load opportunity: ' + (err?.message ?? err)),
      });
  }

  createOpportunity(): void {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }
    const u = this.authService.getCurrentUser()?.username;
    if (!u) {
      this.message.error('Missing username');
      return;
    }
    const v = this.createForm.getRawValue();
    this.saving = true;
    this.opportunitiesService
      .create({
        customerId: v.customerId,
        name: v.name,
        ownerUsername: u,
        leadId: v.leadId || null,
      })
      .pipe(finalize(() => this.endDeferred(() => (this.saving = false))))
      .subscribe({
        next: (created) => {
          this.message.success('Opportunity created');
          void this.router.navigate([this.paths.OPPORTUNITY_DETAIL(created.id)]);
        },
        error: (err) => this.message.error(err?.message ?? 'Create failed'),
      });
  }

  saveForecast(): void {
    if (!this.opportunityId || this.forecastForm.invalid) {
      this.forecastForm.markAllAsTouched();
      return;
    }
    const v = this.forecastForm.getRawValue();
    this.saving = true;
    this.opportunitiesService
      .updateForecast(this.opportunityId, {
        probability: v.probability,
        expectedAmount: v.expectedAmount ?? null,
        expectedCloseDate: this.expectedClose ? this.expectedClose.toISOString() : null,
      })
      .pipe(finalize(() => this.endDeferred(() => (this.saving = false))))
      .subscribe({
        next: (o) => {
          this.opportunity = o;
          this.message.success('Forecast updated');
        },
        error: (err) => this.message.error(err?.message ?? 'Update failed'),
      });
  }

  applyMoveStage(): void {
    if (!this.opportunityId) return;
    this.saving = true;
    this.opportunitiesService
      .moveStage(this.opportunityId, { stage: this.moveStage })
      .pipe(finalize(() => this.endDeferred(() => (this.saving = false))))
      .subscribe({
        next: (o) => {
          this.opportunity = o;
          this.message.success('Stage updated');
        },
        error: (err) => this.message.error(err?.message ?? 'Move failed'),
      });
  }

  openLineModal(line?: OpportunityLineDto): void {
    this.editingLine = line ?? null;
    if (line) {
      this.lineForm.patchValue({
        description: line.description,
        quantity: line.quantity,
        unitPrice: line.unitPrice,
        discountPercent: line.discountPercent,
        productId: line.productId ?? '',
      });
    } else {
      this.lineForm.reset({
        description: '',
        quantity: 1,
        unitPrice: 0,
        discountPercent: 0,
        productId: '',
      });
    }
    this.lineModalVisible = true;
  }

  saveLine(): void {
    if (!this.opportunityId || this.lineForm.invalid) {
      this.lineForm.markAllAsTouched();
      return;
    }
    const v = this.lineForm.getRawValue();
    const dto: CreateOpportunityLineDto = {
      description: v.description,
      quantity: v.quantity,
      unitPrice: v.unitPrice,
      discountPercent: v.discountPercent ?? 0,
      productId: v.productId || null,
      sku: null,
    };
    this.saving = true;
    const req = this.editingLine
      ? this.opportunitiesService.updateLine(this.opportunityId, this.editingLine.id, dto)
      : this.opportunitiesService.addLine(this.opportunityId, dto);
    req.pipe(finalize(() => this.endDeferred(() => (this.saving = false)))).subscribe({
      next: () => {
        this.message.success(this.editingLine ? 'Line updated' : 'Line added');
        this.lineModalVisible = false;
        this.loadOpportunity(this.opportunityId!);
      },
      error: (err) => this.message.error(err?.message ?? 'Save line failed'),
    });
  }

  removeLine(line: OpportunityLineDto): void {
    if (!this.opportunityId) return;
    this.saving = true;
    this.opportunitiesService
      .removeLine(this.opportunityId, line.id)
      .pipe(finalize(() => this.endDeferred(() => (this.saving = false))))
      .subscribe({
        next: () => {
          this.message.success('Line removed');
          this.loadOpportunity(this.opportunityId!);
        },
        error: (err) => this.message.error(err?.message ?? 'Remove failed'),
      });
  }

  openLost(): void {
    this.lostReason = '';
    this.lostModalVisible = true;
  }

  confirmLost(): void {
    if (!this.opportunityId || !this.lostReason.trim()) {
      this.message.error('Reason is required');
      return;
    }
    this.lostSaving = true;
    this.opportunitiesService
      .markLost(this.opportunityId, { reason: this.lostReason })
      .pipe(finalize(() => this.endDeferred(() => (this.lostSaving = false))))
      .subscribe({
        next: (o) => {
          this.opportunity = o;
          this.lostModalVisible = false;
          this.message.success('Marked as lost');
        },
        error: (err) => this.message.error(err?.message ?? 'Failed'),
      });
  }

  openWon(): void {
    this.wonConvert = false;
    this.quoteLines = [];
    this.wonModalVisible = true;
  }

  addQuoteLine(): void {
    const firstProduct = this.products[0]?.id;
    this.quoteLines.push({
      productId: firstProduct ?? '',
      quantity: 1,
      unitPrice: 0,
    });
  }

  confirmWon(): void {
    if (!this.opportunityId) return;
    let quote: MarkOpportunityWonRequest['quote'] = null;
    if (this.wonConvert) {
      const lines = this.quoteLines.filter((l) => l.productId);
      if (!lines.length) {
        this.message.error('Add at least one quote line with a product');
        return;
      }
      quote = {
        validityDays: this.quoteValidityDays,
        lines,
        orderDate: new Date().toISOString(),
      };
    }
    const body: MarkOpportunityWonRequest = {
      convertToQuote: this.wonConvert,
      quote,
      note: null,
    };
    this.wonSaving = true;
    this.opportunitiesService
      .markWon(this.opportunityId, body)
      .pipe(finalize(() => this.endDeferred(() => (this.wonSaving = false))))
      .subscribe({
        next: (o) => {
          this.opportunity = o;
          this.wonModalVisible = false;
          this.message.success('Marked as won');
        },
        error: (err) => this.message.error(err?.message ?? 'Failed'),
      });
  }

  isClosed(): boolean {
    const s = this.opportunity?.stage?.toLowerCase() ?? '';
    return s.includes('closed');
  }
}
