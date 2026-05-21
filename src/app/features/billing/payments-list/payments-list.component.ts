import { Component, OnInit, inject, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { Subscription } from 'rxjs';
import { InvoiceDto, PaymentDto } from '../../../types/api.types';
import { InvoicesService } from '../../../core/services/invoices.service';
import { PaymentsService } from '../../../core/services/payments.service';
import { AppSelectComponent } from '../../../shared/components';
import { APP_PATHS } from '../../../core/constants/routes.constants';

@Component({
  selector: 'app-payments-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    NzCardModule,
    NzTableModule,
    NzTagModule,
    NzSpaceModule,
    NzTypographyModule,
    NzSpinModule,
    AppSelectComponent
  ],
  templateUrl: './payments-list.component.html',
  styleUrls: ['./payments-list.component.css']
})
export class PaymentsListComponent implements OnInit {
  data: PaymentDto[] = [];
  loading = false;
  invoicesLoading = false;

  invoiceOptions: InvoiceDto[] = [];
  selectedInvoiceId: string | null = null;
  selectedInvoice: InvoiceDto | null = null;

  readonly paths = APP_PATHS.BILLING;

  private readonly invoicesService = inject(InvoicesService);
  private readonly paymentsService = inject(PaymentsService);
  private readonly message = inject(NzMessageService);
  private readonly cdr = inject(ChangeDetectorRef);

  private invoicesSub?: Subscription;
  private paymentsSub?: Subscription;

  ngOnInit(): void {
    this.loadInvoices();
  }

  loadInvoices(): void {
    this.invoicesLoading = true;
    this.cdr.detectChanges();
    this.invoicesSub = this.invoicesService.getAllList().subscribe({
      next: (invoices) => {
        this.invoiceOptions = invoices;
        this.invoicesLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.invoicesLoading = false;
        this.cdr.detectChanges();
        this.message.error('Failed to load invoices');
      }
    });
  }

  onInvoiceChange(invoiceId: string | null): void {
    this.selectedInvoiceId = invoiceId;
    this.selectedInvoice = invoiceId 
      ? this.invoiceOptions.find(i => i.id === invoiceId) || null 
      : null;
    
    if (invoiceId) {
      this.loadPayments(invoiceId);
    } else {
      this.data = [];
    }
  }

  loadPayments(invoiceId: string): void {
    this.loading = true;
    this.cdr.detectChanges();
    this.paymentsSub = this.paymentsService.getByInvoice(invoiceId).subscribe({
      next: (payments) => {
        this.data = payments;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
        this.message.error('Failed to load payments');
      }
    });
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'Pending': return 'orange';
      case 'Completed': return 'green';
      case 'Failed': return 'red';
      case 'Refunded': return 'default';
      default: return 'default';
    }
  }

  ngOnDestroy(): void {
    this.invoicesSub?.unsubscribe();
    this.paymentsSub?.unsubscribe();
  }
}