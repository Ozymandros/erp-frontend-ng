import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil, finalize } from 'rxjs';
import { PermissionsService } from '../../../../core/services/permissions.service';
import { RolesService } from '../../../../core/services/roles.service';
import { Permission } from '../../../../types/api.types';
import {
  PermissionGroup,
  PermissionGroupComponent,
} from './permission-group.component';

const SEARCH_MIN_LENGTH = 3;
const SEARCH_DEBOUNCE_MS = 300;

@Component({
  selector: 'app-permission-selector',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzIconModule,
    NzInputModule,
    NzSelectModule,
    NzSpaceModule,
    NzSpinModule,
    PermissionGroupComponent,
  ],
  templateUrl: './permission-selector.component.html',
  styleUrls: ['./permission-selector.component.css'],
})
export class PermissionSelectorComponent implements OnInit, OnChanges, OnDestroy {
  @Input() roleId!: string;
  @Input() initialPermissions: Permission[] = [];
  @Input() readonly = false;
  @Output() permissionsChange = new EventEmitter<Permission[]>();

  allPermissions: Permission[] = [];
  assignedPermissions: Set<string> = new Set();
  searchTerm = '';
  /** Effective search term used for filtering (debounced, min 3 chars). */
  effectiveSearchTerm = '';
  selectedModule: string | null = null;
  loading = false;
  savingPermissionId: string | null = null; // Track which specific permission is being saved
  savingModule: string | null = null; // Track which module is being saved (for selectAll/deselectAll)

