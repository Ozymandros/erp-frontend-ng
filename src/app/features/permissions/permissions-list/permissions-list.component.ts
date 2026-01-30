import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSpaceModule } from 'ng-zorro-antd/space';
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
    NzSpaceModule,
    NzTagModule,
    NzPopconfirmModule,
    NzCardModule,
    NzModalModule
  ],
  template: `
    @if (permissions$ | async; as p) {
    <div class="permissions-container">
      <div class="page-header">
        <h1>Permissions Management</h1>
        <div class="header-actions">
          @if (p.canExport) {
            <button nz-button (click)="exportToXlsx('permissions.xlsx')" class="export-button">
              <i nz-icon nzType="file-excel"></i> Export XLSX
            </button>
          }
          @if (p.canExport) {
            <button nz-button (click)="exportToPdf('permissions.pdf')" class="export-button">
              <i nz-icon nzType="file-pdf"></i> Export PDF
            </button>
          }
        </div>
      </div>

      <nz-card>
        <div class="list-search">
          <!--<span class="list-search__label">Search</span>-->
          <nz-space-compact nzSize="large" class="list-search__compact">
            <nz-input-wrapper>
              <nz-icon nzInputAddonBefore nzType="search" />
              <input type="text" nz-input placeholder="By module or action..." [(ngModel)]="searchTerm" (ngModelChange)="onSearch()" />
            </nz-input-wrapper>
          </nz-space-compact>
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
              @if (p.canDelete) {
                <th>Actions</th>
              }
            </tr>
          </thead>
          <tbody>
            @for (data of basicTable.data; track data.id) {
              <tr>
                <td><nz-tag [nzColor]="'cyan'">{{ data.module }}</nz-tag></td>
                <td><nz-tag [nzColor]="'purple'">{{ data.action }}</nz-tag></td>
                <td>{{ data.description || '-' }}</td>
                <td>{{ data.createdAt | date:'short' }}</td>
                @if (p.canDelete) {
                  <td>
                    <a
                      nz-popconfirm
                      nzPopconfirmTitle="Are you sure delete this permission?"
                      (nzOnConfirm)="deletePermission(data.id)"
                      nzPopconfirmPlacement="left"
                      class="delete-link"
                    >Delete</a>
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
    h1 {
      margin: 0;
    }
    .page-header {
      margin-bottom: 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .header-actions {
      display: flex;
      gap: 8px;
    }
    .export-button {
      margin-right: 8px;
    }
    .delete-link {
      color: #ff4d4f;
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

