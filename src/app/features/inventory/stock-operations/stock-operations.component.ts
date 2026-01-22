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
import { StockOperationsService } from '../../../core/services/stock-operations.service';
import { ProductsService } from '../../../core/services/products.service';
import { WarehousesService } from '../../../core/services/warehouses.service';
import { ProductDto, WarehouseDto } from '../../../types/api.types';
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
  templateUrl: './stock-operations.component.html',
  styleUrls: ['./stock-operations.component.css']
})
export class StockOperationsComponent implements OnInit {
  adjustmentForm: FormGroup;
  products: ProductDto[] = [];
  warehouses: WarehouseDto[] = [];
  submitting = false;

  constructor(
    private fb: FormBuilder,
    private stockOperationsService: StockOperationsService,
    private productsService: ProductsService,
    private warehousesService: WarehousesService,
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
      products: this.productsService.getProducts(),
      warehouses: this.warehousesService.getWarehouses()
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
      const data = this.adjustmentForm.value;
      // Assuming this form is specifically for 'adjust' operation
      const obs = this.stockOperationsService.adjust(data);

      obs.subscribe({
        next: () => {
          this.message.success(`Stock adjustment completed successfully`);
          this.adjustmentForm.reset({ quantity: 0 });
          this.submitting = false;
        },
        error: () => this.submitting = false
      });
    }
  }
}
