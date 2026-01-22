import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { UsersService } from '../../core/services/users.service';
import { ProductsService } from '../../core/services/products.service';
import { WarehousesService } from '../../core/services/warehouses.service';
import { CustomersService } from '../../core/services/customers.service';
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
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {
  userCount = 0;
  productCount = 0;
  customerCount = 0;
  warehouseCount = 0;
  loading = true;

  constructor(
    private usersService: UsersService,
    private productsService: ProductsService,
    private warehousesService: WarehousesService,
    private customersService: CustomersService
  ) {}

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.loading = true;
    forkJoin({
      users: this.usersService.getUsers({ pageSize: 1 }),
      products: this.productsService.getProducts({ pageSize: 1 }),
      customers: this.customersService.getCustomers({ pageSize: 1 }),
      warehouses: this.warehousesService.getWarehouses({ pageSize: 1 })
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
