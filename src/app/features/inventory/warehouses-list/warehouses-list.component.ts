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
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzCardModule } from 'ng-zorro-antd/card';
import { WarehousesService } from '../../../core/services/warehouses.service';


import { WarehouseDto } from '../../../types/api.types';
import { BaseListComponent } from '../../../core/base/base-list.component';
import { FileService } from '../../../core/services/file.service';
import { AuthService } from '../../../core/services/auth.service';
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
<div *ngIf="permissions$ | async as p">
  <div class="page-header" style="margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
    <h1 style="margin: 0;">Warehouses Management</h1>
    <div style="display: flex; gap: 8px; flex-wrap: wrap;">
      <button *ngIf="p.canExport" nz-button (click)="exportToXlsx('warehouses.xlsx')">
        <i nz-icon nzType="file-excel"></i> Export XLSX
      </button>
      <button *ngIf="p.canExport" nz-button (click)="exportToPdf('warehouses.pdf')">
        <i nz-icon nzType="file-pdf"></i> Export PDF
      </button>

      <button *ngIf="p.canCreate" nz-button nzType="primary" routerLink="/inventory/warehouses/new">
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
          <th nzWidth="150px" *ngIf="p.canUpdate || p.canDelete">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let data of basicTable.data">
          <td><strong>{{ data.name }}</strong></td>
          <td>{{ data.location || '-' }}</td>
          <td>{{ data.createdAt | date:'short' }}</td>
          <td *ngIf="p.canUpdate || p.canDelete">
            <a *ngIf="p.canUpdate" [routerLink]="['/inventory/warehouses', data.id]" style="margin-right: 8px;">Edit</a>
            <a
              *ngIf="p.canDelete"
              nz-popconfirm
              nzPopconfirmTitle="Are you sure delete this warehouse?"
              (nzOnConfirm)="deleteWarehouse(data.id)"
              nzPopconfirmPlacement="left"
              style="color: #ff4d4f; margin-left: 8px;"
            >Delete</a>
          </td>
        </tr>
      </tbody>
    </nz-table>
  </nz-card>
</div>
  `,
  styles: []
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

