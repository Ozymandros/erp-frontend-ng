import { Component, ChangeDetectorRef, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { Subject, takeUntil } from 'rxjs';
import { InvoiceDto, CreditNoteDto } from '../../../types/api.types';
import { InvoicesService } from '../../../core/services/invoices.service';
import { CreditNotesService } from '../../../core/services/credit-notes.service';
import { AppSelectComponent } from '../../../shared/components';
import { APP_PATHS } from '../../../core/constants/routes.constants';

@Component({
  selector: 'app-credit-notes-list',
  standalone: true,
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
  templateUrl: './credit-notes-list.component.html',
  styleUrls: ['./credit-notes-list.component.css']
})
export class CreditNotesListComponent implements OnInit {
  protected readonly destroy$ = new Subject<void>();

  data: CreditNoteDto[] = [];
  loading = false;
  invoicesLoading = false;

  invoiceOptions: InvoiceDto[] = [];
  selectedInvoiceId: string | null = null;

  readonly paths = APP_PATHS.BILLING;

  private readonly invoicesService = inject(InvoicesService);
  private readonly creditNotesService = inject(CreditNotesService);
  private readonly message = inject(NzMessageService);
  private readonly cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.loadInvoices();
  }

  loadInvoices(): void {
    this.invoicesLoading = true;
    this.invoicesService.getAllList().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (invoices) => {
        this.invoiceOptions = invoices;
        this.invoicesLoading = false;
      },
      error: () => {
        this.invoicesLoading = false;
        this.message.error('Failed to load invoices');
      }
    });
  }

  onInvoiceChange(invoiceId: string | null): void {
    this.selectedInvoiceId = invoiceId;
    if (invoiceId) {
      this.loadCreditNotes(invoiceId);
    } else {
      this.data = [];
    }
  }

  loadCreditNotes(invoiceId: string): void {
    this.loading = true;
    this.creditNotesService.getByInvoice(invoiceId).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (notes) => {
        this.data = notes;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.message.error('Failed to load credit notes');
      }
    });
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'Pending': return 'orange';
      case 'Applied': return 'green';
      case 'Cancelled': return 'default';
      default: return 'default';
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}