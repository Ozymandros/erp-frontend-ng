import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzCardModule } from 'ng-zorro-antd/card';
import { PermissionsService } from '../../../core/services/permissions.service';
import { Permission } from '../../../types/api.types';
import { FileUtils } from '../../../core/utils/file-utils';

@Component({
  selector: 'app-permissions-list',
  standalone: true,
  imports: [
    CommonModule,
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
    <div class="page-header" style="margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center;">
      <h1>Permissions Management</h1>
      <div>
        <button nz-button (click)="exportToXlsx()" style="margin-right: 8px;">
          <i nz-icon nzType="file"></i> Export XLSX
        </button>
        <button nz-button (click)="exportToPdf()" style="margin-right: 8px;">
          <i nz-icon nzType="file"></i> Export PDF
        </button>
      </div>
    </div>

    <nz-card>
      <div style="margin-bottom: 16px; display: flex; gap: 16px;">
        <nz-input-group [nzPrefix]="prefixIconSearch">
          <input type="text" nz-input placeholder="Search permissions..." [(ngModel)]="searchTerm" (ngModelChange)="onSearch()" />
        </nz-input-group>
        <ng-template #prefixIconSearch>
          <i nz-icon nzType="search"></i>
        </ng-template>
      </div>

      <nz-table
        #basicTable
        [nzData]="permissions"
        [nzLoading]="loading"
        [nzTotal]="total"
        [(nzPageIndex)]="pageIndex"
        [(nzPageSize)]="pageSize"
        [nzFrontPagination]="false"
        (nzPageIndexChange)="loadPermissions()"
        (nzPageSizeChange)="loadPermissions()"
      >
        <thead>
          <tr>
            <th>Module</th>
            <th>Action</th>
            <th>Description</th>
            <th>Created At</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let data of basicTable.data">
            <td><nz-tag [nzColor]="'cyan'">{{ data.module }}</nz-tag></td>
            <td><nz-tag [nzColor]="'purple'">{{ data.action }}</nz-tag></td>
            <td>{{ data.description || '-' }}</td>
            <td>{{ data.createdAt | date:'short' }}</td>
            <td>
              <a
                nz-popconfirm
                nzPopconfirmTitle="Are you sure delete this permission?"
                (nzOnConfirm)="deletePermission(data.id)"
                nzPopconfirmPlacement="left"
                style="color: #ff4d4f;"
              >Delete</a>
            </td>
          </tr>
        </tbody>
      </nz-table>
    </nz-card>
  `,
  styles: [`
    h1 {
      margin: 0;
    }
  `]
})
export class PermissionsListComponent implements OnInit {
  permissions: Permission[] = [];
  loading = true;
  total = 0;
  pageIndex = 1;
  pageSize = 10;
  searchTerm = '';

  constructor(
    private permissionsService: PermissionsService,
    private message: NzMessageService
  ) {}

  ngOnInit(): void {
    this.loadPermissions();
  }

  loadPermissions(): void {
    this.loading = true;
    this.permissionsService.getPermissions({
      page: this.pageIndex,
      pageSize: this.pageSize,
      search: this.searchTerm
    }).subscribe({
      next: (response) => {
        this.permissions = response.items;
        this.total = response.total;
        this.loading = false;
      },
      error: () => {
        this.message.error('Failed to load permissions');
        this.loading = false;
      }
    });
  }

  onSearch(): void {
    this.pageIndex = 1;
    this.loadPermissions();
  }

  deletePermission(id: string): void {
    this.permissionsService.deletePermission(id).subscribe({
      next: () => {
        this.message.success('Permission deleted successfully');
        this.loadPermissions();
      },
      error: () => {
        this.message.error('Failed to delete permission');
      }
    });
  }

  exportToXlsx(): void {
    this.permissionsService.exportToXlsx().subscribe({
      next: (blob) => {
        FileUtils.saveFile(blob, 'permissions.xlsx');
        this.message.success('Permissions exported to XLSX successfully');
      },
      error: () => {
        this.message.error('Failed to export permissions to XLSX');
      }
    });
  }

  exportToPdf(): void {
    this.permissionsService.exportToPdf().subscribe({
      next: (blob) => {
        FileUtils.saveFile(blob, 'permissions.pdf');
        this.message.success('Permissions exported to PDF successfully');
      },
      error: () => {
        this.message.error('Failed to export permissions to PDF');
      }
    });
  }
}
