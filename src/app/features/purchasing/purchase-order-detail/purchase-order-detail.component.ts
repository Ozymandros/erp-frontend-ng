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
import { Subscription, of } from 'rxjs';
import { timeout, catchError, finalize } from 'rxjs/operators';
import { PurchaseOrdersService } from '../../../core/services/purchase-orders.service';
import { SupplierInvoicesService } from '../../../core/services/supplier-invoices.service';
import { ProductsService } from '../../../core/services/products.service';
import { SuppliersService } from '../../../core/services/suppliers.service';
import { WarehousesService } from '../../../core/services/warehouses.service';
import {
  PurchaseOrderDto,
  ProductDto,
  SupplierDto,
  WarehouseDto,
  SupplierInvoiceDto,
  CreateSupplierInvoiceDto,
  PurchaseOrderMatchResultDto,
  PurchaseOrderMatchStatus,
} from '../../../types/api.types';
import {
  AppButtonComponent,
  AppInputComponent,
  AppSelectComponent,
  AppInputNumberComponent,
} from '../../../shared/components';
import {
  getPurchaseOrderMatchStatusColor,
  resolvePurchaseOrderMatchStatusLabel,
} from '../purchase-order-match.util';
import {
  getPurchaseOrderStatusColor,
  resolvePurchaseOrderStatusLabel,
} from '../purchase-order-status.util';

@Component({
  selector: 'app-purchase-order-detail',
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
  templateUrl: './purchase-order-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./purchase-order-detail.component.css'],
})
export class PurchaseOrderDetailComponent implements OnInit {
  private static readonly LOAD_TIMEOUT_MS = 15_000;

  order: PurchaseOrderDto | null = null;
  supplierInvoices: SupplierInvoiceDto[] = [];
  matchResult: PurchaseOrderMatchResultDto | null = null;
  loading = false;
  loadingSupplierInvoices = false;
  loadError: string | null = null;
  isNewOrder = false;
  orderForm!: FormGroup;
  supplierInvoiceForm!: FormGroup;
  receiveForm!: FormGroup;

  products: ProductDto[] = [];
  suppliers: SupplierDto[] = [];
  warehouses: WarehouseDto[] = [];
  submitting = false;
  actionLoading = false;
  showSupplierInvoiceModal = false;
  showReceiveModal = false;
  private lineProductSubs: Subscription[] = [];
  private orderId: string | null = null;

  private readonly fb = inject(FormBuilder);
  private readonly message = inject(NzMessageService);
  private readonly router = inject(Router);

  constructor(
    private readonly route: ActivatedRoute,
    private readonly purchaseOrdersService: PurchaseOrdersService,
    private readonly supplierInvoicesService: SupplierInvoicesService,
    private readonly productsService: ProductsService,
    private readonly suppliersService: SuppliersService,
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
      supplierId: ['', [Validators.required]],
      orderDate: [new Date(), [Validators.required]],
      expectedDeliveryDate: [null],
      lines: this.fb.array([], [Validators.required]),
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
    this.productsService.getAll({ pageSize: 100 }).subscribe((res) => {
      this.products = res.items;
    });
    this.suppliersService.getAll({ pageSize: 500 }).subscribe((res) => {
      this.suppliers = res.items;
    });
  }

  loadOrder(id: string): void {
    this.loading = true;
    this.loadError = null;
    this.cdr.markForCheck();
    this.purchaseOrdersService
      .getById(id)
      .pipe(
        timeout(PurchaseOrderDetailComponent.LOAD_TIMEOUT_MS),
        catchError((err) => {
          this.loadError = err?.message?.includes('Timeout')
            ? 'Request timed out.'
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
          this.loadSupplierInvoices(id);
        }
      });
  }

  loadSupplierInvoices(purchaseOrderId: string): void {
    this.loadingSupplierInvoices = true;
    this.supplierInvoicesService
      .getByPurchaseOrder(purchaseOrderId)
      .pipe(finalize(() => (this.loadingSupplierInvoices = false)))
      .subscribe({
        next: (rows) => (this.supplierInvoices = rows ?? []),
        error: () => this.message.error('Failed to load supplier invoices'),
      });
  }

  approveOrder(): void {
    if (!this.orderId) return;
    this.actionLoading = true;
    this.purchaseOrdersService
      .approvePurchaseOrder({ purchaseOrderId: this.orderId })
      .pipe(finalize(() => (this.actionLoading = false)))
      .subscribe({
        next: (updated) => {
          this.message.success('Purchase order approved');
          this.order = updated;
        },
        error: (err) =>
          this.message.error('Approve failed: ' + (err?.message ?? 'Unknown error')),
      });
  }

