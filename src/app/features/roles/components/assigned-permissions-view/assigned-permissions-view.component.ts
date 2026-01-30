import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { Permission } from '../../../../types/api.types';

@Component({
  selector: 'app-assigned-permissions-view',
  standalone: true,
  imports: [
    CommonModule,
    NzCardModule,
    NzBadgeModule
  ],
  templateUrl: './assigned-permissions-view.component.html',
  styleUrls: ['./assigned-permissions-view.component.css']
})
export class AssignedPermissionsViewComponent {
  @Input() permissions: Permission[] = [];

  // Group permissions by module
  get groupedPermissions(): Map<string, Permission[]> {
    const groups = new Map<string, Permission[]>();
    this.permissions.forEach(permission => {
      const module = permission.module || 'Other';
      if (!groups.has(module)) {
        groups.set(module, []);
      }
      groups.get(module)!.push(permission);
    });
    // Sort permissions within each group by action
    groups.forEach((permissions, module) => {
      permissions.sort((a, b) => a.action.localeCompare(b.action));
    });
    return groups;
  }

  // Get sorted module names for display
  getSortedModules(): string[] {
    return Array.from(this.groupedPermissions.keys()).sort();
  }
}
