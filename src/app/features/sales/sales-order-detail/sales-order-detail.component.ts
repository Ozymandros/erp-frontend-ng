import { Component, OnInit, ChangeDetectorRef, inject, ChangeDetectionStrategy } from '@angular/core';
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
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { Subscription } from 'rxjs';
import { timeout, catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { SalesOrdersService } from '../../../core/services/sales-orders.service';
import { CustomersService } from '../../../core/services/customers.service';
import { ProductsService } from '../../../core/services/products.service';
import { InvoicesService } from '../../../core/services/invoices.service';
import { WarehousesService } from '../../../core/services/warehouses.service';
import {
  SalesOrderDto,
  CustomerDto,
  ProductDto,
  InvoiceDto,
  WarehouseDto,
  CreateSalesReturnDto,
} from '../../../types/api.types';
import {
  AppButtonComponent,
  AppInputComponent,
  AppSelectComponent,
  AppInputNumberComponent,
} from '../../../shared/components';
import {
  canCreateSalesReturn,
  getSalesOrderStatusColor,
  resolveSalesOrderStatusLabel,
} from '../sales-order-status.util';

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
    NzModalModule,
    NzSpaceModule,
    AppButtonComponent,
    AppInputComponent,
    AppSelectComponent,
    AppInputNumberComponent,
  ],
  templateUrl: './sales-order-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./sales-order-detail.component.css'],
})
export class SalesOrderDetailComponent implements OnInit {
  private static readonly LOAD_TIMEOUT_MS = 15_000;

  order: SalesOrderDto | null = null;
  linkedInvoices: InvoiceDto[] = [];
  loadingInvoices = false;
  loading = false;
  loadError: string | null = null;
  isNewOrder = false;
  orderForm!: FormGroup;
  returnForm!: FormGroup;

  customers: CustomerDto[] = [];
  products: ProductDto[] = [];
  warehouses: WarehouseDto[] = [];
  submitting = false;
  returnSubmitting = false;
  showReturnModal = false;
  private lineProductSubs: Subscription[] = [];
  private orderId: string | null = null;

  private readonly fb = inject(FormBuilder);
  private readonly message = inject(NzMessageService);
  private readonly router = inject(Router);

  constructor(
    private readonly route: ActivatedRoute,
    private readonly salesOrdersService: SalesOrdersService,
    private readonly customersService: CustomersService,
    private readonly productsService: ProductsService,
    private readonly invoicesService: InvoicesService,
    private readonly warehousesService: WarehousesService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id === 'new') {
      this.isNewOrder = true;
      this.initForm();
      this.loadSelectionData();
    } else if (id) {
      this.orderId = id;
      this.loadOrder(id);
    }
  }

  private initForm(): void {
    this.orderForm = this.fb.group({
      orderNumber: ['', [Validators.required]],
      customerId: ['', [Validators.required]],
      orderDate: [new Date(), [Validators.required]],
      lines: this.fb.array([], [Validators.required]),
    });
    this.addLine();
  }

  get lines(): FormArray {
    return this.orderForm.get('lines') as FormArray;
  }

  get returnLines(): FormArray {
    return this.returnForm.get('lines') as FormArray;
  }

  addLine(): void {
    const line = this.fb.group({
      productId: ['', [Validators.required]],
      quantity: [1, [Validators.required, Validators.min(1)]],
      unitPrice: [0, [Validators.required, Validators.min(0)]],
    });
    this.lines.push(line);
    const sub = line.get('productId')?.valueChanges.subscribe((productId) => {
      const product = this.products.find((p) => p.id === productId);
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
      return acc + quantity * unitPrice;
    }, 0);
  }

  private loadSelectionData(): void {
    this.customersService.getAll({ pageSize: 100 }).subscribe((res) => {
      this.customers = res.items;
    });
    this.productsService.getAll({ pageSize: 100 }).subscribe((res) => {
      this.products = res.items;
    });
  }

  loadOrder(id: string): void {
    this.loading = true;
    this.loadError = null;
    this.cdr.markForCheck();
    this.salesOrdersService
      .getById(id)
      .pipe(
        timeout(SalesOrderDetailComponent.LOAD_TIMEOUT_MS),
        catchError((err) => {
          this.loadError = err?.message?.includes('Timeout')
            ? 'Request timed out. The server may be slow or the endpoint may not exist.'
            : (err?.message ?? 'Failed to load order.');
          return of(null);
        }),
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        }),
      )
      .subscribe((order) => {
        this.order = order ?? null;
        if (order) {
          this.loadLinkedInvoices(id);
        }
      });
  }

  loadLinkedInvoices(salesOrderId: string): void {
    this.loadingInvoices = true;
    this.invoicesService
      .getByOrder(salesOrderId)
      .pipe(finalize(() => (this.loadingInvoices = false)))
      .subscribe({
        next: (rows) => (this.linkedInvoices = rows ?? []),
        error: () => this.message.error('Failed to load linked invoices'),
      });
  }

  openReturnModal(): void {
    if (!this.order) return;
    this.warehousesService.getAll({ pageSize: 100 }).subscribe((res) => {
      this.warehouses = res.items;
    });
    this.returnForm = this.fb.group({
      warehouseId: ['', Validators.required],
      lines: this.fb.array(
        (this.order?.lines ?? []).map((line) =>
          this.fb.group({
            productId: [line.productId, Validators.required],
            quantity: [line.quantity, [Validators.required, Validators.min(1), Validators.max(line.quantity)]],
          }),
        ),
      ),
    });
    this.showReturnModal = true;
  }

  submitReturn(): void {
    if (!this.orderId || !this.returnForm || this.returnForm.invalid) {
      this.returnForm?.markAllAsTouched();
      return;
    }
    const value = this.returnForm.value;
    const dto: CreateSalesReturnDto = {
      warehouseId: value.warehouseId,
      lines: value.lines.map((l: { productId: string; quantity: number }) => ({
        productId: l.productId,
        quantity: l.quantity,
      })),
    };
    this.returnSubmitting = true;
    this.salesOrdersService
      .createReturn(this.orderId, dto)
      .pipe(finalize(() => (this.returnSubmitting = false)))
      .subscribe({
        next: (updated) => {
          this.message.success('Return created successfully');
          this.order = updated;
          this.showReturnModal = false;
        },
        error: (err) =>
          this.message.error('Failed to create return: ' + (err?.message ?? 'Unknown error')),
      });
  }

  canReturn(): boolean {
    return !!this.order && canCreateSalesReturn(this.order.status) && !this.order.returnOrderId;
  }

  submitOrder(): void {
    if (this.orderForm.invalid) {
      Object.values(this.orderForm.controls).forEach((control) => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
      this.lines.controls.forEach((control) => {
        const group = control as FormGroup;
        Object.values(group.controls).forEach((c) => {
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
      status: 0,
    };

    this.salesOrdersService.create(payload).subscribe({
      next: () => {
        this.message.success('Sales order created successfully');
        this.router.navigate(['/sales/orders']);
      },
      error: (err) => {
        this.message.error('Failed to create sales order: ' + (err.message || 'Unknown error'));
        this.submitting = false;
      },
    });
  }

  getStatusColor(status: unknown): string {
    return getSalesOrderStatusColor(status as string | number);
  }

  getStatusLabel(status: unknown): string {
    return resolveSalesOrderStatusLabel(status as string | number);
  }
}
