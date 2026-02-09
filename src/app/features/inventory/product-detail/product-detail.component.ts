import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { ProductsService } from '../../../core/services/products.service';
import { 
  AppButtonComponent, 
  AppInputComponent, 
  AppTextareaComponent, 
  AppInputNumberComponent 
} from '../../../shared/components';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    NzFormModule,
    NzCardModule,
    NzTypographyModule,
    AppButtonComponent,
    AppInputComponent,
    AppTextareaComponent,
    AppInputNumberComponent
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
    private readonly fb: FormBuilder,
    private readonly productsService: ProductsService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly message: NzMessageService
  ) {
    this.productForm = this.fb.group({
      sku: ['', [Validators.required]],
      name: ['', [Validators.required]],
      description: [''],
      unitPrice: [0, [Validators.required]],
      quantityInStock: [0, [Validators.required]],
      reorderLevel: [10]
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
    this.productsService.getById(id).subscribe({
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
        ? this.productsService.update(this.productId, data)
        : this.productsService.create(data);


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
