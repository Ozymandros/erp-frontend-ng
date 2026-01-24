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
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { CustomersService } from '../../../core/services/customers.service';
import { CustomerDto } from '../../../types/api.types';
import { FileUtils } from '../../../core/utils/file-utils';

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
    NzTagModule,
    NzModalModule
  ],
  templateUrl: './customers-list.component.html',
  styleUrls: ['./customers-list.component.css']
})
export class CustomersListComponent implements OnInit {
  customers: CustomerDto[] = [];
  loading = false;
  searchText = '';
  pageIndex = 1;
  pageSize = 10;
  total = 0;

  constructor(
    private customersService: CustomersService,
    private message: NzMessageService,
    private modal: NzModalService
  ) {}

  ngOnInit(): void {
    this.loadCustomers();
  }

  loadCustomers(): void {
    this.loading = true;
    this.customersService.getCustomers({
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
        this.customersService.deleteCustomer(customer.id).subscribe({
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

  exportToXlsx(): void {
    this.customersService.exportToXlsx().subscribe({
      next: (blob) => {
        FileUtils.saveFile(blob, 'customers.xlsx');
        this.message.success('Customers exported to XLSX successfully');
      },
      error: () => {
        this.message.error('Failed to export customers to XLSX');
      }
    });
  }

  exportToPdf(): void {
    this.customersService.exportToPdf().subscribe({
      next: (blob) => {
        FileUtils.saveFile(blob, 'customers.pdf');
        this.message.success('Customers exported to PDF successfully');
      },
      error: () => {
        this.message.error('Failed to export customers to PDF');
      }
    });
  }
}
