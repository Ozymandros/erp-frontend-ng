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
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzCardModule } from 'ng-zorro-antd/card';
import { PurchaseOrdersService } from '../../../core/services/purchase-orders.service';
import { PurchaseOrderDto } from '../../../types/api.types';
import { FileUtils } from '../../../core/utils/file-utils';

@Component({
  selector: 'app-purchase-orders-list',
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
    NzPopconfirmModule,
    NzCardModule
  ],
  template: `
    <div class="page-header" style="margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center;">
      <h1>Purchase Orders</h1>
      <div>
        <button nz-button (click)="exportToXlsx()" style="margin-right: 8px;">
          <i nz-icon nzType="file"></i> Export XLSX
        </button>
        <button nz-button (click)="exportToPdf()" style="margin-right: 8px;">
          <i nz-icon nzType="file"></i> Export PDF
        </button>
        <button nz-button nzType="primary" routerLink="/purchasing/orders/new">
          <i nz-icon nzType="plus"></i> New Purchase Order
        </button>
      </div>
    </div>

    <nz-card>
      <div style="margin-bottom: 16px; display: flex; gap: 16px;">
        <nz-input-group [nzPrefix]="prefixIconSearch">
          <input type="text" nz-input placeholder="Search purchase orders..." [(ngModel)]="searchTerm" (ngModelChange)="onSearch()" />
        </nz-input-group>
        <ng-template #prefixIconSearch>
          <i nz-icon nzType="search"></i>
        </ng-template>
      </div>

      <nz-table
        #basicTable
        [nzData]="orders"
        [nzLoading]="loading"
        [nzTotal]="total"
        [(nzPageIndex)]="pageIndex"
        [(nzPageSize)]="pageSize"
        [nzFrontPagination]="false"
        (nzPageIndexChange)="loadOrders()"
        (nzPageSizeChange)="loadOrders()"
      >
        <thead>
          <tr>
            <th>Order #</th>
            <th>Supplier</th>
            <th>Date</th>
            <th>Total Amount</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let data of basicTable.data">
            <td><strong>{{ data.orderNumber }}</strong></td>
            <td>{{ data.supplierName }}</td>
            <td>{{ data.orderDate | date:'shortDate' }}</td>
            <td>\${{ data.totalAmount.toFixed(2) }}</td>
            <td>
              <nz-tag [nzColor]="getStatusColor(data.status)">
                {{ data.status }}
              </nz-tag>
            </td>
            <td>
              <a [routerLink]="['/purchasing/orders', data.id]" style="margin-right: 8px;">View</a>
              <a
                nz-popconfirm
                nzPopconfirmTitle="Are you sure cancel this order?"
                (nzOnConfirm)="deleteOrder(data.id)"
                nzPopconfirmPlacement="left"
                style="color: #ff4d4f;"
              >Cancel</a>
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
export class PurchaseOrdersListComponent implements OnInit {
  orders: PurchaseOrderDto[] = [];
  loading = true;
  total = 0;
  pageIndex = 1;
  pageSize = 10;
  searchTerm = '';

  constructor(
    private purchaseOrdersService: PurchaseOrdersService,
    private message: NzMessageService
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading = true;
    this.purchaseOrdersService.getPurchaseOrders({
      page: this.pageIndex,
      pageSize: this.pageSize,
      search: this.searchTerm
    }).subscribe({
      next: (response) => {
        this.orders = response.items;
        this.total = response.total;
        this.loading = false;
      },
      error: () => {
        this.message.error('Failed to load purchase orders');
        this.loading = false;
      }
    });
  }

  onSearch(): void {
    this.pageIndex = 1;
    this.loadOrders();
  }

  deleteOrder(id: string): void {
    this.purchaseOrdersService.deletePurchaseOrder(id).subscribe({
      next: () => {
        this.message.success('Order cancelled successfully');
        this.loadOrders();
      },
      error: () => {
        this.message.error('Failed to cancel order');
      }
    });
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'Draft': return 'default';
      case 'Pending': return 'orange';
      case 'Confirmed': return 'blue';
      case 'Received': return 'green';
      case 'Cancelled': return 'red';
      default: return 'default';
    }
  }

  exportToXlsx(): void {
    this.purchaseOrdersService.exportToXlsx().subscribe({
      next: (blob) => {
        FileUtils.saveFile(blob, 'purchase-orders.xlsx');
        this.message.success('Purchase orders exported to XLSX successfully');
      },
      error: () => {
        this.message.error('Failed to export purchase orders to XLSX');
      }
    });
  }

  exportToPdf(): void {
    this.purchaseOrdersService.exportToPdf().subscribe({
      next: (blob) => {
        FileUtils.saveFile(blob, 'purchase-orders.pdf');
        this.message.success('Purchase orders exported to PDF successfully');
      },
      error: () => {
        this.message.error('Failed to export purchase orders to PDF');
      }
    });
  }
}
