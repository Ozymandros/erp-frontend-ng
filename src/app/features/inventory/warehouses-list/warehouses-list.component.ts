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
import { WarehousesService } from '../../../core/services/warehouses.service';
import { WarehouseDto } from '../../../types/api.types';
import { FileUtils } from '../../../core/utils/file-utils';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-warehouses-list',
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
      <h1 style="margin: 0;">Warehouses Management</h1>
      <div style="display: flex; gap: 8px; flex-wrap: wrap;">
        <button nz-button (click)="exportToXlsx()">
          <i nz-icon nzType="file-excel"></i> Export XLSX
        </button>
        <button nz-button (click)="exportToPdf()">
          <i nz-icon nzType="file-pdf"></i> Export PDF
        </button>


        <button nz-button nzType="primary" routerLink="/inventory/warehouses/new">
          <i nz-icon nzType="plus"></i> Add Warehouse
        </button>
      </div>
    </div>

    <nz-card>
      <div style="margin-bottom: 16px; display: flex; gap: 16px; max-width: 400px;">
        <nz-input-group [nzPrefix]="prefixIconSearch">
          <input type="text" nz-input placeholder="Search warehouses..." [(ngModel)]="searchTerm" (ngModelChange)="onSearch()" />
        </nz-input-group>
        <ng-template #prefixIconSearch>
          <i nz-icon nzType="search"></i>
        </ng-template>
      </div>

      <nz-table
        #basicTable
        [nzData]="warehouses"
        [nzLoading]="loading"
        [nzTotal]="total"
        [(nzPageIndex)]="pageIndex"
        [(nzPageSize)]="pageSize"
        [nzFrontPagination]="false"
        (nzPageIndexChange)="loadWarehouses()"
        (nzPageSizeChange)="loadWarehouses()"
        [nzScroll]="{ x: '800px', y: 'calc(100vh - 400px)' }"
      >

        <thead>
          <tr>
            <th>Name</th>
            <th>Location</th>
            <th>Created At</th>
            <th nzWidth="150px">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let data of basicTable.data">
            <td><strong>{{ data.name }}</strong></td>
            <td>{{ data.location || '-' }}</td>
            <td>{{ data.createdAt | date:'short' }}</td>
            <td>

              <a [routerLink]="['/inventory/warehouses', data.id]" style="margin-right: 8px;">Edit</a>
              <a
                nz-popconfirm
                nzPopconfirmTitle="Are you sure delete this warehouse?"
                (nzOnConfirm)="deleteWarehouse(data.id)"
                nzPopconfirmPlacement="left"
                style="color: #ff4d4f;"
              >Delete</a>
            </td>
          </tr>
        </tbody>
      </nz-table>
    </nz-card>
  `,
  styles: []
})
export class WarehousesListComponent implements OnInit {
  warehouses: WarehouseDto[] = [];
  loading = true;
  total = 0;
  pageIndex = 1;
  pageSize = 10;
  searchTerm = '';

  constructor(
    private warehousesService: WarehousesService,
    private message: NzMessageService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadWarehouses();
  }

  loadWarehouses(): void {
    setTimeout(() => {
      this.loading = true;
      this.warehousesService.getWarehouses({
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
          this.warehouses = response?.items || (Array.isArray(response) ? response : []);
          this.total = response?.total || (Array.isArray(response) ? response.length : 0);
        },
        error: () => {
          this.message.error('Failed to load warehouses');
        }
      });
    });
  }



  onSearch(): void {
    this.pageIndex = 1;
    this.loadWarehouses();
  }

  deleteWarehouse(id: string): void {
    this.warehousesService.deleteWarehouse(id).subscribe({
      next: () => {
        this.message.success('Warehouse deleted successfully');
        this.loadWarehouses();
      },
      error: () => {
        this.message.error('Failed to delete warehouse');
      }
    });
  }

  exportToXlsx(): void {
    this.warehousesService.exportToXlsx().subscribe({
      next: (blob) => {
        FileUtils.saveFile(blob, 'warehouses.xlsx');
        this.message.success('Warehouses exported to XLSX successfully');
      },
      error: () => {
        this.message.error('Failed to export warehouses to XLSX');
      }
    });
  }

  exportToPdf(): void {
    this.warehousesService.exportToPdf().subscribe({
      next: (blob) => {
        FileUtils.saveFile(blob, 'warehouses.pdf');
        this.message.success('Warehouses exported to PDF successfully');
      },
      error: () => {
        this.message.error('Failed to export warehouses to PDF');
      }
    });
  }
}
