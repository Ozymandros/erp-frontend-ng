import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { PermissionsService } from '../../../core/services/permissions.service';
import { Permission } from '../../../types/api.types';
import { BaseListComponent } from '../../../core/base/base-list.component';
import { FileService } from '../../../core/services/file.service';
import { AuthService } from '../../../core/services/auth.service';
import { finalize } from 'rxjs';

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
    NzCardModule,
    NzModalModule
  ],
  template: `
    <div class="permissions-container" *ngIf="permissions$ | async as p">
      <div class="page-header" style="margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center;">
        <h1>Permissions Management</h1>
        <div>
          <button *ngIf="p.canExport" nz-button (click)="exportToXlsx('permissions.xlsx')" style="margin-right: 8px;">
            <i nz-icon nzType="file-excel"></i> Export XLSX
          </button>
          <button *ngIf="p.canExport" nz-button (click)="exportToPdf('permissions.pdf')" style="margin-right: 8px;">
            <i nz-icon nzType="file-pdf"></i> Export PDF
          </button>
        </div>
      </div>

      <nz-card>
        <div style="margin-bottom: 16px; display: flex; gap: 16px;">
          <nz-input-group [nzPrefix]="prefixIconSearch">
            <input type="text" nz-input placeholder="Search permissions..." [(ngModel)]="searchTerm" (ngModelChange)="loadData()" />
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
          [nzScroll]="{ x: '800px', y: 'calc(100vh - 400px)' }"
        >
          <thead>
            <tr>
              <th>Module</th>
              <th>Action</th>
              <th>Description</th>
              <th>Created At</th>
              <th *ngIf="p.canDelete">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let data of basicTable.data">
              <td><nz-tag [nzColor]="'cyan'">{{ data.module }}</nz-tag></td>
              <td><nz-tag [nzColor]="'purple'">{{ data.action }}</nz-tag></td>
              <td>{{ data.description || '-' }}</td>
              <td>{{ data.createdAt | date:'short' }}</td>
              <td *ngIf="p.canDelete">
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
    </div>
  `,
  styles: [`
    h1 {
      margin: 0;
    }
  `]
})
export class PermissionsListComponent extends BaseListComponent<Permission> {
  protected get moduleName(): string {
    return 'permissions';
  }

  constructor(
    permissionsService: PermissionsService,
    message: NzMessageService,
    modal: NzModalService,
    fileService: FileService,
    cdr: ChangeDetectorRef,
    authService: AuthService
  ) {
    super(permissionsService, message, modal, fileService, cdr, authService);
  }

  get permissions(): Permission[] {
    return this.data;
  }

  loadPermissions(): void {
    this.loadData();
  }

  deletePermission(id: string): void {
    super.deleteItem(id, 'permission');
  }
}

