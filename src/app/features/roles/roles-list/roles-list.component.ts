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
import { RolesService } from '../../../core/services/roles.service';
import { Role } from '../../../types/api.types';
import { FileUtils } from '../../../core/utils/file-utils';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-roles-list',
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
  templateUrl: './roles-list.component.html',
  styles: [`
    h1 {
      margin: 0;
    }
  `]
})
export class RolesListComponent implements OnInit {
  roles: Role[] = [];
  loading = true;
  total = 0;
  pageIndex = 1;
  pageSize = 10;
  searchTerm = '';

  constructor(
    private rolesService: RolesService,
    private message: NzMessageService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadRoles();
  }

  loadRoles(): void {
    this.loading = true;
    this.rolesService.getRoles({
      page: this.pageIndex,
      pageSize: this.pageSize,
      search: this.searchTerm
    })
    .pipe(
      finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
      })
    )
    .subscribe({
      next: (response: any) => {
        this.roles = response?.items || (Array.isArray(response) ? response : []);
        this.total = response?.total || (Array.isArray(response) ? response.length : 0);
      },
      error: () => {
        this.message.error('Failed to load roles');
      }
    });
  }


  onSearch(): void {
    this.pageIndex = 1;
    this.loadRoles();
  }

  deleteRole(id: string): void {
    this.rolesService.deleteRole(id).subscribe({
      next: () => {
        this.message.success('Role deleted successfully');
        this.loadRoles();
      },
      error: () => {
        this.message.error('Failed to delete role');
      }
    });
  }

  exportToXlsx(): void {
    this.rolesService.exportToXlsx().subscribe({
      next: (blob) => {
        FileUtils.saveFile(blob, 'roles.xlsx');
        this.message.success('Roles exported to XLSX successfully');
      },
      error: () => {
        this.message.error('Failed to export roles to XLSX');
      }
    });
  }

  exportToPdf(): void {
    this.rolesService.exportToPdf().subscribe({
      next: (blob) => {
        FileUtils.saveFile(blob, 'roles.pdf');
        this.message.success('Roles exported to PDF successfully');
      },
      error: () => {
        this.message.error('Failed to export roles to PDF');
      }
    });
  }
}
