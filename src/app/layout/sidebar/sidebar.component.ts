import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzIconModule } from 'ng-zorro-antd/icon';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    NzLayoutModule,
    NzMenuModule,
    NzIconModule
  ],
  template: `
    <nz-sider nzCollapsible [(nzCollapsed)]="isCollapsed" nzWidth="250px">
      <div class="logo">
        <h2>ERP System</h2>
      </div>
      <ul nz-menu nzTheme="dark" nzMode="inline">
        <li nz-menu-item routerLink="/" routerLinkActive="ant-menu-item-selected" [routerLinkActiveOptions]="{exact: true}">
          <span nz-icon nzType="dashboard"></span>
          <span>Dashboard</span>
        </li>
        
        <li nz-submenu nzTitle="Users" nzIcon="team">
          <ul>
            <li nz-menu-item routerLink="/users" routerLinkActive="ant-menu-item-selected">Users List</li>
            <li nz-menu-item routerLink="/roles" routerLinkActive="ant-menu-item-selected">Roles</li>
            <li nz-menu-item routerLink="/permissions" routerLinkActive="ant-menu-item-selected">Permissions</li>
          </ul>
        </li>

        <li nz-submenu nzTitle="Inventory" nzIcon="database">
          <ul>
            <li nz-menu-item routerLink="/inventory/products" routerLinkActive="ant-menu-item-selected">Products</li>
            <li nz-menu-item routerLink="/inventory/warehouses" routerLinkActive="ant-menu-item-selected">Warehouses</li>
            <li nz-menu-item routerLink="/inventory/warehouse-stocks" routerLinkActive="ant-menu-item-selected">Stock Levels</li>
            <li nz-menu-item routerLink="/inventory/transactions" routerLinkActive="ant-menu-item-selected">Transactions</li>
            <li nz-menu-item routerLink="/inventory/stock-operations" routerLinkActive="ant-menu-item-selected">Stock Operations</li>
          </ul>
        </li>

        <li nz-submenu nzTitle="Sales" nzIcon="shopping-cart">
          <ul>
            <li nz-menu-item routerLink="/sales/customers" routerLinkActive="ant-menu-item-selected">Customers</li>
            <li nz-menu-item routerLink="/sales/orders" routerLinkActive="ant-menu-item-selected">Sales Orders</li>
          </ul>
        </li>

        <li nz-submenu nzTitle="Purchasing" nzIcon="shopping">
          <ul>
            <li nz-menu-item routerLink="/purchasing/orders" routerLinkActive="ant-menu-item-selected">Purchase Orders</li>
          </ul>
        </li>
      </ul>
    </nz-sider>
  `,
  styles: [`
    .logo {
      height: 64px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.2);
    }

    .logo h2 {
      color: #fff;
      margin: 0;
      font-size: 20px;
    }
  `]
})
export class SidebarComponent {
  isCollapsed = false;
}
