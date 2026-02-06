import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';
import { UsersService } from '../../../core/services/users.service';
import { User } from '../../../types/api.types';
import { BaseListComponent } from '../../../core/base/base-list.component';
import { FileService } from '../../../core/services/file.service';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';
import { AppButtonComponent, AppInputComponent } from '../../../shared/components';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    NzTableModule,
    NzSpaceModule,
    NzTagModule,
    NzPopconfirmModule,
    NzCardModule,
    NzModalModule,
    NzTooltipModule,
    AppButtonComponent,
    AppInputComponent
  ],
  templateUrl: './users-list.component.html',
  styleUrls: ['./users-list.component.css'],
})
export class UsersListComponent extends BaseListComponent<User> {
  protected get moduleName(): string {
    return 'users';
  }

  constructor(
    usersService: UsersService,
    message: NzMessageService,
    modal: NzModalService,
    fileService: FileService,
    cdr: ChangeDetectorRef,
    authService: AuthService,
    public readonly themeService: ThemeService
  ) {
    super(usersService, message, modal, fileService, cdr, authService);
  }

  // Computed property to check if dark mode is active


  get users(): User[] {
    return this.data;
  }

  deleteUser(id: string): void {
    super.deleteItem(id, 'user');
  }
}

