import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzMessageService } from 'ng-zorro-antd/message';
import { RolesService } from '../../../../core/services/roles.service';
import { PermissionsService } from '../../../../core/services/permissions.service';
import { Permission } from '../../../../types/api.types';

interface PermissionGroup {
  module: string;
  permissions: Permission[];
}

@Component({
  selector: 'app-permission-selector',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzCardModule,
    NzButtonModule,
    NzInputModule,
    NzSelectModule,
    NzIconModule,
    NzBadgeModule,
    NzSpinModule
  ],
  templateUrl: './permission-selector.component.html',
  styleUrls: ['./permission-selector.component.css']
})
export class PermissionSelectorComponent implements OnInit {
  @Input() roleId!: string;
  @Input() initialPermissions: Permission[] = [];
  @Input() readonly = false;
  @Output() permissionsChange = new EventEmitter<Permission[]>();

  allPermissions: Permission[] = [];
  assignedPermissions: Set<string> = new Set();
  searchTerm = '';
  selectedModule: string | null = null;
  loading = false;
  saving = false;
  error: string | null = null;

  constructor(
    private rolesService: RolesService,
    private permissionsService: PermissionsService,
    private message: NzMessageService
  ) {}

  ngOnInit(): void {
    this.assignedPermissions = new Set(this.initialPermissions.map(p => p.id));
    this.loadPermissions();
  }

  loadPermissions(): void {
    this.loading = true;
    this.error = null;
    
    this.permissionsService.getAll({ pageSize: 1000 }).subscribe({
      next: (response) => {
        this.allPermissions = response.items;
        this.loading = false;
      },
      error: (err) => {
        this.error = `Failed to load permissions: ${err.message || 'Unknown error'}`;
        this.loading = false;
        this.message.error(this.error);
      }
    });
  }

  assignPermission(permission: Permission): void {
    if (this.readonly || this.saving) return;
    
    this.saving = true;
    this.error = null;
    
    this.rolesService.addPermissionToRole(this.roleId, permission.id).subscribe({
      next: () => {
        this.assignedPermissions.add(permission.id);
        this.emitPermissionsChange();
        this.message.success(`Permission "${permission.module}.${permission.action}" assigned successfully`);
        this.saving = false;
      },
      error: (err) => {
        const errorMsg = err.message || `Failed to assign permission "${permission.module}.${permission.action}"`;
        this.error = errorMsg;
        this.message.error(errorMsg);
        this.saving = false;
      }
    });
  }

  unassignPermission(permission: Permission): void {
    if (this.readonly || this.saving) return;
    
    this.saving = true;
    this.error = null;
    
    this.rolesService.removePermissionFromRole(this.roleId, permission.id).subscribe({
      next: () => {
        this.assignedPermissions.delete(permission.id);
        this.emitPermissionsChange();
        this.message.success(`Permission "${permission.module}.${permission.action}" unassigned successfully`);
        this.saving = false;
      },
      error: (err) => {
        const errorMsg = err.message || `Failed to unassign permission "${permission.module}.${permission.action}"`;
        this.error = errorMsg;
        this.message.error(errorMsg);
        this.saving = false;
      }
    });
  }

  isAssigned(permissionId: string): boolean {
    return this.assignedPermissions.has(permissionId);
  }

  selectAllInModule(module: string): void {
    if (this.readonly || this.saving) return;
    
    const modulePermissions = this.getModulePermissions(module);
    const unassigned = modulePermissions.filter(p => !this.isAssigned(p.id));
    
    if (unassigned.length === 0) return;
    
    this.saving = true;
    let completed = 0;
    let errors = 0;
    
    unassigned.forEach(permission => {
      this.rolesService.addPermissionToRole(this.roleId, permission.id).subscribe({
        next: () => {
          this.assignedPermissions.add(permission.id);
          completed++;
          if (completed + errors === unassigned.length) {
            this.emitPermissionsChange();
            this.message.success(`All permissions in "${module}" assigned`);
            this.saving = false;
          }
        },
        error: () => {
          errors++;
          if (completed + errors === unassigned.length) {
            this.message.error(`Failed to assign some permissions`);
            this.saving = false;
          }
        }
      });
    });
  }

  deselectAllInModule(module: string): void {
    if (this.readonly || this.saving) return;
    
    const modulePermissions = this.getModulePermissions(module);
    const assigned = modulePermissions.filter(p => this.isAssigned(p.id));
    
    if (assigned.length === 0) return;
    
    this.saving = true;
    let completed = 0;
    let errors = 0;
    
    assigned.forEach(permission => {
      this.rolesService.removePermissionFromRole(this.roleId, permission.id).subscribe({
        next: () => {
          this.assignedPermissions.delete(permission.id);
          completed++;
          if (completed + errors === assigned.length) {
            this.emitPermissionsChange();
            this.message.success(`All permissions in "${module}" unassigned`);
            this.saving = false;
          }
        },
        error: () => {
          errors++;
          if (completed + errors === assigned.length) {
            this.message.error(`Failed to unassign some permissions`);
            this.saving = false;
          }
        }
      });
    });
  }

  getModulePermissions(module: string): Permission[] {
    return this.filteredPermissions.filter(p => p.module === module);
  }

  get filteredPermissions(): Permission[] {
    let filtered = this.allPermissions;
    
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(p =>
        p.module.toLowerCase().includes(term) ||
        p.action.toLowerCase().includes(term) ||
        p.description?.toLowerCase().includes(term)
      );
    }
    
    if (this.selectedModule) {
      filtered = filtered.filter(p => p.module === this.selectedModule);
    }
    
    return filtered;
  }

  get groupedPermissions(): PermissionGroup[] {
    const groups = new Map<string, Permission[]>();
    
    this.filteredPermissions.forEach(permission => {
      if (!groups.has(permission.module)) {
        groups.set(permission.module, []);
      }
      groups.get(permission.module)!.push(permission);
    });
    
    return Array.from(groups.entries()).map(([module, permissions]) => ({
      module,
      permissions: permissions.sort((a, b) => a.action.localeCompare(b.action))
    }));
  }

  get modules(): string[] {
    const moduleSet = new Set(this.allPermissions.map(p => p.module));
    return Array.from(moduleSet).sort();
  }

  get assignedCount(): number {
    return this.assignedPermissions.size;
  }

  get totalCount(): number {
    return this.allPermissions.length;
  }

  private emitPermissionsChange(): void {
    const permissions = this.allPermissions.filter(p => this.assignedPermissions.has(p.id));
    this.permissionsChange.emit(permissions);
  }
}