  // Cache for computed properties to avoid re-rendering all items
  private _filteredPermissions: Permission[] | null = null;
  private _groupedPermissions: PermissionGroup[] | null = null;
  private _lastSearchTerm = '';
  private _lastSelectedModule: string | null = null;
  private _lastAllPermissionsLength = 0;
  private searchTerm$ = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(
    private rolesService: RolesService,
    private permissionsService: PermissionsService,
    private message: NzMessageService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.updateAssignedPermissions();
    this.loadPermissions();
    this.searchTerm$
      .pipe(debounceTime(SEARCH_DEBOUNCE_MS), takeUntil(this.destroy$))
      .subscribe((term) => {
        this.applySearchTerm(term);
        this._filteredPermissions = null;
        this._groupedPermissions = null;
        this.cdr.markForCheck();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private applySearchTerm(term: string): void {
    const t = (term || '').trim();
    this.effectiveSearchTerm = t.length >= SEARCH_MIN_LENGTH ? t : '';
  }

  private updateAssignedPermissions(): void {
    const newIds = new Set(this.initialPermissions.map((p) => p.id));
    // Only update if contents actually changed to avoid unnecessary re-renders
    const oldIds = Array.from(this.assignedPermissions).sort().join(',');
    const newIdsStr = Array.from(newIds).sort().join(',');
    if (oldIds !== newIdsStr) {
      this.assignedPermissions = newIds;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    // ✅ Update assignment lookup Set (cheap, O(1) access later)
    // Only update assignedPermissions when initialPermissions changes
    if (changes['initialPermissions'] && this.allPermissions.length > 0) {
      const previousValue = changes['initialPermissions'].previousValue || [];
      const currentValue = changes['initialPermissions'].currentValue || [];
      const previousIds = previousValue
        .map((p: Permission) => p.id)
        .sort()
        .join(',');
      const currentIds = currentValue
        .map((p: Permission) => p.id)
        .sort()
        .join(',');

      // Only update if IDs actually changed
      if (previousIds !== currentIds) {
        this.updateAssignedPermissions();
      }
    }

    // ✅ ONLY recalc grouping when STRUCTURE changes (filteredPermissions, allPermissions, etc.)
    // Critical: Do NOT recalculate groupedPermissions when only assignment state changes
    // The groupedPermissions getter already handles caching - we only need to clear cache on structural changes
    if (changes['allPermissions'] && this.allPermissions.length > 0) {
      // Clear cache when allPermissions structure changes (new permissions loaded)
      this._groupedPermissions = null;
    }
    // Note: groupedPermissions cache is already cleared in filteredPermissions getter when search/module filter changes
  }

  loadPermissions(): void {
    this.loading = true;

    this.permissionsService
      .getAll({ pageSize: 1000 })
      .pipe(
        finalize(() => {
          // Always reset loading flag and trigger change detection
          this.loading = false;
          this.cdr.detectChanges();
        }),
      )
      .subscribe({
        next: (response) => {
          // Handle both array response and paginated response formats
          if (Array.isArray(response)) {
            this.allPermissions = response;
          } else if (
            response &&
            typeof response === 'object' &&
            'items' in response
          ) {
            this.allPermissions = response.items;
          } else {
            this.allPermissions = [];
          }
          // Initialize isAssigned property on each permission
          this.updateAssignedPermissions();
          // Clear caches when allPermissions changes
          this._filteredPermissions = null;
          this._groupedPermissions = null;
        },
        error: (err) => {
          const errorMsg = `Failed to load permissions: ${err.message || 'Unknown error'}`;
          this.message.error(errorMsg);
        },
      });
  }

  assignPermission(permission: Permission): void {
    if (this.readonly || this.savingPermissionId || this.savingModule) return;

    this.savingPermissionId = permission.id; // Track which specific permission is being saved

    this.rolesService
      .addPermissionToRole(this.roleId, permission.id)
      .pipe(
        finalize(() => {
          // Always reset saving flags, even if error handler throws
          // Defer to next tick to avoid ExpressionChangedAfterItHasBeenCheckedError
          setTimeout(() => {
            this.savingPermissionId = null;
            this.cdr.markForCheck();
          }, 0);
        }),
      )
      .subscribe({
        next: () => {
          try {
            // Add permission to assignedPermissions Set
            this.assignedPermissions.add(permission.id);
            this.message.success(
              `Permission "${permission.module}.${permission.action}" assigned successfully`,
            );
            // Emit after change detection to avoid circular updates
            this.emitPermissionsChange();
            // Don't call markForCheck() - cards will update independently via their OnPush change detection
            // This prevents group headers from re-rendering unnecessarily
          } catch (e) {
            console.error('Error in assignPermission next handler:', e);
          }
        },
        error: (err) => {
          try {
            const errorMsg =
              err?.message ||
              `Failed to assign permission "${permission.module}.${permission.action}"`;
            this.message.error(errorMsg);
          } catch (e) {
            console.error('Error in assignPermission error handler:', e);
          }
        },
      });
  }

  unassignPermission(permission: Permission): void {
    if (this.readonly || this.savingPermissionId || this.savingModule) return;

    this.savingPermissionId = permission.id; // Track which specific permission is being saved

    this.rolesService
      .removePermissionFromRole(this.roleId, permission.id)
      .pipe(
        finalize(() => {
          // Always reset saving flags, even if error handler throws
          // Defer to next tick to avoid ExpressionChangedAfterItHasBeenCheckedError
          setTimeout(() => {
            this.savingPermissionId = null;
            this.cdr.markForCheck();
          }, 0);
        }),
      )
      .subscribe({
        next: () => {
          try {
            this.assignedPermissions.delete(permission.id);
            this.message.success(
              `Permission "${permission.module}.${permission.action}" unassigned successfully`,
            );
            // Emit after change detection to avoid circular updates
            this.emitPermissionsChange();
            // Don't call markForCheck() here - let cards update independently via their OnPush change detection
            // This prevents group headers from re-rendering unnecessarily
          } catch (e) {
            console.error('Error in unassignPermission next handler:', e);
          }
        },
        error: (err) => {
          try {
            const errorMsg =
              err?.message ||
              `Failed to unassign permission "${permission.module}.${permission.action}"`;
            this.message.error(errorMsg);
          } catch (e) {
            console.error('Error in unassignPermission error handler:', e);
          }
        },
      });
  }

  selectAllInModule(module: string): void {
    if (this.readonly || this.savingModule) return;

    // Set savingModule IMMEDIATELY to prevent multiple calls
    this.savingModule = module;

    // Use allPermissions, not filteredPermissions, to get ALL permissions in the module
    const modulePermissions = this.allPermissions.filter(
      (p) => p.module === module,
    );
    const unassigned = modulePermissions.filter((p) => !this.isAssigned(p.id));

    if (unassigned.length === 0) {
      // Reset savingModule if nothing to do
      this.savingModule = null;
      return;
    }

    // Use bulk API endpoint for better performance
    const permissionIds = unassigned.map((p) => p.id);
    this.rolesService
      .addPermissionToRole(this.roleId, permissionIds)
      .subscribe({
        next: () => {
          // Add all permissions to assignedPermissions Set
          permissionIds.forEach((id) => this.assignedPermissions.add(id));
          this.emitPermissionsChange();
          this.message.success(`All permissions in "${module}" assigned`);
          // Defer to next tick to avoid ExpressionChangedAfterItHasBeenCheckedError
          setTimeout(() => {
            this.savingModule = null;
            this.cdr.markForCheck();
          }, 0);
        },
        error: (err) => {
          // Even if some permissions fail, add successfully assigned ones
          // The backend may return partial success
          permissionIds.forEach((id) => {
            // If error is not 409 (already assigned), we can't be sure it was added
            // But for 409, we know it's already assigned
            if (err?.status === 409) {
              this.assignedPermissions.add(id);
            }
          });
          this.emitPermissionsChange();
          const errorMsg =
            err?.message || `Failed to assign some permissions in "${module}"`;
          this.message.error(errorMsg);
          // Defer to next tick to avoid ExpressionChangedAfterItHasBeenCheckedError
          setTimeout(() => {
            this.savingModule = null;
            this.cdr.markForCheck();
          }, 0);
        },
      });
  }

  deselectAllInModule(module: string): void {
    if (this.readonly || this.savingModule) return;

    // Set savingModule IMMEDIATELY to prevent multiple calls
    this.savingModule = module;

    // Use allPermissions, not filteredPermissions, to get ALL permissions in the module
    const modulePermissions = this.allPermissions.filter(
      (p) => p.module === module,
    );
    const assigned = modulePermissions.filter((p) => this.isAssigned(p.id));

    if (assigned.length === 0) {
      // Reset savingModule if nothing to do
      this.savingModule = null;
      return;
    }

    // Use bulk API endpoint for better performance
    const permissionIds = assigned.map((p) => p.id);
    this.rolesService
      .removePermissionFromRole(this.roleId, permissionIds)
      .subscribe({
        next: () => {
          // Remove all permissions from assignedPermissions Set
          permissionIds.forEach((id) => this.assignedPermissions.delete(id));
          this.emitPermissionsChange();
          this.message.success(`All permissions in "${module}" unassigned`);
          // Defer to next tick to avoid ExpressionChangedAfterItHasBeenCheckedError
          setTimeout(() => {
            this.savingModule = null;
            this.cdr.markForCheck();
          }, 0);
        },
        error: (err) => {
          // Even if some permissions fail, remove successfully unassigned ones
          // The backend may return partial success
          permissionIds.forEach((id) => {
            // If error is not 404 (not found), we can't be sure it was removed
            // But for 404, we know it's already unassigned
            if (err?.status === 404) {
              this.assignedPermissions.delete(id);
            }
          });
          this.emitPermissionsChange();
          const errorMsg =
            err?.message ||
            `Failed to unassign some permissions in "${module}"`;
          this.message.error(errorMsg);
          // Defer to next tick to avoid ExpressionChangedAfterItHasBeenCheckedError
          setTimeout(() => {
            this.savingModule = null;
            this.cdr.markForCheck();
          }, 0);
        },
      });
  }

  isAssigned(permissionId: string): boolean {
    return this.assignedPermissions.has(permissionId);
  }

  /** Called when search or module filter changes to ensure view updates */
  onSearchOrModuleChange(): void {
    this._filteredPermissions = null;
    this._groupedPermissions = null;
    this.applySearchTerm(this.searchTerm);
    this.searchTerm$.next(this.searchTerm);
    this.cdr.markForCheck();
  }

  getModulePermissions(module: string): Permission[] {
    return this.filteredPermissions.filter((p) => p.module === module);
  }

  get filteredPermissions(): Permission[] {
    const searchChanged = this._lastSearchTerm !== this.effectiveSearchTerm;
    const moduleChanged = this._lastSelectedModule !== this.selectedModule;
    const permissionsChanged =
      this._lastAllPermissionsLength !== this.allPermissions.length;

    if (
      this._filteredPermissions === null ||
      searchChanged ||
      moduleChanged ||
      permissionsChanged
    ) {
      let filtered = this.allPermissions;
      const term = (this.effectiveSearchTerm || '').trim();

      if (term) {
        const termLower = term.toLowerCase();
        filtered = filtered.filter(
          (p) =>
            (p.module && p.module.toLowerCase().includes(termLower)) ||
            (p.action && p.action.toLowerCase().includes(termLower)) ||
            (p.description != null &&
              String(p.description).toLowerCase().includes(termLower)),
        );
      }

      if (this.selectedModule) {
        filtered = filtered.filter((p) => p.module === this.selectedModule);
      }

      this._filteredPermissions = filtered;
      this._lastSearchTerm = this.effectiveSearchTerm;
      this._lastSelectedModule = this.selectedModule;
      this._lastAllPermissionsLength = this.allPermissions.length;
      // Clear grouped cache when filtered changes
      this._groupedPermissions = null;
    }

    return this._filteredPermissions;
  }

  get groupedPermissions(): PermissionGroup[] {
    // Use cached value if available (cleared when filteredPermissions changes)
    if (this._groupedPermissions === null) {
      const groups = new Map<string, Permission[]>();

      this.filteredPermissions.forEach((permission) => {
        if (!groups.has(permission.module)) {
          groups.set(permission.module, []);
        }
        groups.get(permission.module)!.push(permission);
      });

      this._groupedPermissions = Array.from(groups.entries()).map(
        ([module, permissions]): PermissionGroup => ({
          module,
          permissions: permissions.sort((a, b) =>
            a.action.localeCompare(b.action),
          ),
        }),
      );
    }

    return this._groupedPermissions;
  }

  get modules(): string[] {
    const moduleSet = new Set(this.allPermissions.map((p) => p.module));
    return Array.from(moduleSet).sort();
  }

  get assignedCount(): number {
    return this.assignedPermissions.size;
  }

  get totalCount(): number {
    return this.allPermissions.length;
  }

  private emitPermissionsChange(): void {
    const permissions = this.allPermissions.filter((p) =>
      this.assignedPermissions.has(p.id),
    );
    this.permissionsChange.emit(permissions);
  }
}
