import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { UsersService } from '@/app/core/services/users.service';
import { InventoryService } from '@/app/core/services/inventory.service';
import { SalesService } from '@/app/core/services/sales.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    NzCardModule,
    NzStatisticModule,
    NzGridModule
  ],
  template: `
    <div class="dashboard" style="padding: 24px;">
      <h1 style="margin-bottom: 24px;">Dashboard Overview</h1>
      <div nz-row [nzGutter]="16">
        <div nz-col [nzSpan]="6">
          <nz-card [nzLoading]="loading">
            <nz-statistic [nzValue]="userCount" nzTitle="Total Users"></nz-statistic>
          </nz-card>
        </div>
        <div nz-col [nzSpan]="6">
          <nz-card [nzLoading]="loading">
            <nz-statistic [nzValue]="productCount" nzTitle="Products"></nz-statistic>
          </nz-card>
        </div>
        <div nz-col [nzSpan]="6">
          <nz-card [nzLoading]="loading">
            <nz-statistic [nzValue]="customerCount" nzTitle="Customers"></nz-statistic>
          </nz-card>
        </div>
        <div nz-col [nzSpan]="6">
          <nz-card [nzLoading]="loading">
            <nz-statistic [nzValue]="warehouseCount" nzTitle="Warehouses"></nz-statistic>
          </nz-card>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class DashboardComponent implements OnInit {
  userCount = 0;
  productCount = 0;
  customerCount = 0;
  warehouseCount = 0;
  loading = true;

  constructor(
    private usersService: UsersService,
    private inventoryService: InventoryService,
    private salesService: SalesService
  ) {}

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.loading = true;
    forkJoin({
      users: this.usersService.getUsers({ pageSize: 1 }),
      products: this.inventoryService.getProducts({ pageSize: 1 }),
      customers: this.salesService.getCustomers({ pageSize: 1 }),
      warehouses: this.inventoryService.getWarehouses({ pageSize: 1 })
    }).subscribe({
      next: (results) => {
        this.userCount = results.users.total;
        this.productCount = results.products.total;
        this.customerCount = results.customers.total;
        this.warehouseCount = results.warehouses.total;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }
}
