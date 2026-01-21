import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzMessageService } from 'ng-zorro-antd/message';
import { InventoryService } from '@/app/core/services/inventory.service';
import { ProductDto } from '@/app/types/api.types';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    NzFormModule,
    NzInputModule,
    NzInputNumberModule,
    NzButtonModule,
    NzCardModule,
    NzSelectModule,
    NzSwitchModule
  ],
  template: `
    <div class="product-detail">
      <div class="page-header">
        <button nz-button nzType="default" routerLink="/inventory/products">
          <span nz-icon nzType="arrow-left"></span>
          Back to List
        </button>
        <h1>{{ isEditMode ? 'Edit Product' : 'Create Product' }}</h1>
      </div>

      <nz-card [nzLoading]="loading">
        <form nz-form [formGroup]="productForm" (ngSubmit)="save()">
          <div nz-row [nzGutter]="16">
            <div nz-col [nzSpan]="12">
              <nz-form-item>
                <nz-form-label nzRequired>SKU</nz-form-label>
                <nz-form-control nzErrorTip="Please input SKU!">
                  <input nz-input formControlName="sku" placeholder="SKU" />
                </nz-form-control>
              </nz-form-item>
            </div>
            <div nz-col [nzSpan]="12">
              <nz-form-item>
                <nz-form-label nzRequired>Name</nz-form-label>
                <nz-form-control nzErrorTip="Please input product name!">
                  <input nz-input formControlName="name" placeholder="Product Name" />
                </nz-form-control>
              </nz-form-item>
            </div>
          </div>

          <nz-form-item>
            <nz-form-label>Description</nz-form-label>
            <nz-form-control>
              <textarea nz-input formControlName="description" [nzAutosize]="{ minRows: 2, maxRows: 6 }" placeholder="Product Description"></textarea>
            </nz-form-control>
          </nz-form-item>

          <div nz-row [nzGutter]="16">
            <div nz-col [nzSpan]="12">
              <nz-form-item>
                <nz-form-label>Category</nz-form-label>
                <nz-form-control>
                  <input nz-input formControlName="category" placeholder="Category" />
                </nz-form-control>
              </nz-form-item>
            </div>
            <div nz-col [nzSpan]="12">
              <nz-form-item>
                <nz-form-label nzRequired>Unit Price</nz-form-label>
                <nz-form-control nzErrorTip="Please input unit price!">
                  <nz-input-number formControlName="unitPrice" [nzMin]="0" [nzStep]="0.01" style="width: 100%"></nz-input-number>
                </nz-form-control>
              </nz-form-item>
            </div>
          </div>

          <div nz-row [nzGutter]="16">
            <div nz-col [nzSpan]="12">
              <nz-form-item>
                <nz-form-label nzRequired>Initial Stock</nz-form-label>
                <nz-form-control nzErrorTip="Please input initial stock!">
                  <nz-input-number formControlName="stock" [nzMin]="0" [nzPrecision]="0" style="width: 100%"></nz-input-number>
                </nz-form-control>
              </nz-form-item>
            </div>
            <div nz-col [nzSpan]="12">
              <nz-form-item>
                <nz-form-label>Reorder Level</nz-form-label>
                <nz-form-control>
                  <nz-input-number formControlName="reorderLevel" [nzMin]="0" [nzPrecision]="0" style="width: 100%"></nz-input-number>
                </nz-form-control>
              </nz-form-item>
            </div>
          </div>

          <div nz-row [nzGutter]="16">
            <div nz-col [nzSpan]="12">
              <nz-form-item>
                <nz-form-label>Barcode</nz-form-label>
                <nz-form-control>
                  <input nz-input formControlName="barcode" placeholder="Barcode" />
                </nz-form-control>
              </nz-form-item>
            </div>
            <div nz-col [nzSpan]="12">
              <nz-form-item>
                <nz-form-label>Active</nz-form-label>
                <nz-form-control>
                  <nz-switch formControlName="isActive"></nz-switch>
                </nz-form-control>
              </nz-form-item>
            </div>
          </div>

          <div class="form-actions">
            <button nz-button nzType="primary" [nzLoading]="saving" [disabled]="!productForm.valid">
              {{ isEditMode ? 'Update' : 'Create' }}
            </button>
            <button nz-button nzType="default" type="button" routerLink="/inventory/products">Cancel</button>
          </div>
        </form>
      </nz-card>
    </div>
  `,
  styles: [`
    .product-detail {
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
export class ProductDetailComponent implements OnInit {
  productForm: FormGroup;
  productId: string | null = null;
  isEditMode = false;
  loading = false;
  saving = false;

  constructor(
    private fb: FormBuilder,
    private inventoryService: InventoryService,
    private route: ActivatedRoute,
    private router: Router,
    private message: NzMessageService
  ) {
    this.productForm = this.fb.group({
      sku: ['', [Validators.required]],
      name: ['', [Validators.required]],
      description: [''],
      category: [''],
      unitPrice: [0, [Validators.required]],
      stock: [0, [Validators.required]],
      reorderLevel: [10],
      barcode: [''],
      isActive: [true]
    });
  }

  ngOnInit(): void {
    this.productId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.productId && this.productId !== 'new';
    
    if (this.isEditMode && this.productId) {
      this.loadProduct(this.productId);
    }
  }

  loadProduct(id: string): void {
    this.loading = true;
    this.inventoryService.getProductById(id).subscribe({
      next: (product) => {
        this.productForm.patchValue(product);
        this.loading = false;
      },
      error: (err) => {
        this.message.error('Failed to load product: ' + err.message);
        this.loading = false;
      }
    });
  }

  save(): void {
    if (this.productForm.valid) {
      this.saving = true;
      const data = this.productForm.value;

      const observable = this.isEditMode && this.productId
        ? this.inventoryService.updateProduct(this.productId, data)
        : this.inventoryService.createProduct(data);

      observable.subscribe({
        next: () => {
          this.message.success(`Product ${this.isEditMode ? 'updated' : 'created'} successfully`);
          this.router.navigate(['/inventory/products']);
        },
        error: (err) => {
          this.message.error(`Failed to ${this.isEditMode ? 'update' : 'create'} product: ` + err.message);
          this.saving = false;
        }
      });
    }
  }
}
