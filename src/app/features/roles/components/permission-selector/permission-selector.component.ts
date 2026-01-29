import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, ChangeDetectorRef } from '@angular/core';
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
import { finalize, tap } from 'rxjs';
import { RolesService } from '../../../../core/services/roles.service';
import { PermissionsService } from '../../../../core/services/permissions.service';
import { Permission } from '../../../../types/api.types';
import { PermissionGroupComponent, PermissionGroup } from './permission-group.component';

@Component({
  selector: 'app-permission-selector',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzInputModule,
    NzSelectModule,
    NzSpinModule,
    PermissionGroupComponent
  ],
  templateUrl: './permission-selector.component.html',
  styleUrls: ['./permission-selector.component.css']
})
export class PermissionSelectorComponent implements OnInit, OnChanges {
  @Input() roleId!: string;
  @Input() initialPermissions: Permission[] = [];
  @Input() readonly = false;
  @Output() permissionsChange = new EventEmitter<Permission[]>();

  allPermissions: Permission[] = [];
  assignedPermissions: Set<string> = new Set();
  searchTerm = '';
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

  constructor(
    private rolesService: RolesService,
    private permissionsService: PermissionsService,
    private message: NzMessageService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/e29febe2-c049-45a2-b934-1123e1e94a05',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'permission-selector.component.ts:62',message:'ngOnInit: executing',data:{initialPermissionsCount:this.initialPermissions.length,initialPermissionsIds:this.initialPermissions.map(p=>p.id)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    // Update assignedPermissions Set - this ensures we have the latest value even if ngOnChanges ran first
    this.updateAssignedPermissions();
    this.loadPermissions();
  }

