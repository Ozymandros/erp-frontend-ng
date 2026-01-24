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
import { SalesOrdersService } from '../../../core/services/sales-orders.service';
import { SalesOrderDto } from '../../../types/api.types';
import { FileUtils } from '../../../core/utils/file-utils';

@Component({
  selector: 'app-sales-orders-list',
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
  templateUrl: './sales-orders-list.component.html',
  styleUrls: ['./sales-orders-list.component.css']
})
export class SalesOrdersListComponent implements OnInit {
  orders: SalesOrderDto[] = [];
  loading = true;
  total = 0;
  pageIndex = 1;
  pageSize = 10;
  searchTerm = '';

  constructor(
    private salesOrdersService: SalesOrdersService,
    private message: NzMessageService
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading = true;
    this.salesOrdersService.getSalesOrders({
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
        this.message.error('Failed to load sales orders');
        this.loading = false;
      }
    });
  }

  onSearch(): void {
    this.pageIndex = 1;
    this.loadOrders();
  }

  deleteOrder(id: string): void {
    this.salesOrdersService.deleteSalesOrder(id).subscribe({
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
      case 'Shipped': return 'cyan';
      case 'Delivered': return 'green';
      case 'Cancelled': return 'red';
      default: return 'default';
    }
  }

  exportToXlsx(): void {
    this.salesOrdersService.exportToXlsx().subscribe({
      next: (blob) => {
        FileUtils.saveFile(blob, 'sales-orders.xlsx');
        this.message.success('Sales orders exported to XLSX successfully');
      },
      error: () => {
        this.message.error('Failed to export sales orders to XLSX');
      }
    });
  }

  exportToPdf(): void {
    this.salesOrdersService.exportToPdf().subscribe({
      next: (blob) => {
        FileUtils.saveFile(blob, 'sales-orders.pdf');
        this.message.success('Sales orders exported to PDF successfully');
      },
      error: () => {
        this.message.error('Failed to export sales orders to PDF');
      }
    });
  }
}
