import { Component, OnInit, ChangeDetectionStrategy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { FormsModule } from '@angular/forms';
import { takeUntil, take } from 'rxjs';
import { Subject } from 'rxjs';
import { InvoicesService } from '../../../core/services/invoices.service';
import { InvoiceDto, CreditNoteDto, PaymentDto, IssueInvoiceRequest, CancelInvoiceRequest, RecordPaymentDto } from '../../../types/api.types';
import { AppButtonComponent, AppInputComponent } from '../../../shared/components';
import { APP_PATHS } from '../../../core/constants/routes.constants';

@Component({
  selector: 'app-invoice-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    NzCardModule,
    NzDescriptionsModule,
    NzTableModule,
    NzTagModule,
    NzSpaceModule,
    NzButtonModule,
    NzModalModule,
    NzSpinModule,
    AppButtonComponent,
    AppInputComponent
  ],
  templateUrl: './invoice-detail.component.html',
  styleUrls: ['./invoice-detail.component.css']
})
export class InvoiceDetailComponent implements OnInit {
  invoiceId: string | null = null;
  loading = false;
  saving = false;
  invoice: InvoiceDto | null = null;
  creditNotes: CreditNoteDto[] = [];
  payments: PaymentDto[] = [];

  showIssueModal = false;
  showPaymentModal = false;
  showCancelModal = false;

  issueForm = { invoiceNumber: '', issueDate: new Date().toISOString().slice(0, 16) };
  paymentForm = { amount: 0, method: 'Cash', paidAt: new Date().toISOString().slice(0, 16) };
  cancelForm = { reason: '' };

  initPaymentForm(): void {
    const amount = this.invoice?.outstandingAmount ?? this.invoice?.totalGross ?? 0;
    this.paymentForm = {
      amount: amount,
      method: 'Cash',
      paidAt: new Date().toISOString().slice(0, 16)
    };
  }

  private readonly destroy$ = new Subject<void>();
  private readonly invoicesService = inject(InvoicesService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly message = inject(NzMessageService);
  private readonly modal = inject(NzModalService);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly invoicePaths = APP_PATHS.BILLING;

  ngOnInit(): void {
    this.invoiceId = this.route.snapshot.paramMap.get('id');
    if (this.invoiceId && this.invoiceId !== 'new') {
      this.loadInvoice(this.invoiceId);
    }
  }

  loadInvoice(id: string): void {
    this.loading = true;
    this.invoicesService.getById(id).pipe(take(1), takeUntil(this.destroy$)).subscribe({
      next: (invoice) => {
        this.invoice = invoice;
        this.loading = false;
        this.cdr.markForCheck();
        this.loadCreditNotes(id);
        this.loadPayments(id);
      },
      error: (err) => {
        this.message.error('Failed to load invoice: ' + err.message);
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  loadCreditNotes(invoiceId: string): void {
    this.invoicesService.getCreditNotes(invoiceId).pipe(takeUntil(this.destroy$)).subscribe({
      next: (notes) => this.creditNotes = notes,
      error: () => {}
    });
  }

  loadPayments(invoiceId: string): void {
    this.invoicesService.getPayments(invoiceId).pipe(takeUntil(this.destroy$)).subscribe({
      next: (payments) => this.payments = payments,
      error: () => {}
    });
  }

  onIssueInvoice(): void {
    if (!this.invoiceId) return;
    this.saving = true;
    const request: IssueInvoiceRequest = {
      invoiceNumber: this.issueForm.invoiceNumber || this.invoice?.invoiceNumber || '',
      issueDate: this.issueForm.issueDate
    };
    this.invoicesService.issue(this.invoiceId, request).pipe(takeUntil(this.destroy$)).subscribe({
      next: (invoice) => {
        this.invoice = invoice;
        this.message.success('Invoice issued successfully');
        this.showIssueModal = false;
        this.saving = false;
      },
      error: (err) => {
        this.message.error('Failed to issue invoice: ' + err.message);
        this.saving = false;
      }
    });
  }

  onRecordPayment(): void {
    if (!this.invoiceId) return;
    this.saving = true;
    const request: RecordPaymentDto = {
      invoiceId: this.invoiceId,
      amount: Number(this.paymentForm.amount),
      method: this.paymentForm.method,
      paidAt: new Date(this.paymentForm.paidAt).toISOString()
    };
    this.invoicesService.recordPayment(this.invoiceId, request).pipe(takeUntil(this.destroy$)).subscribe({
      next: (invoice) => {
        this.invoice = invoice;
        this.message.success('Payment recorded successfully');
        this.showPaymentModal = false;
        this.saving = false;
      },
      error: (err) => {
        this.message.error('Failed to record payment: ' + err.message);
        this.saving = false;
      }
    });
  }

  onCancelInvoice(): void {
    if (!this.invoiceId) return;
    this.saving = true;
    const request: CancelInvoiceRequest = { reason: this.cancelForm.reason };
    this.invoicesService.cancel(this.invoiceId, request).pipe(takeUntil(this.destroy$)).subscribe({
      next: (invoice) => {
        this.invoice = invoice;
        this.message.success('Invoice cancelled successfully');
        this.showCancelModal = false;
        this.saving = false;
      },
      error: (err) => {
        this.message.error('Failed to cancel invoice: ' + err.message);
        this.saving = false;
      }
    });
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'Draft': return 'default';
      case 'Issued': return 'blue';
      case 'Paid': return 'green';
      case 'PartiallyPaid': return 'orange';
      case 'Overdue': return 'red';
      case 'Cancelled': return 'default';
      default: return 'default';
    }
  }

  canIssue(): boolean {
    return this.invoice?.status === 'Draft';
  }

  canCancel(): boolean {
    return this.invoice?.status === 'Issued' || this.invoice?.status === 'PartiallyPaid';
  }

  canRecordPayment(): boolean {
    return this.invoice?.status === 'Issued' || this.invoice?.status === 'PartiallyPaid';
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}