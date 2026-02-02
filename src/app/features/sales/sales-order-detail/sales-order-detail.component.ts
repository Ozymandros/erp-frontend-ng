import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { Subscription } from 'rxjs';
import { timeout, catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { SalesOrdersService } from '../../../core/services/sales-orders.service';
import { CustomersService } from '../../../core/services/customers.service';
import { ProductsService } from '../../../core/services/products.service';
import { SalesOrderDto, CustomerDto, ProductDto } from '../../../types/api.types';
import { 
  AppButtonComponent, 
  AppInputComponent, 
  AppSelectComponent, 
  AppInputNumberComponent 
} from '../../../shared/components';

@Component({
  selector: 'app-sales-order-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    NzCardModule,
    NzTagModule,
    NzTableModule,
    NzFormModule,
    NzDatePickerModule,
    NzTypographyModule,
    AppButtonComponent,
    AppInputComponent,
    AppSelectComponent,
    AppInputNumberComponent
  ],
  templateUrl: './sales-order-detail.component.html',
  styleUrls: ['./sales-order-detail.component.css']
})
export class SalesOrderDetailComponent implements OnInit {
  private static readonly LOAD_TIMEOUT_MS = 15_000;
  
  order: SalesOrderDto | null = null;
  loading = false;
  loadError: string | null = null;
  isNewOrder = false;
  orderForm!: FormGroup;
  
  customers: CustomerDto[] = [];
  products: ProductDto[] = [];
  submitting = false;
  private lineProductSubs: Subscription[] = [];

  private fb = inject(FormBuilder);
  private message = inject(NzMessageService);
  private router = inject(Router);

  constructor(
    private route: ActivatedRoute,
    private salesOrdersService: SalesOrdersService,
    private customersService: CustomersService,
    private productsService: ProductsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id === 'new') {
      this.isNewOrder = true;
      this.initForm();
      this.loadSelectionData();
    } else if (id) {
      this.loadOrder(id);
    }
  }

  private initForm(): void {
    this.orderForm = this.fb.group({
      orderNumber: ['', [Validators.required]],
      customerId: ['', [Validators.required]],
      orderDate: [new Date(), [Validators.required]],
      lines: this.fb.array([], [Validators.required])
    });
    
    // Add first line by default
    this.addLine();
  }

  get lines(): FormArray {
    return this.orderForm.get('lines') as FormArray;
  }

  addLine(): void {
    const line = this.fb.group({
      productId: ['', [Validators.required]],
      quantity: [1, [Validators.required, Validators.min(1)]],
      unitPrice: [0, [Validators.required, Validators.min(0)]]
    });
    this.lines.push(line);
    const sub = line.get('productId')?.valueChanges.subscribe(productId => {
      const product = this.products.find(p => p.id === productId);
      if (product) {
        line.patchValue({ unitPrice: product.unitPrice }, { emitEvent: false });
      }
    });
    if (sub) this.lineProductSubs.push(sub);
  }

  removeLine(index: number): void {
    if (this.lines.length > 1) {
      this.lineProductSubs[index]?.unsubscribe();
      this.lineProductSubs.splice(index, 1);
      this.lines.removeAt(index);
    } else {
      this.message.warning('At least one order line is required');
    }
  }

  calculateTotal(): number {
    return this.lines.controls.reduce((acc, control) => {
      const quantity = control.get('quantity')?.value || 0;
      const unitPrice = control.get('unitPrice')?.value || 0;
      return acc + (quantity * unitPrice);
    }, 0);
  }

  private loadSelectionData(): void {
    this.customersService.getAll({ pageSize: 100 }).subscribe(res => {
      this.customers = res.items;
    });
    this.productsService.getAll({ pageSize: 100 }).subscribe(res => {
      this.products = res.items;
    });
  }

  loadOrder(id: string): void {
    this.loading = true;
    this.loadError = null;
    this.cdr.markForCheck();
    this.salesOrdersService.getById(id).pipe(
      timeout(SalesOrderDetailComponent.LOAD_TIMEOUT_MS),
      catchError((err) => {
        this.loadError = err?.message?.includes('Timeout') ? 'Request timed out. The server may be slow or the endpoint may not exist.' : (err?.message ?? 'Failed to load order.');
        return of(null);
      }),
      finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
      })
    ).subscribe((order) => {
      this.order = order ?? null;
    });
  }

  submitOrder(): void {
    if (this.orderForm.invalid) {
      Object.values(this.orderForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
      // Also mark lines as dirty
      this.lines.controls.forEach(control => {
        const group = control as FormGroup;
        Object.values(group.controls).forEach(c => {
          c.markAsDirty();
          c.updateValueAndValidity({ onlySelf: true });
        });
      });
      return;
    }

    this.submitting = true;
    const formValue = this.orderForm.value;
    const payload = {
      ...formValue,
      totalAmount: this.calculateTotal(),
      status: 0 // Draft
    };

    this.salesOrdersService.create(payload).subscribe({
      next: () => {
        this.message.success('Sales order created successfully');
        this.router.navigate(['/sales/orders']);
      },
      error: (err) => {
        this.message.error('Failed to create sales order: ' + (err.message || 'Unknown error'));
        this.submitting = false;
      }
    });
  }

  getStatusColor(status: unknown): string {
    switch (status) {
      case 'Draft':
      case 0: return 'default';
      case 'Pending':
      case 1: return 'orange';
      case 'Confirmed':
      case 2: return 'blue';
      case 'Shipped':
      case 3: return 'cyan';
      case 'Delivered':
      case 4: return 'green';
      case 'Cancelled':
      case 5: return 'red';
      default: return 'default';
    }
  }
}
