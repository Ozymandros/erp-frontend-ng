import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../header/header.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    NzLayoutModule,
    SidebarComponent,
    HeaderComponent
  ],
  template: `
    <nz-layout class="app-layout">
      <app-sidebar></app-sidebar>
      <nz-layout>
        <app-header></app-header>
        <nz-content class="app-content">
          <router-outlet></router-outlet>
        </nz-content>
      </nz-layout>
    </nz-layout>
  `,
  styles: [`
    .app-layout {
      min-height: 100vh;
    }

    .app-content {
      margin: 24px;
      padding: 24px;
      background: #fff;
      min-height: 280px;
    }
  `]
})
export class AppLayoutComponent {}
