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
import { UsersService } from '@/app/core/services/users.service';
import { User } from '@/app/types/api.types';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-users-list',
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
    LucideAngularModule
  ],
  template: `
    <div class="page-header" style="margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center;">
      <h1>Users Management</h1>
      <button nz-button nzType="primary" routerLink="/users/new">
        <i nz-icon nzType="plus"></i> Add User
      </button>
    </div>

    <nz-card>
      <div style="margin-bottom: 16px; display: flex; gap: 16px;">
        <nz-input-group [nzPrefix]="prefixIconSearch">
          <input type="text" nz-input placeholder="Search users..." [(ngModel)]="searchTerm" (ngModelChange)="onSearch()" />
        </nz-input-group>
        <ng-template #prefixIconSearch>
          <i nz-icon nzType="search"></i>
        </ng-template>
      </div>

      <nz-table
        #basicTable
        [nzData]="users"
        [nzLoading]="loading"
        [nzTotal]="total"
        [(nzPageIndex)]="pageIndex"
        [(nzPageSize)]="pageSize"
        [nzFrontPagination]="false"
        (nzPageIndexChange)="loadUsers()"
        (nzPageSizeChange)="loadUsers()"
      >
        <thead>
          <tr>
            <th>Username</th>
            <th>Email</th>
            <th>Roles</th>
            <th>Status</th>
            <th>Created At</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let data of basicTable.data">
            <td>{{ data.username }}</td>
            <td>{{ data.email }}</td>
            <td>
              <nz-tag *ngFor="let role of data.roles" [nzColor]="'blue'">{{ role.name }}</nz-tag>
            </td>
            <td>
              <nz-tag [nzColor]="data.isActive ? 'success' : 'error'">
                {{ data.isActive ? 'Active' : 'Inactive' }}
              </nz-tag>
            </td>
            <td>{{ data.createdAt | date:'short' }}</td>
            <td>
              <a [routerLink]="['/users', data.id]" style="margin-right: 8px;">Edit</a>
              <a
                nz-popconfirm
                nzPopconfirmTitle="Are you sure delete this user?"
                (nzOnConfirm)="deleteUser(data.id)"
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
export class UsersListComponent implements OnInit {
  users: User[] = [];
  loading = true;
  total = 0;
  pageIndex = 1;
  pageSize = 10;
  searchTerm = '';

  constructor(
    private usersService: UsersService,
    private message: NzMessageService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.usersService.getUsers({
      page: this.pageIndex,
      pageSize: this.pageSize,
      search: this.searchTerm
    }).subscribe({
      next: (response) => {
        this.users = response.items;
        this.total = response.total;
        this.loading = false;
      },
      error: () => {
        this.message.error('Failed to load users');
        this.loading = false;
      }
    });
  }

  onSearch(): void {
    this.pageIndex = 1;
    this.loadUsers();
  }

  deleteUser(id: string): void {
    this.usersService.deleteUser(id).subscribe({
      next: () => {
        this.message.success('User deleted successfully');
        this.loadUsers();
      },
      error: () => {
        this.message.error('Failed to delete user');
      }
    });
  }
}
