import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { AuthService } from '@/app/core/services/auth.service';
import { User } from '@/app/types/api.types';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    NzLayoutModule,
    NzDropDownModule,
    NzAvatarModule,
    NzIconModule
  ],
  template: `
    <nz-header class="app-header">
      <div class="header-content">
        <div class="header-title">
          <h1>Enterprise Resource Planning</h1>
        </div>
        <div class="header-actions" *ngIf="currentUser$ | async as user">
          <nz-avatar [nzText]="getUserInitials(user)" nz-dropdown [nzDropdownMenu]="menu"></nz-avatar>
          <nz-dropdown-menu #menu="nzDropdownMenu">
            <ul nz-menu>
              <li nz-menu-item (click)="goToProfile()">
                <span nz-icon nzType="user"></span>
                Profile
              </li>
              <li nz-menu-divider></li>
              <li nz-menu-item (click)="logout()">
                <span nz-icon nzType="logout"></span>
                Logout
              </li>
            </ul>
          </nz-dropdown-menu>
        </div>
      </div>
    </nz-header>
  `,
  styles: [`
    .app-header {
      background: #fff;
      padding: 0 24px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 100%;
    }

    .header-title h1 {
      margin: 0;
      font-size: 20px;
      font-weight: 500;
    }

    .header-actions {
      cursor: pointer;
    }
  `]
})
export class HeaderComponent {
  currentUser$ = this.authService.currentUser$;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  getUserInitials(user: User): string {
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user.username) {
      return user.username.substring(0, 2).toUpperCase();
    }
    return 'U';
  }

  goToProfile(): void {
    this.router.navigate(['/profile']);
  }

  logout(): void {
    this.authService.logout().subscribe();
  }
}
