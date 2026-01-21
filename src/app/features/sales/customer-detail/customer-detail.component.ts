import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzMessageService } from 'ng-zorro-antd/message';
import { SalesService } from '@/app/core/services/sales.service';
import { CustomerDto } from '@/app/types/api.types';

@Component({
  selector: 'app-customer-detail',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzCardModule
  ],
  template: `
    <div class="customer-detail">
      <div class="page-header">
        <button nz-button nzType="default" routerLink="/sales/customers">
          <span nz-icon nzType="arrow-left"></span>
          Back to List
        </button>
        <h1>{{ isEditMode ? 'Edit Customer' : 'Create Customer' }}</h1>
      </div>

      <nz-card [nzLoading]="loading">
        <form nz-form [formGroup]="customerForm" (ngSubmit)="save()">
          <div nz-row [nzGutter]="16">
            <div nz-col [nzSpan]="12">
              <nz-form-item>
                <nz-form-label nzRequired>Full Name</nz-form-label>
                <nz-form-control nzErrorTip="Please input customer name!">
                  <input nz-input formControlName="name" placeholder="John Doe" />
                </nz-form-control>
              </nz-form-item>
            </div>
            <div nz-col [nzSpan]="12">
              <nz-form-item>
                <nz-form-label nzRequired>Email</nz-form-label>
                <nz-form-control nzErrorTip="Please input a valid email!">
                  <input nz-input formControlName="email" type="email" placeholder="john@example.com" />
                </nz-form-control>
              </nz-form-item>
            </div>
          </div>

          <div nz-row [nzGutter]="16">
            <div nz-col [nzSpan]="12">
              <nz-form-item>
                <nz-form-label>Phone</nz-form-label>
                <nz-form-control>
                  <input nz-input formControlName="phone" placeholder="+1 234 567 890" />
                </nz-form-control>
              </nz-form-item>
            </div>
          </div>

          <nz-form-item>
            <nz-form-label>Address</nz-form-label>
            <nz-form-control>
              <input nz-input formControlName="address" placeholder="123 Main St" />
            </nz-form-control>
          </nz-form-item>

          <div nz-row [nzGutter]="16">
            <div nz-col [nzSpan]="8">
              <nz-form-item>
                <nz-form-label>City</nz-form-label>
                <nz-form-control>
                  <input nz-input formControlName="city" placeholder="City" />
                </nz-form-control>
              </nz-form-item>
            </div>
            <div nz-col [nzSpan]="8">
              <nz-form-item>
                <nz-form-label>State/Province</nz-form-label>
                <nz-form-control>
                  <input nz-input formControlName="state" placeholder="State" />
                </nz-form-control>
              </nz-form-item>
            </div>
            <div nz-col [nzSpan]="8">
              <nz-form-item>
                <nz-form-label>Country</nz-form-label>
                <nz-form-control>
                  <input nz-input formControlName="country" placeholder="Country" />
                </nz-form-control>
              </nz-form-item>
            </div>
          </div>

          <div class="form-actions">
            <button nz-button nzType="primary" [nzLoading]="saving" [disabled]="!customerForm.valid">
              {{ isEditMode ? 'Update' : 'Create' }}
            </button>
            <button nz-button nzType="default" type="button" routerLink="/sales/customers">Cancel</button>
          </div>
        </form>
      </nz-card>
    </div>
  `,
  styles: [`
    .customer-detail {
       padding: 24px;
    }

    .page-header {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 24px;
    }

    .page-header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 500;
    }

    .form-actions {
      margin-top: 24px;
      display: flex;
      gap: 8px;
    }
  `]
})
export class CustomerDetailComponent implements OnInit {
  customerForm: FormGroup;
  customerId: string | null = null;
  isEditMode = false;
  loading = false;
  saving = false;

  constructor(
    private fb: FormBuilder,
    private salesService: SalesService,
    private route: ActivatedRoute,
    private router: Router,
    private message: NzMessageService
  ) {
    this.customerForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      address: [''],
      city: [''],
      state: [''],
      country: [''],
      isActive: [true]
    });
  }

  ngOnInit(): void {
    this.customerId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.customerId && this.customerId !== 'new';
    
    if (this.isEditMode && this.customerId) {
      this.loadCustomer(this.customerId);
    }
  }

  loadCustomer(id: string): void {
    this.loading = true;
    this.salesService.getCustomerById(id).subscribe({
      next: (customer) => {
        this.customerForm.patchValue(customer);
        this.loading = false;
      },
      error: (err) => {
        this.message.error('Failed to load customer: ' + err.message);
        this.loading = false;
      }
    });
  }

  save(): void {
    if (this.customerForm.valid) {
      this.saving = true;
      const data = this.customerForm.value;

      const observable = this.isEditMode && this.customerId
        ? this.salesService.updateCustomer(this.customerId, data)
        : this.salesService.createCustomer(data);

      observable.subscribe({
        next: () => {
          this.message.success(`Customer ${this.isEditMode ? 'updated' : 'created'} successfully`);
          this.router.navigate(['/sales/customers']);
        },
        error: (err) => {
          this.message.error(`Failed to ${this.isEditMode ? 'update' : 'create'} customer: ` + err.message);
          this.saving = false;
        }
      });
    }
  }
}
