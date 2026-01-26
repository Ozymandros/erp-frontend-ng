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
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzCardModule } from 'ng-zorro-antd/card';
import { PurchaseOrdersService } from '../../../core/services/purchase-orders.service';
import { PurchaseOrderDto } from '../../../types/api.types';
import { FileUtils } from '../../../core/utils/file-utils';
import { finalize } from 'rxjs';

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
    <div class="page-header" style="margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
      <h1 style="margin: 0;">Purchase Orders</h1>
      <div style="display: flex; gap: 8px; flex-wrap: wrap;">
        <button nz-button (click)="exportToXlsx()">
          <i nz-icon nzType="file-excel"></i> Export XLSX
        </button>
        <button nz-button (click)="exportToPdf()">
          <i nz-icon nzType="file-pdf"></i> Export PDF
        </button>


        <button nz-button nzType="primary" routerLink="/purchasing/orders/new">
          <i nz-icon nzType="plus"></i> New Purchase Order
        </button>
      </div>
    </div>

    <nz-card>
      <div style="margin-bottom: 16px; display: flex; gap: 16px; max-width: 400px;">
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
        [nzScroll]="{ x: '1000px', y: 'calc(100vh - 400px)' }"
      >

        <thead>
          <tr>
            <th>Order #</th>
            <th>Supplier</th>
            <th>Date</th>
            <th>Total Amount</th>
            <th>Status</th>
            <th nzWidth="150px">Actions</th>
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
  styles: []
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
    private message: NzMessageService,
    private cdr: ChangeDetectorRef
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
    }).pipe(
      finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (response: any) => {
        this.orders = response?.items || (Array.isArray(response) ? response : []);
        this.total = response?.total || (Array.isArray(response) ? response.length : 0);
      },
      error: () => {
        this.message.error('Failed to load purchase orders');
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

  getStatusColor(status: any): string {
    switch (status) {
      case 'Draft': 
      case 0: return 'default';
      case 'Pending':
      case 1: return 'orange';
      case 'Confirmed':
      case 2: return 'blue';
      case 'Received':
      case 3: return 'green';
      case 'Cancelled':
      case 4: return 'red';
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
