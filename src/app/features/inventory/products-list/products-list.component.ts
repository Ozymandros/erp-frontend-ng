import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { ProductsService } from '../../../core/services/products.service';
import { ProductDto } from '../../../types/api.types';
import { FileUtils } from '../../../core/utils/file-utils';
import { finalize } from 'rxjs';

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
    NzTagModule,
    NzModalModule
  ],
  templateUrl: './products-list.component.html',
  styleUrls: ['./products-list.component.css']
})
export class ProductsListComponent implements OnInit {
  products: ProductDto[] = [];
  loading = false;
  searchText = '';
  pageIndex = 1;
  pageSize = 10;
  total = 0;

  constructor(
    private productsService: ProductsService,
    private message: NzMessageService,
    private modal: NzModalService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading = true;
    this.productsService.getProducts({
      page: this.pageIndex,
      pageSize: this.pageSize,
      search: this.searchText
    })
    .pipe(
      finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
      })
    )
    .subscribe({
      next: (response: any) => {
        this.products = response?.items || (Array.isArray(response) ? response : []);
        this.total = response?.total || (Array.isArray(response) ? response.length : 0);
      },
      error: (error) => {
        this.message.error('Failed to load products: ' + error.message);
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
        this.productsService.deleteProduct(product.id).subscribe({
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

  exportToXlsx(): void {
    this.productsService.exportToXlsx().subscribe({
      next: (blob) => {
        FileUtils.saveFile(blob, 'products.xlsx');
        this.message.success('Products exported to XLSX successfully');
      },
      error: () => {
        this.message.error('Failed to export products to XLSX');
      }
    });
  }

  exportToPdf(): void {
    this.productsService.exportToPdf().subscribe({
      next: (blob) => {
        FileUtils.saveFile(blob, 'products.pdf');
        this.message.success('Products exported to PDF successfully');
      },
      error: () => {
        this.message.error('Failed to export products to PDF');
      }
    });
  }
}
