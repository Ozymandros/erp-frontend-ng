import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { AppButtonComponent, AppInputComponent } from '../../../shared/components';
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
    NzTagModule,
    NzPopconfirmModule,
    NzCardModule,
    NzTooltipModule,
    NzSpaceModule,
    NzTypographyModule,
    AppButtonComponent,
    AppInputComponent
  ],
  template: `
@if (permissions$ | async; as p) {
<div>
  <div class="page-header">
    <h1 nz-typography>Warehouses Management</h1>
    <div class="header-actions">
      @if (p.canExport) {
        <app-button (click)="exportToXlsx('warehouses.xlsx')" icon="file-excel">
          Export XLSX
        </app-button>
      }
      @if (p.canExport) {
        <app-button (click)="exportToPdf('warehouses.pdf')" icon="file-pdf">
          Export PDF
        </app-button>
      }

      @if (p.canCreate) {
        <app-button type="primary" routerLink="/inventory/warehouses/new" icon="plus">
          Add Warehouse
        </app-button>
      }
    </div>
  </div>

  <nz-card>
    <div class="search-container">
      <app-input
        [(ngModel)]="searchTerm"
        (ngModelChange)="onSearch()"
        placeholder="Search warehouses..."
        icon="search"
        size="large"
      ></app-input>
    </div>

    <nz-table
      #basicTable
      [nzData]="data"
      [nzLoading]="loading"
      [nzTotal]="total"
      [(nzPageIndex)]="pageIndex"
      [(nzPageSize)]="pageSize"
      [nzFrontPagination]="false"
      (nzPageIndexChange)="onPageChange($event)"
      (nzPageSizeChange)="onPageSizeChange($event)"
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
        @for (item of basicTable.data; track item.id) {
          <tr>
            <td><strong>{{ item.name }}</strong></td>
            <td>{{ item.location || '-' }}</td>
            <td>{{ item.createdAt | date:'short' }}</td>
            @if (p.canUpdate || p.canDelete) {
              <td>
                <nz-space [nzSize]="8">
                  @if (p.canUpdate) {
                    <app-button
                      *nzSpaceItem
                      type="link"
                      tooltip="Edit warehouse"
                      [routerLink]="['/inventory/warehouses', item.id]"
                      icon="edit"
                    ></app-button>
                  }
                  @if (p.canDelete) {
                    <app-button
                      *nzSpaceItem
                      type="link"
                      danger
                      tooltip="Delete warehouse"
                      nz-popconfirm
                      nzPopconfirmTitle="Are you sure delete this warehouse?"
                      (nzOnConfirm)="deleteWarehouse(item.id)"
                      nzPopconfirmPlacement="left"
                      icon="delete"
                    ></app-button>
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

