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
import { NzModalService } from 'ng-zorro-antd/modal';
import { SalesService } from '@/app/core/services/sales.service';
import { CustomerDto } from '@/app/types/api.types';

@Component({
  selector: 'app-customers-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    NzTableModule,
    NzButtonModule,
    NzInputModule,
    NzIconModule,
    NzTagModule
  ],
  template: `
    <div class="customers-list">
      <div class="page-header">
        <h1>Customers Management</h1>
        <button nz-button nzType="primary" routerLink="/sales/customers/new">
          <span nz-icon nzType="plus"></span>
          Add Customer
        </button>
      </div>

      <div class="search-bar">
        <nz-input-group [nzSuffix]="suffixIconSearch">
          <input 
            type="text" 
            nz-input 
            placeholder="Search customers..." 
            [(ngModel)]="searchText"
            (ngModelChange)="onSearch()"
          />
        </nz-input-group>
        <ng-template #suffixIconSearch>
          <span nz-icon nzType="search"></span>
        </ng-template>
      </div>

      <nz-table
        #customersTable
        [nzData]="customers"
        [nzLoading]="loading"
        [nzPageSize]="pageSize"
        [nzPageIndex]="pageIndex"
        [nzTotal]="total"
        [nzFrontPagination]="false"
        (nzPageIndexChange)="onPageChange($event)"
        (nzPageSizeChange)="onPageSizeChange($event)"
      >
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>City</th>
            <th>Country</th>
            <th>Status</th>
            <th nzWidth="150px">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let customer of customersTable.data">
            <td><strong>{{ customer.name }}</strong></td>
            <td>{{ customer.email || '-' }}</td>
            <td>{{ customer.phone || '-' }}</td>
            <td>{{ customer.city || '-' }}</td>
            <td>{{ customer.country || '-' }}</td>
            <td>
              <nz-tag [nzColor]="customer.isActive ? 'success' : 'default'">
                {{ customer.isActive ? 'Active' : 'Inactive' }}
              </nz-tag>
            </td>
            <td>
              <button 
                nz-button 
                nzType="link" 
                nzSize="small"
                [routerLink]="['/sales/customers', customer.id]"
              >
                <span nz-icon nzType="edit"></span>
                Edit
              </button>
              <button 
                nz-button 
                nzType="link" 
                nzSize="small"
                nzDanger
                (click)="deleteCustomer(customer)"
              >
                <span nz-icon nzType="delete"></span>
                Delete
              </button>
            </td>
          </tr>
        </tbody>
      </nz-table>
    </div>
  `,
  styles: [`
    .customers-list {
      padding: 24px;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .page-header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 500;
    }

    .search-bar {
      margin-bottom: 16px;
      max-width: 400px;
    }

    nz-tag {
      margin-right: 4px;
    }
  `]
})
export class CustomersListComponent implements OnInit {
  customers: CustomerDto[] = [];
  loading = false;
  searchText = '';
  pageIndex = 1;
  pageSize = 10;
  total = 0;

  constructor(
    private salesService: SalesService,
    private message: NzMessageService,
    private modal: NzModalService
  ) {}

  ngOnInit(): void {
    this.loadCustomers();
  }

  loadCustomers(): void {
    this.loading = true;
    this.salesService.getCustomers({
      page: this.pageIndex,
      pageSize: this.pageSize,
      search: this.searchText
    }).subscribe({
      next: (response) => {
        this.customers = response.items;
        this.total = response.total;
        this.loading = false;
      },
      error: (error) => {
        this.message.error('Failed to load customers: ' + error.message);
        this.loading = false;
      }
    });
  }

  onSearch(): void {
    this.pageIndex = 1;
    this.loadCustomers();
  }

  onPageChange(page: number): void {
    this.pageIndex = page;
    this.loadCustomers();
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.pageIndex = 1;
    this.loadCustomers();
  }

  deleteCustomer(customer: CustomerDto): void {
    this.modal.confirm({
      nzTitle: 'Delete Customer',
      nzContent: `Are you sure you want to delete customer "${customer.name}"?`,
      nzOkText: 'Delete',
      nzOkDanger: true,
      nzOnOk: () => {
        this.salesService.deleteCustomer(customer.id).subscribe({
          next: () => {
            this.message.success('Customer deleted successfully');
            this.loadCustomers();
          },
          error: (error) => {
            this.message.error('Failed to delete customer: ' + error.message);
          }
        });
      }
    });
  }
}
