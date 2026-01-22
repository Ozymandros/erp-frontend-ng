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
import { ProductsService } from '../../../core/services/products.service';
import { ProductDto } from '../../../types/api.types';

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
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css']
})
export class ProductDetailComponent implements OnInit {
  productForm: FormGroup;
  productId: string | null = null;
  isEditMode = false;
  loading = false;
  saving = false;

  constructor(
    private fb: FormBuilder,
    private productsService: ProductsService,
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
    this.productsService.getProductById(id).subscribe({
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
        ? this.productsService.updateProduct(this.productId, data)
        : this.productsService.createProduct(data);

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
