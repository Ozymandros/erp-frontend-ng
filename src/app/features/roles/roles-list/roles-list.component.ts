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
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzCardModule } from 'ng-zorro-antd/card';
import { RolesService } from '../../../core/services/roles.service';
import { Role } from '../../../types/api.types';

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
    private message: NzMessageService
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
    }).subscribe({
      next: (response) => {
        this.roles = response.items;
        this.total = response.total;
        this.loading = false;
      },
      error: () => {
        this.message.error('Failed to load roles');
        this.loading = false;
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
}
