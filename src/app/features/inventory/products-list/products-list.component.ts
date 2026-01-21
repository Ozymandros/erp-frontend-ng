import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { InventoryService } from '@/app/core/services/inventory.service';
import { ProductDto } from '@/app/types/api.types';

@Component({
  selector: 'app-products-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    NzTableModule,
    NzButtonModule,
    NzInputModule,
    NzIconModule,
    NzTagModule
  ],
  template: `
    <div class="products-list">
      <div class="page-header">
        <h1>Products Management</h1>
        <button nz-button nzType="primary" routerLink="/inventory/products/new">
          <span nz-icon nzType="plus"></span>
          Add Product
        </button>
      </div>

      <div class="search-bar">
        <nz-input-group [nzSuffix]="suffixIconSearch">
          <input 
            type="text" 
            nz-input 
            placeholder="Search products..." 
            [(ngModel)]="searchText"
            (ngModelChange)="onSearch()"
          />
        </nz-input-group>
        <ng-template #suffixIconSearch>
          <span nz-icon nzType="search"></span>
        </ng-template>
      </div>

      <nz-table
        #productsTable
        [nzData]="products"
        [nzLoading]="loading"
        [nzPageSize]="pageSize"
        [nzPageIndex]="pageIndex"
        [nzTotal]="total"
        [nzFrontPagination]="false"
        (nzPageIndexChange)="onPageChange($event)"
        (nzPageSizeChange)="onPageSizeChange($event)"
      >
        <thead>
          <tr>
            <th>SKU</th>
            <th>Name</th>
            <th>Category</th>
            <th>Unit Price</th>
            <th>Stock</th>
            <th>Status</th>
            <th nzWidth="150px">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let product of productsTable.data">
            <td><strong>{{ product.sku }}</strong></td>
            <td>{{ product.name }}</td>
            <td>{{ product.category || '-' }}</td>
            <td>\${{ product.unitPrice.toFixed(2) }}</td>
            <td>
              <nz-tag [nzColor]="product.stock <= product.reorderLevel ? 'red' : 'green'">
                {{ product.stock }}
              </nz-tag>
            </td>
            <td>
              <nz-tag [nzColor]="product.isActive ? 'success' : 'default'">
                {{ product.isActive ? 'Active' : 'Inactive' }}
              </nz-tag>
            </td>
            <td>
              <button 
                nz-button 
                nzType="link" 
                nzSize="small"
                [routerLink]="['/inventory/products', product.id]"
              >
                <span nz-icon nzType="edit"></span>
                Edit
              </button>
              <button 
                nz-button 
                nzType="link" 
                nzSize="small"
                nzDanger
                (click)="deleteProduct(product)"
              >
                <span nz-icon nzType="delete"></span>
                Delete
              </button>
            </td>
          </tr>
        </tbody>
      </nz-table>
    </div>
  `,
  styles: [`
    .products-list {
      padding: 24px;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .page-header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 500;
    }

    .search-bar {
      margin-bottom: 16px;
      max-width: 400px;
    }

    nz-tag {
      margin-right: 4px;
    }
  `]
})
export class ProductsListComponent implements OnInit {
  products: ProductDto[] = [];
  loading = false;
  searchText = '';
  pageIndex = 1;
  pageSize = 10;
  total = 0;

  constructor(
    private inventoryService: InventoryService,
    private message: NzMessageService,
    private modal: NzModalService
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading = true;
    this.inventoryService.getProducts({
      page: this.pageIndex,
      pageSize: this.pageSize,
      search: this.searchText
    }).subscribe({
      next: (response) => {
        this.products = response.items;
        this.total = response.total;
        this.loading = false;
      },
      error: (error) => {
        this.message.error('Failed to load products: ' + error.message);
        this.loading = false;
      }
    });
  }

  onSearch(): void {
    this.pageIndex = 1;
    this.loadProducts();
  }

  onPageChange(page: number): void {
    this.pageIndex = page;
    this.loadProducts();
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.pageIndex = 1;
    this.loadProducts();
  }

  deleteProduct(product: ProductDto): void {
    this.modal.confirm({
      nzTitle: 'Delete Product',
      nzContent: `Are you sure you want to delete product "${product.name}"?`,
      nzOkText: 'Delete',
      nzOkDanger: true,
      nzOnOk: () => {
        this.inventoryService.deleteProduct(product.id).subscribe({
          next: () => {
            this.message.success('Product deleted successfully');
            this.loadProducts();
          },
          error: (error) => {
            this.message.error('Failed to delete product: ' + error.message);
          }
        });
      }
    });
  }
}
