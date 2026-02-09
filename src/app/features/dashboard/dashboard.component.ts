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
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  userCount = 0;
  productCount = 0;
  customerCount = 0;
  warehouseCount = 0;
  loading = true;

  constructor(
    private readonly usersService: UsersService,
    private readonly productsService: ProductsService,
    private readonly warehousesService: WarehousesService,
    private readonly customersService: CustomersService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.loading = true;
    forkJoin({
      users: this.usersService.getAll({ pageSize: 1 }),
      products: this.productsService.getAll({ pageSize: 1 }),
      customers: this.customersService.getAll({ pageSize: 1 }),
      warehouses: this.warehousesService.getAll({ pageSize: 1 })
    })
    .pipe(
      finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
      })
    )
    .subscribe({
      next: (results: Record<string, unknown>) => {
        console.log('Dashboard stats results:', results);
        this.userCount = this.extractTotal(results['users']);
        this.productCount = this.extractTotal(results['products']);
        this.customerCount = this.extractTotal(results['customers']);
        this.warehouseCount = this.extractTotal(results['warehouses']);
      },
      error: (error) => {
        console.error('Failed to load dashboard stats', error);
      }
    });
  }

  private extractTotal(response: unknown): number {
    if (!response || typeof response !== 'object') return 0;
    const r = response as Record<string, unknown>;
    if (typeof r['total'] === 'number') return r['total'] as number;
    if (typeof r['totalCount'] === 'number') return r['totalCount'] as number;
    if (Array.isArray(response)) return response.length;
    if (r['items'] && Array.isArray(r['items'])) return (r['items'] as unknown[]).length;
    return 0;
  }
}
