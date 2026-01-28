import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { AuthService } from '../../core/services/auth.service';
import { PermissionService } from '../../core/services/permission.service';
import { NAV_ITEMS_CONFIG, NavItemConfig } from '../../core/config/routes.config';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, NzMenuModule, NzIconModule, NzLayoutModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  isCollapsed = false;
  currentUser = this.authService.currentUser;

  // Filter navigation items based on permissions
  visibleNavItems = computed(() => {
    const user = this.authService.currentUser();
    if (!user) return [];
        
    return NAV_ITEMS_CONFIG.filter(item => {
      // If no permission required, show the item
      if (!item.permission) return true;
            
      // Admin has full access
      if (user.isAdmin) return true;
            
      // Check against cached permissions (client-side, no API call)
      return this.permissionService.hasPermission(
        item.permission.module,
        item.permission.action
      );
    });
  });

  constructor(
    private authService: AuthService,
    private permissionService: PermissionService
  ) {}
}

