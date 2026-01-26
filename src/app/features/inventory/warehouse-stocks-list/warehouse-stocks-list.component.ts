import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzCardModule } from 'ng-zorro-antd/card';
import { WarehouseStocksService } from '../../../core/services/warehouse-stocks.service';
import { WarehouseStockDto } from '../../../types/api.types';
import { FileUtils } from '../../../core/utils/file-utils';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-warehouse-stocks-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzTableModule,
    NzButtonModule,
    NzInputModule,
    NzIconModule,
    NzTagModule,
    NzCardModule
  ],
  template: `
    <div class="page-header" style="margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
      <h1 style="margin: 0;">Warehouse Stocks</h1>
      <div style="display: flex; gap: 8px; flex-wrap: wrap;">
        <button nz-button (click)="exportToXlsx()">
          <i nz-icon nzType="file-excel"></i> Export XLSX
        </button>
        <button nz-button (click)="exportToPdf()">
          <i nz-icon nzType="file-pdf"></i> Export PDF
        </button>


      </div>
    </div>

    <nz-card>
      <div style="margin-bottom: 16px; display: flex; gap: 16px; max-width: 400px;">
        <nz-input-group [nzPrefix]="prefixIconSearch">
          <input type="text" nz-input placeholder="Search products in warehouses..." [(ngModel)]="searchTerm" (ngModelChange)="onSearch()" />
        </nz-input-group>
        <ng-template #prefixIconSearch>
          <i nz-icon nzType="search"></i>
        </ng-template>
      </div>

      <nz-table
        #basicTable
        [nzData]="stocks"
        [nzLoading]="loading"
        [nzTotal]="total"
        [(nzPageIndex)]="pageIndex"
        [(nzPageSize)]="pageSize"
        [nzFrontPagination]="false"
        (nzPageIndexChange)="loadStocks()"
        (nzPageSizeChange)="loadStocks()"
        [nzScroll]="{ x: '1000px', y: 'calc(100vh - 400px)' }"
      >

        <thead>
          <tr>
            <th>Warehouse</th>
            <th>Product</th>
            <th>Current Stock</th>
            <th>Reorder Level</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let data of basicTable.data">
            <td>{{ data.warehouseName }}</td>
            <td><strong>{{ data.productName }}</strong> ({{ data.productSku }})</td>
            <td>{{ data.quantity }}</td>
            <td>{{ data.reorderLevel }}</td>
            <td>
              <nz-tag [nzColor]="data.quantity <= data.reorderLevel ? 'warning' : 'success'">
                {{ data.quantity <= data.reorderLevel ? 'Low Stock' : 'In Stock' }}
              </nz-tag>
            </td>
          </tr>
        </tbody>
      </nz-table>
    </nz-card>
  `,
  styles: []
})
export class WarehouseStocksListComponent implements OnInit {
  stocks: WarehouseStockDto[] = [];
  loading = true;
  total = 0;
  pageIndex = 1;
  pageSize = 10;
  searchTerm = '';

  constructor(
    private warehouseStocksService: WarehouseStocksService,
    private message: NzMessageService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadStocks();
  }

  loadStocks(): void {
    this.loading = true;
    this.warehouseStocksService.getWarehouseStocks({
      page: this.pageIndex,
      pageSize: this.pageSize,
      search: this.searchTerm
    }).pipe(
      finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (response: any) => {
        this.stocks = response?.items || (Array.isArray(response) ? response : []);
        this.total = response?.total || (Array.isArray(response) ? response.length : 0);
      },
      error: () => {
        this.message.error('Failed to load warehouse stocks');
      }
    });
  }


  onSearch(): void {
    this.pageIndex = 1;
    this.loadStocks();
  }

  exportToXlsx(): void {
    this.warehouseStocksService.exportToXlsx().subscribe({
      next: (blob) => {
        FileUtils.saveFile(blob, 'warehouse-stocks.xlsx');
        this.message.success('Warehouse stocks exported to XLSX successfully');
      },
      error: () => {
        this.message.error('Failed to export warehouse stocks to XLSX');
      }
    });
  }

  exportToPdf(): void {
    this.warehouseStocksService.exportToPdf().subscribe({
      next: (blob) => {
        FileUtils.saveFile(blob, 'warehouse-stocks.pdf');
        this.message.success('Warehouse stocks exported to PDF successfully');
      },
      error: () => {
        this.message.error('Failed to export warehouse stocks to PDF');
      }
    });
  }
}