  openReceiveModal(): void {
    if (!this.order) return;
    this.warehousesService.getAll({ pageSize: 100 }).subscribe((res) => {
      this.warehouses = res.items;
    });
    this.receiveForm = this.fb.group({
      warehouseId: ['', Validators.required],
      receivedDate: [new Date(), Validators.required],
      notes: [''],
      lines: this.fb.array(
        (this.order?.lines ?? []).map((line) =>
          this.fb.group({
            purchaseOrderLineId: [line.id ?? '', Validators.required],
            receivedQuantity: [
              line.quantity - (line.receivedQuantity ?? 0),
              [Validators.required, Validators.min(0)],
            ],
            notes: [''],
          }),
        ),
      ),
    });
    this.showReceiveModal = true;
  }

  submitReceive(): void {
    if (!this.orderId || !this.receiveForm || this.receiveForm.invalid) {
      this.receiveForm?.markAllAsTouched();
      return;
    }
    const v = this.receiveForm.value;
    this.actionLoading = true;
    this.purchaseOrdersService
      .receivePurchaseOrder({
        purchaseOrderId: this.orderId,
        warehouseId: v.warehouseId,
        receivedDate: new Date(v.receivedDate).toISOString(),
        notes: v.notes,
        lines: v.lines,
      })
      .pipe(finalize(() => (this.actionLoading = false)))
      .subscribe({
        next: (updated) => {
          this.message.success('Goods received');
          this.order = updated;
          this.showReceiveModal = false;
        },
        error: (err) =>
          this.message.error('Receive failed: ' + (err?.message ?? 'Unknown error')),
      });
  }

  openSupplierInvoiceModal(): void {
    if (!this.order) return;
    const defaultNumber = `SI-${this.order.orderNumber}`;
    this.supplierInvoiceForm = this.fb.group({
      invoiceNumber: [defaultNumber, Validators.required],
      currency: ['USD', Validators.required],
      lines: this.fb.array(
        (this.order.lines ?? []).map((line) =>
          this.fb.group({
            productId: [line.productId, Validators.required],
            quantity: [line.quantity, [Validators.required, Validators.min(1)]],
            unitPrice: [line.unitPrice, [Validators.required, Validators.min(0)]],
          }),
        ),
      ),
    });
    this.showSupplierInvoiceModal = true;
  }

  submitSupplierInvoice(): void {
    if (!this.order || !this.supplierInvoiceForm || this.supplierInvoiceForm.invalid) {
      this.supplierInvoiceForm?.markAllAsTouched();
      return;
    }
    const v = this.supplierInvoiceForm.value;
    const dto: CreateSupplierInvoiceDto = {
      invoiceNumber: v.invoiceNumber,
      supplierId: this.order.supplierId,
      purchaseOrderId: this.order.id,
      currency: v.currency,
      lines: v.lines,
    };
    this.actionLoading = true;
    this.supplierInvoicesService
      .create(dto)
      .pipe(finalize(() => (this.actionLoading = false)))
      .subscribe({
        next: () => {
          this.message.success('Supplier invoice created');
          this.showSupplierInvoiceModal = false;
          this.loadSupplierInvoices(this.order!.id);
        },
        error: (err) =>
          this.message.error('Failed to create supplier invoice: ' + (err?.message ?? 'Unknown')),
      });
  }

  runMatch(): void {
    if (!this.orderId) return;
    this.actionLoading = true;
    this.purchaseOrdersService
      .matchPurchaseOrder(this.orderId)
      .pipe(finalize(() => (this.actionLoading = false)))
      .subscribe({
        next: (result) => {
          this.matchResult = result;
          this.message.success('Match completed');
          if (this.order) {
            this.order = {
              ...this.order,
              matchStatus: result.matchStatus,
              matchedAt: result.matchedAt,
            };
          }
        },
        error: (err) => this.message.error('Match failed: ' + (err?.message ?? 'Unknown')),
      });
  }

  get supplierInvoiceLines(): FormArray {
    return this.supplierInvoiceForm.get('lines') as FormArray;
  }

  get receiveLines(): FormArray {
    return this.receiveForm.get('lines') as FormArray;
  }

  getMatchStatusLabel(status: PurchaseOrderMatchStatus | string | number | undefined): string {
    return resolvePurchaseOrderMatchStatusLabel(status);
  }

  getMatchStatusColor(status: PurchaseOrderMatchStatus | string | number | undefined): string {
    return getPurchaseOrderMatchStatusColor(status);
  }

  getStatusLabel(status: unknown): string {
    return resolvePurchaseOrderStatusLabel(status as string | number | undefined);
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

    this.purchaseOrdersService.create(payload).subscribe({
      next: () => {
        this.message.success('Purchase order created successfully');
        this.router.navigate(['/purchasing/orders']);
      },
      error: (err) => {
        this.message.error('Failed to create purchase order: ' + (err.message || 'Unknown error'));
        this.submitting = false;
      },
    });
  }

  getStatusColor(status: unknown): string {
    return getPurchaseOrderStatusColor(status as string | number | undefined);
  }
}