  private updateAssignedPermissions(): void {
    const newIds = new Set(this.initialPermissions.map(p => p.id));
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
      const previousIds = previousValue.map((p: Permission) => p.id).sort().join(',');
      const currentIds = currentValue.map((p: Permission) => p.id).sort().join(',');
      
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
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/e29febe2-c049-45a2-b934-1123e1e94a05',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'permission-selector.component.ts:65',message:'loadPermissions: setting loading=true',data:{loadingBefore:this.loading},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    this.loading = true;
    
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/e29febe2-c049-45a2-b934-1123e1e94a05',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'permission-selector.component.ts:68',message:'loadPermissions: calling getAll',data:{loading:this.loading},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    this.permissionsService.getAll({ pageSize: 1000 }).pipe(
      finalize(() => {
        // Always reset loading flag and trigger change detection
        // #region agent log
        fetch('http://127.0.0.1:7244/ingest/e29febe2-c049-45a2-b934-1123e1e94a05',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'permission-selector.component.ts:113',message:'loadPermissions finalize: executing',data:{loadingBefore:this.loading},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        this.loading = false;
        // #region agent log
        fetch('http://127.0.0.1:7244/ingest/e29febe2-c049-45a2-b934-1123e1e94a05',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'permission-selector.component.ts:115',message:'loadPermissions finalize: loading set to false, calling detectChanges',data:{loadingAfter:this.loading},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (response) => {
        // #region agent log
        fetch('http://127.0.0.1:7244/ingest/e29febe2-c049-45a2-b934-1123e1e94a05',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'permission-selector.component.ts:120',message:'loadPermissions next: received response',data:{loading:this.loading,isArray:Array.isArray(response),hasItems:response&&typeof response==='object'&&'items' in response,responseType:typeof response,responseKeys:response&&typeof response==='object'?Object.keys(response):null},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
        // #endregion
        // Handle both array response and paginated response formats
        if (Array.isArray(response)) {
          this.allPermissions = response;
          // #region agent log
          fetch('http://127.0.0.1:7244/ingest/e29febe2-c049-45a2-b934-1123e1e94a05',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'permission-selector.component.ts:124',message:'loadPermissions: array path taken',data:{permissionsCount:response.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
          // #endregion
        } else if (response && typeof response === 'object' && 'items' in response) {
          this.allPermissions = response.items;
          // #region agent log
          fetch('http://127.0.0.1:7244/ingest/e29febe2-c049-45a2-b934-1123e1e94a05',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'permission-selector.component.ts:127',message:'loadPermissions: paginated path taken',data:{permissionsCount:response.items?.length||0},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
          // #endregion
        } else {
          this.allPermissions = [];
          // #region agent log
          fetch('http://127.0.0.1:7244/ingest/e29febe2-c049-45a2-b934-1123e1e94a05',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'permission-selector.component.ts:130',message:'loadPermissions: empty array path taken',data:{responseType:typeof response},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
          // #endregion
        }
        // Initialize isAssigned property on each permission
        this.updateAssignedPermissions();
        // Clear caches when allPermissions changes
        this._filteredPermissions = null;
        this._groupedPermissions = null;
        // Clear caches when allPermissions changes
        this._filteredPermissions = null;
        this._groupedPermissions = null;
      },
      error: (err) => {
        // #region agent log
        fetch('http://127.0.0.1:7244/ingest/e29febe2-c049-45a2-b934-1123e1e94a05',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'permission-selector.component.ts:135',message:'loadPermissions error: handler executing',data:{loading:this.loading,errorMessage:err?.message,errorStatus:err?.status,errorName:err?.name},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
        // #endregion
        const errorMsg = `Failed to load permissions: ${err.message || 'Unknown error'}`;
        this.message.error(errorMsg);
      }
    });
  }

  assignPermission(permission: Permission): void {
    if (this.readonly || this.savingPermissionId || this.savingModule) return;
    
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/e29febe2-c049-45a2-b934-1123e1e94a05',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'permission-selector.component.ts:158',message:'assignPermission: starting',data:{permissionId:permission.id,isAssignedBefore:this.isAssigned(permission.id)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'})}).catch(()=>{});
    // #endregion
    this.savingPermissionId = permission.id; // Track which specific permission is being saved
    
    this.rolesService.addPermissionToRole(this.roleId, permission.id).pipe(
      finalize(() => {
        // Always reset saving flags, even if error handler throws
        // Defer to next tick to avoid ExpressionChangedAfterItHasBeenCheckedError
        setTimeout(() => {
          this.savingPermissionId = null;
          this.cdr.markForCheck();
        }, 0);
      })
    ).subscribe({
      next: () => {
        try {
          // Add permission to assignedPermissions Set
          this.assignedPermissions.add(permission.id);
          // #region agent log
          fetch('http://127.0.0.1:7244/ingest/e29febe2-c049-45a2-b934-1123e1e94a05',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'permission-selector.component.ts:190',message:'assignPermission next: added to Set, before emit',data:{permissionId:permission.id,assignedPermissionsSize:this.assignedPermissions.size},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'})}).catch(()=>{});
          // #endregion
          this.message.success(`Permission "${permission.module}.${permission.action}" assigned successfully`);
          // Emit after change detection to avoid circular updates
          this.emitPermissionsChange();
          // #region agent log
          fetch('http://127.0.0.1:7244/ingest/e29febe2-c049-45a2-b934-1123e1e94a05',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'permission-selector.component.ts:196',message:'assignPermission next: after emit',data:{permissionId:permission.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'})}).catch(()=>{});
          // #endregion
          // Don't call markForCheck() - cards will update independently via their OnPush change detection
          // This prevents group headers from re-rendering unnecessarily
        } catch (e) {
          console.error('Error in assignPermission next handler:', e);
        }
      },
      error: (err) => {
        try {
          const errorMsg = err?.message || `Failed to assign permission "${permission.module}.${permission.action}"`;
          this.message.error(errorMsg);
        } catch (e) {
          console.error('Error in assignPermission error handler:', e);
        }
      }
    });
  }

  unassignPermission(permission: Permission): void {
    if (this.readonly || this.savingPermissionId || this.savingModule) return;
    
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/e29febe2-c049-45a2-b934-1123e1e94a05',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'permission-selector.component.ts:192',message:'unassignPermission: starting',data:{permissionId:permission.id,isAssignedBefore:this.isAssigned(permission.id)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'})}).catch(()=>{});
    // #endregion
    this.savingPermissionId = permission.id; // Track which specific permission is being saved
    
    this.rolesService.removePermissionFromRole(this.roleId, permission.id).pipe(
      finalize(() => {
        // Always reset saving flags, even if error handler throws
        // Defer to next tick to avoid ExpressionChangedAfterItHasBeenCheckedError
        setTimeout(() => {
          this.savingPermissionId = null;
          this.cdr.markForCheck();
        }, 0);
      })
    ).subscribe({
      next: () => {
        try {
          this.assignedPermissions.delete(permission.id);
          // #region agent log
          fetch('http://127.0.0.1:7244/ingest/e29febe2-c049-45a2-b934-1123e1e94a05',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'permission-selector.component.ts:206',message:'unassignPermission next: removed from Set',data:{permissionId:permission.id,isAssignedAfter:this.isAssigned(permission.id)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'})}).catch(()=>{});
          // #endregion
          this.message.success(`Permission "${permission.module}.${permission.action}" unassigned successfully`);
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
          const errorMsg = err?.message || `Failed to unassign permission "${permission.module}.${permission.action}"`;
          this.message.error(errorMsg);
        } catch (e) {
          console.error('Error in unassignPermission error handler:', e);
        }
      }
    });
  }


  selectAllInModule(module: string): void {
    if (this.readonly || this.savingModule) return;
    
    // Set savingModule IMMEDIATELY to prevent multiple calls
    this.savingModule = module;
    
    // Use allPermissions, not filteredPermissions, to get ALL permissions in the module
    const modulePermissions = this.allPermissions.filter(p => p.module === module);
    const unassigned = modulePermissions.filter(p => !this.isAssigned(p.id));
    
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/e29febe2-c049-45a2-b934-1123e1e94a05',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'permission-selector.component.ts:selectAllInModule',message:'selectAllInModule: starting',data:{module,modulePermissionsCount:modulePermissions.length,unassignedCount:unassigned.length,unassignedIds:unassigned.map(p=>p.id)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H'})}).catch(()=>{});
    // #endregion
    
    if (unassigned.length === 0) {
      // Reset savingModule if nothing to do
      this.savingModule = null;
      return;
    }
    
    // Use bulk API endpoint for better performance
    const permissionIds = unassigned.map(p => p.id);
    this.rolesService.addPermissionToRole(this.roleId, permissionIds).subscribe({
      next: () => {
        // Add all permissions to assignedPermissions Set
        permissionIds.forEach(id => this.assignedPermissions.add(id));
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
        permissionIds.forEach(id => {
          // If error is not 409 (already assigned), we can't be sure it was added
          // But for 409, we know it's already assigned
          if (err?.status === 409) {
            this.assignedPermissions.add(id);
          }
        });
        this.emitPermissionsChange();
        const errorMsg = err?.message || `Failed to assign some permissions in "${module}"`;
        this.message.error(errorMsg);
        // Defer to next tick to avoid ExpressionChangedAfterItHasBeenCheckedError
        setTimeout(() => {
          this.savingModule = null;
          this.cdr.markForCheck();
        }, 0);
      }
    });
  }

  deselectAllInModule(module: string): void {
    if (this.readonly || this.savingModule) return;
    
    // Set savingModule IMMEDIATELY to prevent multiple calls
    this.savingModule = module;
    
    // Use allPermissions, not filteredPermissions, to get ALL permissions in the module
    const modulePermissions = this.allPermissions.filter(p => p.module === module);
    const assigned = modulePermissions.filter(p => this.isAssigned(p.id));
    
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/e29febe2-c049-45a2-b934-1123e1e94a05',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'permission-selector.component.ts:deselectAllInModule',message:'deselectAllInModule: starting',data:{module,modulePermissionsCount:modulePermissions.length,assignedCount:assigned.length,assignedIds:assigned.map(p=>p.id)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H'})}).catch(()=>{});
    // #endregion
    
    if (assigned.length === 0) {
      // Reset savingModule if nothing to do
      this.savingModule = null;
      return;
    }
    
    // Use bulk API endpoint for better performance
    const permissionIds = assigned.map(p => p.id);
    this.rolesService.removePermissionFromRole(this.roleId, permissionIds).subscribe({
      next: () => {
        // Remove all permissions from assignedPermissions Set
        permissionIds.forEach(id => this.assignedPermissions.delete(id));
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
        permissionIds.forEach(id => {
          // If error is not 404 (not found), we can't be sure it was removed
          // But for 404, we know it's already unassigned
          if (err?.status === 404) {
            this.assignedPermissions.delete(id);
          }
        });
        this.emitPermissionsChange();
        const errorMsg = err?.message || `Failed to unassign some permissions in "${module}"`;
        this.message.error(errorMsg);
        // Defer to next tick to avoid ExpressionChangedAfterItHasBeenCheckedError
        setTimeout(() => {
          this.savingModule = null;
          this.cdr.markForCheck();
        }, 0);
      }
    });
  }

  isAssigned(permissionId: string): boolean {
    const result = this.assignedPermissions.has(permissionId);
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/e29febe2-c049-45a2-b934-1123e1e94a05',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'permission-selector.component.ts:345',message:'isAssigned called',data:{permissionId,result,assignedPermissionsSize:this.assignedPermissions.size},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    return result;
  }

  getModulePermissions(module: string): Permission[] {
    return this.filteredPermissions.filter(p => p.module === module);
  }

  get filteredPermissions(): Permission[] {
    // Check if cache is still valid
    const searchChanged = this._lastSearchTerm !== this.searchTerm;
    const moduleChanged = this._lastSelectedModule !== this.selectedModule;
    const permissionsChanged = this._lastAllPermissionsLength !== this.allPermissions.length;
    
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/e29febe2-c049-45a2-b934-1123e1e94a05',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'permission-selector.component.ts:filteredPermissions',message:'filteredPermissions getter called',data:{searchTerm:this.searchTerm,selectedModule:this.selectedModule,searchChanged,moduleChanged,permissionsChanged,cacheValid:this._filteredPermissions!==null,allPermissionsCount:this.allPermissions.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'I'})}).catch(()=>{});
    // #endregion
    
    if (this._filteredPermissions === null || searchChanged || moduleChanged || permissionsChanged) {
      let filtered = this.allPermissions;
      
      if (this.searchTerm.trim()) {
        const term = this.searchTerm.toLowerCase();
        filtered = filtered.filter(p =>
          p.module.toLowerCase().includes(term) ||
          p.action.toLowerCase().includes(term) ||
          (p.description && p.description.toLowerCase().includes(term))
        );
      }
      
      if (this.selectedModule) {
        filtered = filtered.filter(p => p.module === this.selectedModule);
      }
      
      this._filteredPermissions = filtered;
      this._lastSearchTerm = this.searchTerm;
      this._lastSelectedModule = this.selectedModule;
      this._lastAllPermissionsLength = this.allPermissions.length;
      // Clear grouped cache when filtered changes
      this._groupedPermissions = null;
      
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/e29febe2-c049-45a2-b934-1123e1e94a05',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'permission-selector.component.ts:filteredPermissions',message:'filteredPermissions: cache updated',data:{filteredCount:filtered.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'I'})}).catch(()=>{});
      // #endregion
    }
    
    return this._filteredPermissions;
  }

  get groupedPermissions(): PermissionGroup[] {
    // Use cached value if available (cleared when filteredPermissions changes)
    if (this._groupedPermissions === null) {
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/e29febe2-c049-45a2-b934-1123e1e94a05',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'permission-selector.component.ts:groupedPermissions',message:'groupedPermissions: recalculating',data:{filteredPermissionsCount:this.filteredPermissions.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      const groups = new Map<string, Permission[]>();
      
      this.filteredPermissions.forEach(permission => {
        if (!groups.has(permission.module)) {
          groups.set(permission.module, []);
        }
        groups.get(permission.module)!.push(permission);
      });
      
      this._groupedPermissions = Array.from(groups.entries()).map(([module, permissions]): PermissionGroup => ({
        module,
        permissions: permissions.sort((a, b) => a.action.localeCompare(b.action))
      }));
      
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/e29febe2-c049-45a2-b934-1123e1e94a05',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'permission-selector.component.ts:groupedPermissions',message:'groupedPermissions: calculated',data:{groupsCount:this._groupedPermissions.length,groups:this._groupedPermissions.map(g=>({module:g.module,count:g.permissions.length}))},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
    }
    
    return this._groupedPermissions;
  }

  get modules(): string[] {
    const moduleSet = new Set(this.allPermissions.map(p => p.module));
    return Array.from(moduleSet).sort();
  }

  get assignedCount(): number {
    const count = this.assignedPermissions.size;
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/e29febe2-c049-45a2-b934-1123e1e94a05',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'permission-selector.component.ts:420',message:'assignedCount getter called',data:{count},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
    // #endregion
    return count;
  }

  get totalCount(): number {
    return this.allPermissions.length;
  }

  private emitPermissionsChange(): void {
    const permissions = this.allPermissions.filter(p => this.assignedPermissions.has(p.id));
    this.permissionsChange.emit(permissions);
  }
}
