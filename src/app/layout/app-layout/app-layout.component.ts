import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { HeaderComponent } from '../header/header.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    NzLayoutModule,
    NzMenuModule,
    NzIconModule,
    HeaderComponent
  ],
  template: `
    <nz-layout class="app-layout" nzHasSider>
      <nz-sider nzCollapsible [(nzCollapsed)]="isCollapsed" [nzWidth]="250" nzBreakpoint="lg" [nzCollapsedWidth]="80" class="sidebar">
        <div class="logo">
          <h2 *ngIf="!isCollapsed">ERP Admin</h2>
          <span *ngIf="isCollapsed" nz-icon nzType="appstore"></span>
        </div>
        <ul nz-menu nzTheme="dark" nzMode="inline">
          <li nz-menu-item routerLink="/users" routerLinkActive="ant-menu-item-selected">
            <span nz-icon nzType="user"></span>
            <span>Users</span>
          </li>
          <li nz-menu-item routerLink="/roles" routerLinkActive="ant-menu-item-selected">
            <span nz-icon nzType="safety-certificate"></span>
            <span>Roles</span>
          </li>
          <li nz-menu-item routerLink="/permissions" routerLinkActive="ant-menu-item-selected">
            <span nz-icon nzType="key"></span>
            <span>Permissions</span>
          </li>
          <li nz-menu-item routerLink="/inventory/products" routerLinkActive="ant-menu-item-selected">
            <span nz-icon nzType="inbox"></span>
            <span>Products</span>
          </li>
          <li nz-menu-item routerLink="/inventory/warehouses" routerLinkActive="ant-menu-item-selected">
            <span nz-icon nzType="home"></span>
            <span>Warehouses</span>
          </li>
          <li nz-menu-item routerLink="/sales/customers" routerLinkActive="ant-menu-item-selected">
            <span nz-icon nzType="dollar"></span>
            <span>Customers</span>
          </li>
          <li nz-menu-item routerLink="/sales/orders" routerLinkActive="ant-menu-item-selected">
            <span nz-icon nzType="shopping-cart"></span>
            <span>Sales Orders</span>
          </li>
          <li nz-menu-item routerLink="/purchasing/orders" routerLinkActive="ant-menu-item-selected">
            <span nz-icon nzType="shopping"></span>
            <span>Purchase Orders</span>
          </li>
          <li nz-menu-item routerLink="/inventory/warehouse-stocks" routerLinkActive="ant-menu-item-selected">
            <span nz-icon nzType="line-chart"></span>
            <span>Warehouse Stocks</span>
          </li>
          <li nz-menu-item routerLink="/inventory/transactions" routerLinkActive="ant-menu-item-selected">
            <span nz-icon nzType="file-text"></span>
            <span>Transactions</span>
          </li>
          <li nz-menu-item routerLink="/inventory/stock-operations" routerLinkActive="ant-menu-item-selected">
            <span nz-icon nzType="sync"></span>
            <span>Stock Operations</span>
          </li>
        </ul>
      </nz-sider>
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

