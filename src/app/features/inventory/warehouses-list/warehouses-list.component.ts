import { Component, ChangeDetectorRef } from '@angular/core';
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
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { WarehousesService } from '../../../core/services/warehouses.service';


import { WarehouseDto } from '../../../types/api.types';
import { BaseListComponent } from '../../../core/base/base-list.component';
import { FileService } from '../../../core/services/file.service';
import { AuthService } from '../../../core/services/auth.service';

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
    NzCardModule,
    NzTooltipModule,
    NzSpaceModule
  ],
  template: `
@if (permissions$ | async; as p) {
<div>
  <div class="page-header">
    <h1>Warehouses Management</h1>
    <div class="header-actions">
      @if (p.canExport) {
        <button nz-button (click)="exportToXlsx('warehouses.xlsx')">
          <i nz-icon nzType="file-excel"></i> Export XLSX
        </button>
      }
      @if (p.canExport) {
        <button nz-button (click)="exportToPdf('warehouses.pdf')">
          <i nz-icon nzType="file-pdf"></i> Export PDF
        </button>
      }

      @if (p.canCreate) {
        <button nz-button nzType="primary" routerLink="/inventory/warehouses/new">
          <i nz-icon nzType="plus"></i> Add Warehouse
        </button>
      }
    </div>
  </div>

  <nz-card>
    <div class="search-container">
      <nz-space-compact nzSize="large" style="width: 100%; max-width: 400px;">
        <nz-input-wrapper>
          <nz-icon nzInputAddonBefore nzType="search" />
          <input type="text" nz-input placeholder="Search warehouses..." [(ngModel)]="searchTerm" (ngModelChange)="onSearch()" />
        </nz-input-wrapper>
      </nz-space-compact>
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
      [nzScroll]="{ x: '800px' }"
    >
      <thead>
        <tr>
          <th scope="col">Name</th>
          <th scope="col">Location</th>
          <th scope="col">Created At</th>
          @if (p.canUpdate || p.canDelete) {
            <th scope="col" nzWidth="150px">Actions</th>
          }
        </tr>
      </thead>
      <tbody>
        @for (data of basicTable.data; track data.id) {
          <tr>
            <td><strong>{{ data.name }}</strong></td>
            <td>{{ data.location || '-' }}</td>
            <td>{{ data.createdAt | date:'short' }}</td>
            @if (p.canUpdate || p.canDelete) {
              <td>
                <nz-space [nzSize]="8">
                  @if (p.canUpdate) {
                    <button
                      *nzSpaceItem
                      nz-button
                      nzType="link"
                      nz-tooltip
                      nzTooltipTitle="Edit warehouse"
                      [routerLink]="['/inventory/warehouses', data.id]"
                    >
                      <span nz-icon nzType="edit"></span>
                    </button>
                  }
                  @if (p.canDelete) {
                    <button
                      *nzSpaceItem
                      nz-button
                      nzType="link"
                      nzDanger
                      nz-tooltip
                      nzTooltipTitle="Delete warehouse"
                      nz-popconfirm
                      nzPopconfirmTitle="Are you sure delete this warehouse?"
                      (nzOnConfirm)="deleteWarehouse(data.id)"
                      nzPopconfirmPlacement="left"
                    >
                      <span nz-icon nzType="delete"></span>
                    </button>
                  }
                </nz-space>
              </td>
            }
          </tr>
        }
      </tbody>
    </nz-table>
  </nz-card>
</div>
}
  `,
  styles: [`
    .page-header {
      margin-bottom: 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
    }
    .page-header h1 {
      margin: 0;
    }
    .header-actions {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }
    .search-container {
      margin-bottom: 16px;
      display: flex;
      gap: 16px;
      max-width: 400px;
    }
    .edit-link {
      margin-right: 8px;
    }
    .delete-link {
      color: #ff4d4f;
      margin-left: 8px;
    }
  `]
})
export class WarehousesListComponent extends BaseListComponent<WarehouseDto> {
  protected get moduleName(): string {
    return 'inventory';
  }

  constructor(
    warehousesService: WarehousesService,
    message: NzMessageService,
    modal: NzModalService,
    fileService: FileService,
    cdr: ChangeDetectorRef,
    authService: AuthService
  ) {
    super(warehousesService, message, modal, fileService, cdr, authService);
  }

  get warehouses(): WarehouseDto[] {
    return this.data;
  }

  loadWarehouses(): void {
    this.loadData();
  }

  deleteWarehouse(id: string): void {
    super.deleteItem(id, 'warehouse');
  }
}

