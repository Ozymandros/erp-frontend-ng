import { Component, OnInit } from '@angular/core';
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
    <div class="page-header" style="margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center;">
      <h1>Inventory Transactions</h1>
      <div>
        <button nz-button (click)="exportToXlsx()" style="margin-right: 8px;">
          <i nz-icon nzType="file"></i> Export XLSX
        </button>
        <button nz-button (click)="exportToPdf()" style="margin-right: 8px;">
          <i nz-icon nzType="file"></i> Export PDF
        </button>
      </div>
    </div>

    <nz-card>
      <div style="margin-bottom: 16px; display: flex; gap: 16px;">
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
            <td><strong>{{ data.productName }}</strong></td>
            <td>{{ data.warehouseName }}</td>
            <td [style.color]="data.transactionType === 'Adjustment' || data.transactionType === 'Sale' ? '#cf1322' : '#3f8600'">
              {{ (data.transactionType === 'Adjustment' || data.transactionType === 'Sale' ? '-' : '+') + data.quantity }}
            </td>
            <td>{{ data.createdAt | date:'short' }}</td>
            <td><small>{{ data.referenceNumber || '-' }}</small></td>
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
export class InventoryTransactionsListComponent implements OnInit {
  transactions: InventoryTransactionDto[] = [];
  loading = true;
  total = 0;
  pageIndex = 1;
  pageSize = 10;
  searchTerm = '';

  constructor(
    private inventoryTransactionsService: InventoryTransactionsService,
    private message: NzMessageService
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
    }).subscribe({
      next: (response: any) => {
        this.transactions = response.items;
        this.total = response.total;
        this.loading = false;
      },
      error: () => {
        this.message.error('Failed to load transactions');
        this.loading = false;
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
