import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Subscription } from 'rxjs';
import { timeout, catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { PurchaseOrdersService } from '../../../core/services/purchase-orders.service';
import { ProductsService } from '../../../core/services/products.service';
import { SuppliersService } from '../../../core/services/suppliers.service';
import { PurchaseOrderDto, ProductDto, SupplierDto } from '../../../types/api.types';

@Component({
  selector: 'app-purchase-order-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    NzCardModule,
    NzButtonModule,
    NzTagModule,
    NzTableModule,
    NzIconModule,
    NzFormModule,
    NzInputModule,
    NzSelectModule,
    NzDatePickerModule,
    NzInputNumberModule
  ],
  templateUrl: './purchase-order-detail.component.html',
  styleUrls: ['./purchase-order-detail.component.css']
})
export class PurchaseOrderDetailComponent implements OnInit {
  private static readonly LOAD_TIMEOUT_MS = 15_000;
  
  order: PurchaseOrderDto | null = null;
  loading = false;
  loadError: string | null = null;
  isNewOrder = false;
  orderForm!: FormGroup;
  
  products: ProductDto[] = [];
  suppliers: SupplierDto[] = [];
  submitting = false;
  private lineProductSubs: Subscription[] = [];

  private fb = inject(FormBuilder);
  private message = inject(NzMessageService);
  private router = inject(Router);

  constructor(
    private route: ActivatedRoute,
    private purchaseOrdersService: PurchaseOrdersService,
    private productsService: ProductsService,
    private suppliersService: SuppliersService,
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
      supplierId: ['', [Validators.required]],
      orderDate: [new Date(), [Validators.required]],
      expectedDeliveryDate: [null],
      lines: this.fb.array([], [Validators.required])
    });
    
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
    this.productsService.getAll({ pageSize: 100 }).subscribe(res => {
      this.products = res.items;
    });
    this.suppliersService.getAll({ pageSize: 500 }).subscribe(res => {
      this.suppliers = res.items;
    });
  }

  loadOrder(id: string): void {
    this.loading = true;
    this.loadError = null;
    this.cdr.markForCheck();
    this.purchaseOrdersService.getById(id).pipe(
      timeout(PurchaseOrderDetailComponent.LOAD_TIMEOUT_MS),
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

    this.purchaseOrdersService.create(payload).subscribe({
      next: () => {
        this.message.success('Purchase order created successfully');
        this.router.navigate(['/purchasing/orders']);
      },
      error: (err) => {
        this.message.error('Failed to create purchase order: ' + (err.message || 'Unknown error'));
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
      case 'Approved':
      case 2: return 'blue';
      case 'PartiallyReceived':
      case 3: return 'cyan';
      case 'Received':
      case 4: return 'green';
      case 'Cancelled':
      case 5: return 'red';
      default: return 'default';
    }
  }
}
