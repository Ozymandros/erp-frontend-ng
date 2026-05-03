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
        console.log('Invoices loaded:', invoices.length);
        this.invoiceOptions = invoices;
        this.invoicesLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load invoices:', err);
        this.invoicesLoading = false;
        this.cdr.detectChanges();
        this.message.error('Failed to load invoices');
      }
    });
  }

  onInvoiceChange(invoiceId: string | null): void {
    console.log('Invoice changed:', invoiceId);
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
    console.log('Loading payments for invoice:', invoiceId);
    this.loading = true;
    this.cdr.detectChanges();
    this.paymentsSub = this.paymentsService.getByInvoice(invoiceId).subscribe({
      next: (payments) => {
        console.log('Payments loaded:', payments.length);
        this.data = payments;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load payments:', err);
        this.loading = false;
        this.cdr.detectChanges();
        this.message.error('Failed to load payments');
      }
    });
  }

  testLoad(): void {
    console.log('Test button clicked, selectedInvoiceId:', this.selectedInvoiceId);
    if (this.selectedInvoiceId) {
      this.loadPayments(this.selectedInvoiceId);
    } else if (this.invoiceOptions.length > 0) {
      console.log('Using first invoice');
      this.loadPayments(this.invoiceOptions[0].id);
    }
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