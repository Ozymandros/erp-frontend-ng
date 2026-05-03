import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzMessageService } from 'ng-zorro-antd/message';
import { takeUntil } from 'rxjs';
import { Subject } from 'rxjs';
import { PaymentDto } from '../../../types/api.types';
import { PaymentsService } from '../../../core/services/payments.service';
import { APP_PATHS } from '../../../core/constants/routes.constants';
import { AppButtonComponent } from '../../../shared/components';

@Component({
  selector: 'app-payment-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    NzCardModule,
    NzDescriptionsModule,
    NzTagModule,
    NzSpaceModule,
    NzButtonModule,
    AppButtonComponent
  ],
  templateUrl: './payment-detail.component.html',
  styleUrls: ['./payment-detail.component.css']
})
export class PaymentDetailComponent implements OnInit {
  protected readonly destroy$ = new Subject<void>();

  paymentId: string | null = null;
  loading = false;
  payment: PaymentDto | null = null;

  readonly paths = APP_PATHS.BILLING;

  private readonly route = inject(ActivatedRoute);
  private readonly paymentsService = inject(PaymentsService);
  private readonly message = inject(NzMessageService);

  ngOnInit(): void {
    this.paymentId = this.route.snapshot.paramMap.get('id');
    if (this.paymentId) {
      this.loadPayment(this.paymentId);
    }
  }

  loadPayment(id: string): void {
    this.loading = true;
    this.paymentsService.getById(id).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (payment) => {
        this.payment = payment;
        this.loading = false;
      },
      error: (err) => {
        this.message.error('Failed to load payment: ' + err.message);
        this.loading = false;
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
    this.destroy$.next();
    this.destroy$.complete();
  }
}