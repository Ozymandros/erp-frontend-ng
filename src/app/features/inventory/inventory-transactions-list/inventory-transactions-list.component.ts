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
import { InventoryTransactionsService } from '../../../core/services/inventory-transactions.service';
import { InventoryTransactionDto } from '../../../types/api.types';
import { FileUtils } from '../../../core/utils/file-utils';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-inventory-transactions-list',
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
      <h1 style="margin: 0;">Inventory Transactions</h1>
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
          <input type="text" nz-input placeholder="Search transactions..." [(ngModel)]="searchTerm" (ngModelChange)="onSearch()" />
        </nz-input-group>
        <ng-template #prefixIconSearch>
          <i nz-icon nzType="search"></i>
        </ng-template>
      </div>

      <nz-table
        #basicTable
        [nzData]="transactions"
        [nzLoading]="loading"
        [nzTotal]="total"
        [(nzPageIndex)]="pageIndex"
        [(nzPageSize)]="pageSize"
        [nzFrontPagination]="false"
        (nzPageIndexChange)="loadTransactions()"
        (nzPageSizeChange)="loadTransactions()"
        [nzScroll]="{ x: '1000px', y: 'calc(100vh - 400px)' }"
      >

        <thead>
          <tr>
            <th>Type</th>
            <th>Product</th>
            <th>Warehouse</th>
            <th>Quantity</th>
            <th>Date</th>
            <th>Reference</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let data of basicTable.data">
            <td>
              <nz-tag [nzColor]="getTransactionColor(data.transactionType)">
                {{ data.transactionType }}
              </nz-tag>
            </td>
            <td><strong>{{ data.product?.name || data.productId }}</strong></td>
            <td>{{ data.warehouse?.name || data.warehouseId }}</td>
            <td [style.color]="data.transactionType === 'Adjustment' || data.transactionType === 'Sale' ? '#cf1322' : '#3f8600'">
              {{ (data.transactionType === 'Adjustment' || data.transactionType === 'Sale' ? '-' : '+') + data.quantityChange }}
            </td>
            <td>{{ data.transactionDate | date:'short' }}</td>
            <td><small>{{ data.id }}</small></td>
          </tr>
        </tbody>

      </nz-table>
    </nz-card>
  `,
  styles: []
})
export class InventoryTransactionsListComponent implements OnInit {
  transactions: InventoryTransactionDto[] = [];
  loading = true;
  total = 0;
  pageIndex = 1;
  pageSize = 10;
  searchTerm = '';

  constructor(
    private inventoryTransactionsService: InventoryTransactionsService,
    private message: NzMessageService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadTransactions();
  }

  loadTransactions(): void {
    this.loading = true;
    this.inventoryTransactionsService.getInventoryTransactions({
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
        this.transactions = response?.items || (Array.isArray(response) ? response : []);
        this.total = response?.total || (Array.isArray(response) ? response.length : 0);
      },
      error: () => {
        this.message.error('Failed to load transactions');
      }
    });
  }


  onSearch(): void {
    this.pageIndex = 1;
    this.loadTransactions();
  }

  getTransactionColor(type: string): string {
    switch (type) {
      case 'Purchase': return 'green';
      case 'Sale': return 'blue';
      case 'Transfer': return 'orange';
      case 'Adjustment': return 'red';
      default: return 'default';
    }
  }

  exportToXlsx(): void {
    this.inventoryTransactionsService.exportToXlsx().subscribe({
      next: (blob) => {
        FileUtils.saveFile(blob, 'inventory-transactions.xlsx');
        this.message.success('Transactions exported to XLSX successfully');
      },
      error: () => {
        this.message.error('Failed to export transactions to XLSX');
      }
    });
  }

  exportToPdf(): void {
    this.inventoryTransactionsService.exportToPdf().subscribe({
      next: (blob) => {
        FileUtils.saveFile(blob, 'inventory-transactions.pdf');
        this.message.success('Transactions exported to PDF successfully');
      },
      error: () => {
        this.message.error('Failed to export transactions to PDF');
      }
    });
  }
}
