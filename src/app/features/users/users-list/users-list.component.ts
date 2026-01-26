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
import { UsersService } from '../../../core/services/users.service';
import { User } from '../../../types/api.types';
import { FileUtils } from '../../../core/utils/file-utils';
import { finalize } from 'rxjs';

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
  ],
  templateUrl: './users-list.component.html',
  styleUrls: ['./users-list.component.css'],
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
    private message: NzMessageService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.usersService
      .getUsers({
        page: this.pageIndex,
        pageSize: this.pageSize,
        search: this.searchTerm,
      })
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (response: any) => {
          this.users = response?.items || (Array.isArray(response) ? response : []);
          this.total = response?.total || (Array.isArray(response) ? response.length : 0);
        },
        error: () => {
          this.message.error('Failed to load users');
        },
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
      },
    });
  }

  exportToXlsx(): void {
    this.usersService.exportToXlsx().subscribe({
      next: (blob) => {
        FileUtils.saveFile(blob, 'users.xlsx');
        this.message.success('Users exported to XLSX successfully');
      },
      error: () => {
        this.message.error('Failed to export users to XLSX');
      }
    });
  }

  exportToPdf(): void {
    this.usersService.exportToPdf().subscribe({
      next: (blob) => {
        FileUtils.saveFile(blob, 'users.pdf');
        this.message.success('Users exported to PDF successfully');
      },
      error: () => {
        this.message.error('Failed to export users to PDF');
      }
    });
  }
}
