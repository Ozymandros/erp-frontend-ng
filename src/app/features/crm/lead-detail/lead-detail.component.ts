import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { finalize } from 'rxjs/operators';
import { CrmLeadsService } from '../../../core/services/crm-leads.service';
import { CustomersService } from '../../../core/services/customers.service';
import { AuthService } from '../../../core/services/auth.service';
import { LeadDto } from '../../../types/crm.types';
import { CustomerDto } from '../../../types/api.types';
import { AppButtonComponent, AppInputComponent, AppThemedModalDirective } from '../../../shared/components';
import { APP_PATHS } from '../../../core/constants/routes.constants';

const PHONE_INPUT_MAX_LENGTH = 25;

function phoneNumberValidator(control: AbstractControl): ValidationErrors | null {
  const v = (control.value ?? '').trim();
  if (!v) return null;
  if (v.length > PHONE_INPUT_MAX_LENGTH) return { phoneNumber: true };
  const digitsOnly = v.replace(/\D/g, '');
  if (digitsOnly.length < 8 || digitsOnly.length > 15) return { phoneNumber: true };
  if (!/^[\d\s\-+().]{8,25}$/.test(v)) return { phoneNumber: true };
  return null;
}

@Component({
  selector: 'app-lead-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
    NzFormModule,
    NzCardModule,
    NzGridModule,
    NzModalModule,
    NzSelectModule,
    NzSpinModule,
    AppButtonComponent,
    AppInputComponent,
    AppThemedModalDirective,
  ],
  templateUrl: './lead-detail.component.html',
  styleUrls: ['./lead-detail.component.css'],
})
export class LeadDetailComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly leadsService = inject(CrmLeadsService);
  private readonly customersService = inject(CustomersService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly message = inject(NzMessageService);
  private readonly authService = inject(AuthService);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly paths = APP_PATHS.CRM;

  form: FormGroup;
  leadId: string | null = null;
  isNewMode = false;
  loading = false;
  saving = false;
  qualifying = false;
  lead: LeadDto | null = null;

  customers: CustomerDto[] = [];
  loadingCustomers = false;
  qualifyModalVisible = false;
  qualifyCustomerId: string | null = null;

  constructor() {
    this.form = this.fb.group({
      title: ['', [Validators.required]],
      source: [''],
      contactName: [''],
      contactEmail: ['', [Validators.email]],
      contactPhone: ['', [phoneNumberValidator]],
    });
  }

  // Defer clearing so finalize() does not flip [disabled] in the same dev-mode CD tick (NG0100).
  private endSaving(): void {
    queueMicrotask(() => {
      this.saving = false;
      this.cdr.markForCheck();
    });
  }

  /** Defer nzSpinning bindings (loading / loadingCustomers) to the next microtask (NG0100). */
  private endSpinning(setter: () => void): void {
    queueMicrotask(() => {
      setter();
      this.cdr.markForCheck();
    });
  }

  ngOnInit(): void {
    this.leadId = this.route.snapshot.paramMap.get('id');
    this.isNewMode = !this.leadId;

    if (!this.isNewMode && this.leadId) {
      this.loadLead(this.leadId);
    }
  }

  loadLead(id: string): void {
    this.loading = true;
    this.leadsService
      .getById(id)
      .pipe(finalize(() => this.endSpinning(() => (this.loading = false))))
      .subscribe({
        next: (lead) => {
          this.lead = lead;
          this.form.patchValue({
            title: lead.title,
            source: lead.source ?? '',
            contactName: lead.contactName ?? '',
            contactEmail: lead.contactEmail ?? '',
            contactPhone: lead.contactPhone ?? '',
          });
        },
        error: (err) => this.message.error('Failed to load lead: ' + (err?.message ?? err)),
      });
  }

  save(): void {
    if (this.form.invalid) {
      Object.values(this.form.controls).forEach((c) => {
        c.markAsDirty();
        c.updateValueAndValidity({ onlySelf: true });
      });
      return;
    }

    const u = this.authService.getCurrentUser()?.username;
    if (!u) {
      this.message.error('Cannot save: missing current user username.');
      return;
    }

    this.saving = true;
    const v = this.form.getRawValue();

    if (this.isNewMode) {
      this.leadsService
        .create({
          title: v.title,
          ownerUsername: u,
          source: v.source || null,
          contactName: v.contactName || null,
          contactEmail: v.contactEmail || null,
          contactPhone: v.contactPhone || null,
        })
        .pipe(finalize(() => this.endSaving()))
        .subscribe({
          next: (created) => {
            this.message.success('Lead created');
            void this.router.navigate([this.paths.LEAD_DETAIL(created.id)]);
          },
          error: (err) => this.message.error(err?.message ?? 'Create failed'),
        });
    } else if (this.leadId) {
      this.leadsService
        .update(this.leadId, {
          title: v.title,
          source: v.source || null,
          contactName: v.contactName || null,
          contactEmail: v.contactEmail || null,
          contactPhone: v.contactPhone || null,
        })
        .pipe(finalize(() => this.endSaving()))
        .subscribe({
          next: () => {
            this.message.success('Lead updated');
            void this.router.navigate([this.paths.LEADS]);
          },
          error: (err) => this.message.error(err?.message ?? 'Update failed'),
        });
    }
  }

  openQualifyModal(): void {
    this.qualifyCustomerId = null;
    this.qualifyModalVisible = true;
    this.loadCustomersForQualify();
  }

  private loadCustomersForQualify(): void {
    this.loadingCustomers = true;
    this.customersService.getAll({ page: 1, pageSize: 100 }).subscribe({
      next: (res) => {
        this.customers = res.items ?? [];
        this.endSpinning(() => (this.loadingCustomers = false));
      },
      error: () => {
        this.endSpinning(() => (this.loadingCustomers = false));
        this.message.error('Failed to load customers');
      },
    });
  }

  confirmQualify(): void {
    if (!this.leadId || !this.qualifyCustomerId) {
      this.message.error('Select a customer');
      return;
    }
    this.qualifying = true;
    this.leadsService
      .qualify(this.leadId, { customerId: this.qualifyCustomerId })
      .pipe(
        finalize(() => {
          queueMicrotask(() => {
            this.qualifying = false;
            this.cdr.markForCheck();
          });
        }),
      )
      .subscribe({
        next: () => {
          this.message.success('Lead qualified');
          this.qualifyModalVisible = false;
          this.loadLead(this.leadId!);
        },
        error: (err) => this.message.error(err?.message ?? 'Qualify failed'),
      });
  }

  canQualify(): boolean {
    const s = this.lead?.status?.toLowerCase() ?? '';
    return !s.includes('qualif') && !s.includes('converted');
  }
}
