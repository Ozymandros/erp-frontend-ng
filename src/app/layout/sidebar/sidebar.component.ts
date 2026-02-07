import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { AuthService } from '../../core/services/auth.service';
import { PermissionService } from '../../core/services/permission.service';
import { ThemeService } from '../../core/services/theme.service';
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
  effectiveTheme = this.themeService.effectiveTheme;

  // Filter navigation items based on permissions
  visibleNavItems = computed(() => {
    const user = this.authService.currentUser();
    if (!user) return [];
        
    const filterItems = (items: NavItemConfig[]): NavItemConfig[] => {
      return items.filter(item => {
        // Check current item permission
        const hasMainPermission = !item.permission || 
                                user.isAdmin || 
                                this.permissionService.hasPermission(item.permission.module, item.permission.action);

        if (!hasMainPermission) return false;

        // If it has children, filter them too
        if (item.children) {
          item.children = filterItems(item.children);
          // Only show group if it has at least one visible child
          return item.children.length > 0;
        }

        return true;
      });
    };

    // Deep clone to avoid mutating the original config while filtering
    const itemsCopy = JSON.parse(JSON.stringify(NAV_ITEMS_CONFIG));
    return filterItems(itemsCopy);
  });

  constructor(
    private readonly authService: AuthService,
    private readonly permissionService: PermissionService,
    private readonly themeService: ThemeService
  ) {}
}

