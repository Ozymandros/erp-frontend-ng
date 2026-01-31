import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzMessageService } from 'ng-zorro-antd/message';
import { CustomersService } from '../../../core/services/customers.service';

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
  templateUrl: './customer-detail.component.html',
  styleUrls: ['./customer-detail.component.css']
})
export class CustomerDetailComponent implements OnInit {
  customerForm: FormGroup;
  customerId: string | null = null;
  isEditMode = false;
  loading = false;
  saving = false;

  constructor(
    private fb: FormBuilder,
    private customersService: CustomersService,
    private route: ActivatedRoute,
    private router: Router,
    private message: NzMessageService
  ) {
    this.customerForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: [''],
      address: ['']
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
    this.customersService.getById(id).subscribe({
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
        ? this.customersService.update(this.customerId, data)
        : this.customersService.create(data);


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
