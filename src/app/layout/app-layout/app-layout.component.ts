import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { HeaderComponent } from '../header/header.component';
import { SidebarComponent } from '../sidebar/sidebar.component';


@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    NzLayoutModule,
    NzMenuModule,
    NzIconModule,
    HeaderComponent,
    SidebarComponent
  ],

  template: `
    <nz-layout class="app-layout" nzHasSider>
      <app-sidebar></app-sidebar>
      <nz-layout class="inner-layout">

        <app-header></app-header>
        <nz-content class="app-content">
          <router-outlet></router-outlet>
        </nz-content>
      </nz-layout>

    </nz-layout>
  `,
  styles: [`
    .app-layout {
      height: 100vh;
      overflow: hidden;
    }

    .inner-layout {
      height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .sidebar {
      overflow: auto;
      height: 100vh;
    }

    .logo {
      height: 64px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.1);
      margin: 16px;
      border-radius: 4px;
    }

    .logo h2 {
      color: #fff;
      margin: 0;
      font-size: 18px;
      font-weight: 600;
    }

    .logo span {
      font-size: 24px;
      color: #fff;
    }

    .app-content {
      margin: 24px;
      padding: 24px;
      background: #fff;
      overflow: auto;
      flex: 1;
    }



    @media screen and (max-width: 768px) {
      .app-content {
        margin: 8px;
        padding: 12px;
      }
    }
  `]

})
export class AppLayoutComponent {
  isCollapsed = false;
}

