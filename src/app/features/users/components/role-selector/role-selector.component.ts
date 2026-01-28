import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzMessageService } from 'ng-zorro-antd/message';
import { UsersService } from '../../../../core/services/users.service';
import { RolesService } from '../../../../core/services/roles.service';
import { Role } from '../../../../types/api.types';

@Component({
  selector: 'app-role-selector',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzCardModule,
    NzButtonModule,
    NzInputModule,
    NzIconModule,
    NzBadgeModule,
    NzSpinModule
  ],
  templateUrl: './role-selector.component.html',
  styleUrls: ['./role-selector.component.css']
})
export class RoleSelectorComponent implements OnInit {
  @Input() userId!: string;
  @Input() initialRoles: Role[] = [];
  @Input() readonly = false;
  @Output() rolesChange = new EventEmitter<Role[]>();

  allRoles: Role[] = [];
  assignedRoles: Set<string> = new Set();
  searchTerm = '';
  loading = false;
  saving = false;
  error: string | null = null;

  constructor(
    private usersService: UsersService,
    private rolesService: RolesService,
    private message: NzMessageService
  ) {}

  ngOnInit(): void {
    this.assignedRoles = new Set(this.initialRoles.map(r => r.id));
    this.loadRoles();
  }

  loadRoles(): void {
    this.loading = true;
    this.error = null;
    
    this.rolesService.getAll({ pageSize: 100 }).subscribe({
      next: (response) => {
        this.allRoles = response.items;
        this.loading = false;
      },
      error: (err) => {
        this.error = `Failed to load roles: ${err.message || 'Unknown error'}`;
        this.loading = false;
        this.message.error(this.error);
      }
    });
  }

  assignRole(role: Role): void {
    if (this.readonly || this.saving) return;
    
    this.saving = true;
    this.error = null;
    
    this.usersService.assignRole(this.userId, role.name).subscribe({
      next: () => {
        this.assignedRoles.add(role.id);
        this.emitRolesChange();
        this.message.success(`Role "${role.name}" assigned successfully`);
        this.saving = false;
      },
      error: (err) => {
        const errorMsg = err.message || `Failed to assign role "${role.name}"`;
        this.error = errorMsg;
        this.message.error(errorMsg);
        this.saving = false;
      }
    });
  }

  unassignRole(role: Role): void {
    if (this.readonly || this.saving) return;
    
    this.saving = true;
    this.error = null;
    
    this.usersService.removeRole(this.userId, role.name).subscribe({
      next: () => {
        this.assignedRoles.delete(role.id);
        this.emitRolesChange();
        this.message.success(`Role "${role.name}" unassigned successfully`);
        this.saving = false;
      },
      error: (err) => {
        const errorMsg = err.message || `Failed to unassign role "${role.name}"`;
        this.error = errorMsg;
        this.message.error(errorMsg);
        this.saving = false;
      }
    });
  }

  isAssigned(roleId: string): boolean {
    return this.assignedRoles?.has(roleId) || false;
  }

  get filteredRoles(): Role[] {
    if (!this.searchTerm.trim()) {
      return this.allRoles || [];
    }
    const term = this.searchTerm.toLowerCase();
    return this.allRoles?.filter((role: Role) =>
      role.name.toLowerCase().includes(term) ||
      role.description?.toLowerCase().includes(term)
    ) || [];
  }

  get assignedCount(): number {
    return this.assignedRoles?.size || 0;
  }

  get totalCount(): number {
    return this.allRoles?.length || 0;
  }

  private emitRolesChange(): void {
    const roles = this.allRoles?.filter(r => this.assignedRoles?.has(r.id)) || [];
    this.rolesChange.emit(roles);
  }
}
