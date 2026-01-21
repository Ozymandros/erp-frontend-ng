import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzCardModule } from 'ng-zorro-antd/card';
import { InventoryService } from '@/app/core/services/inventory.service';
import { WarehouseStockDto } from '@/app/types/api.types';

@Component({
  selector: 'app-warehouse-stocks-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzTableModule,
    NzInputModule,
    NzIconModule,
    NzTagModule,
    NzCardModule
  ],
  template: `
    <div class="page-header" style="margin-bottom: 24px;">
      <h1>Warehouse Stocks</h1>
    </div>

    <nz-card>
      <div style="margin-bottom: 16px; display: flex; gap: 16px;">
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
  styles: [`
    h1 {
      margin: 0;
    }
  `]
})
export class WarehouseStocksListComponent implements OnInit {
  stocks: WarehouseStockDto[] = [];
  loading = true;
  total = 0;
  pageIndex = 1;
  pageSize = 10;
  searchTerm = '';

  constructor(
    private inventoryService: InventoryService,
    private message: NzMessageService
  ) {}

  ngOnInit(): void {
    this.loadStocks();
  }

  loadStocks(): void {
    this.loading = true;
    this.inventoryService.getWarehouseStocks({
      page: this.pageIndex,
      pageSize: this.pageSize,
      search: this.searchTerm
    }).subscribe({
      next: (response) => {
        this.stocks = response.items;
        this.total = response.total;
        this.loading = false;
      },
      error: () => {
        this.message.error('Failed to load warehouse stocks');
        this.loading = false;
      }
    });
  }

  onSearch(): void {
    this.pageIndex = 1;
    this.loadStocks();
  }
}
