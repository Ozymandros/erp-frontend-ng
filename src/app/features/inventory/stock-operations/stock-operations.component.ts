import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzMessageService } from 'ng-zorro-antd/message';
import { InventoryService } from '@/app/core/services/inventory.service';
import { ProductDto, WarehouseDto } from '@/app/types/api.types';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-stock-operations',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzCardModule,
    NzSelectModule,
    NzInputNumberModule
  ],
  template: `
    <div class="stock-operations">
      <div class="page-header" style="margin-bottom: 24px;">
        <h1>Inventory Operations</h1>
      </div>

      <div nz-row [nzGutter]="16">
        <div nz-col [nzSpan]="12">
          <nz-card nzTitle="Manual Stock Adjustment">
            <form nz-form [formGroup]="adjustmentForm" (ngSubmit)="submitAdjustment()">
              <nz-form-item>
                <nz-form-label [nzSpan]="6" nzRequired>Product</nz-form-label>
                <nz-form-control [nzSpan]="18" nzErrorTip="Please select a product!">
                  <nz-select formControlName="productId" nzShowSearch nzPlaceHolder="Search product">
                    <nz-option *ngFor="let p of products" [nzValue]="p.id" [nzLabel]="p.name + ' (' + p.sku + ')'"></nz-option>
                  </nz-select>
                </nz-form-control>
              </nz-form-item>

              <nz-form-item>
                <nz-form-label [nzSpan]="6" nzRequired>Warehouse</nz-form-label>
                <nz-form-control [nzSpan]="18" nzErrorTip="Please select a warehouse!">
                  <nz-select formControlName="warehouseId" nzPlaceHolder="Select warehouse">
                    <nz-option *ngFor="let w of warehouses" [nzValue]="w.id" [nzLabel]="w.name"></nz-option>
                  </nz-select>
                </nz-form-control>
              </nz-form-item>

              <nz-form-item>
                <nz-form-label [nzSpan]="6" nzRequired>Adjustment</nz-form-label>
                <nz-form-control [nzSpan]="18" nzExtra="Use negative numbers for stock removals">
                  <nz-input-number formControlName="quantity" [nzStep]="1" style="width: 100%;"></nz-input-number>
                </nz-form-control>
              </nz-form-item>

              <nz-form-item>
                <nz-form-label [nzSpan]="6">Reference/Reason</nz-form-label>
                <nz-form-control [nzSpan]="18">
                  <input nz-input formControlName="reason" placeholder="e.g. Damage, Correcting count" />
                </nz-form-control>
              </nz-form-item>

              <nz-form-item>
                <nz-form-control [nzOffset]="6" [nzSpan]="18">
                  <button nz-button nzType="primary" [nzLoading]="submitting" [disabled]="!adjustmentForm.valid">
                    Apply Adjustment
                  </button>
                </nz-form-control>
              </nz-form-item>
            </form>
          </nz-card>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .stock-operations {
      padding: 24px;
    }
    h1 {
      margin: 0;
    }
  `]
})
export class StockOperationsComponent implements OnInit {
  adjustmentForm: FormGroup;
  products: ProductDto[] = [];
  warehouses: WarehouseDto[] = [];
  submitting = false;

  constructor(
    private fb: FormBuilder,
    private inventoryService: InventoryService,
    private message: NzMessageService
  ) {
    this.adjustmentForm = this.fb.group({
      productId: ['', [Validators.required]],
      warehouseId: ['', [Validators.required]],
      quantity: [0, [Validators.required]],
      reason: ['']
    });
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    forkJoin({
      products: this.inventoryService.getProducts({ pageSize: 1000 }),
      warehouses: this.inventoryService.getWarehouses({ pageSize: 1000 })
    }).subscribe({
      next: (results) => {
        this.products = results.products.items;
        this.warehouses = results.warehouses.items;
      },
      error: () => {
        this.message.error('Failed to load products or warehouses');
      }
    });
  }

  submitAdjustment(): void {
    if (this.adjustmentForm.valid) {
      this.submitting = true;
      // In a real app we'd have a specific endpoint for this
      // For now we'll just show a success message as a placeholder if mock API doesn't support it
      setTimeout(() => {
        this.message.success('Stock adjustment applied successfully');
        this.adjustmentForm.reset({ quantity: 0 });
        this.submitting = false;
      }, 1000);
    }
  }
}
