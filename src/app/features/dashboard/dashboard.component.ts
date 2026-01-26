import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { UsersService } from '../../core/services/users.service';
import { ProductsService } from '../../core/services/products.service';
import { WarehousesService } from '../../core/services/warehouses.service';
import { CustomersService } from '../../core/services/customers.service';
import { forkJoin, finalize } from 'rxjs';

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
    private customersService: CustomersService,
    private cdr: ChangeDetectorRef
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
    })
    .pipe(
      finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
      })
    )
    .subscribe({
      next: (results: any) => {
        console.log('Dashboard stats results:', results);
        this.userCount = this.extractTotal(results.users);
        this.productCount = this.extractTotal(results.products);
        this.customerCount = this.extractTotal(results.customers);
        this.warehouseCount = this.extractTotal(results.warehouses);
      },
      error: (error) => {
        console.error('Failed to load dashboard stats', error);
      }
    });
  }

  private extractTotal(response: any): number {
    if (!response) return 0;
    if (typeof response.total === 'number') return response.total;
    if (typeof response.totalCount === 'number') return response.totalCount;
    if (Array.isArray(response)) return response.length;
    if (response.items && Array.isArray(response.items)) return response.items.length;
    return 0;
  }
}
