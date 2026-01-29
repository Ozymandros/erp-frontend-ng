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
import { PermissionCardComponent } from './permission-card.component';

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
    NzSpinModule,
    PermissionCardComponent
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
  saving = false;
  private skipNextChange = false; // Flag to skip ngOnChanges when change comes from our own emit
  
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
    // Skip update if this change was triggered by our own emit (to prevent circular updates)
    if (this.skipNextChange) {
      this.skipNextChange = false;
      return;
    }
    
    // Update assignedPermissions whenever initialPermissions changes
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
    if (this.readonly || this.saving) return;
    
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/e29febe2-c049-45a2-b934-1123e1e94a05',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'permission-selector.component.ts:158',message:'assignPermission: starting',data:{permissionId:permission.id,isAssignedBefore:this.isAssigned(permission.id)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'})}).catch(()=>{});
    // #endregion
    this.saving = true;
    
    this.rolesService.addPermissionToRole(this.roleId, permission.id).pipe(
      finalize(() => {
        // Always reset saving flag, even if error handler throws
        this.saving = false;
        // Don't call detectChanges() - let Angular handle change detection naturally
        // This prevents unnecessary re-rendering of all cards
      })
    ).subscribe({
      next: () => {
        try {
          // Add permission to assignedPermissions Set
          this.assignedPermissions.add(permission.id);
          // #region agent log
          fetch('http://127.0.0.1:7244/ingest/e29febe2-c049-45a2-b934-1123e1e94a05',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'permission-selector.component.ts:172',message:'assignPermission next: added to Set',data:{permissionId:permission.id,isAssignedAfter:this.isAssigned(permission.id)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'})}).catch(()=>{});
          // #endregion
          this.message.success(`Permission "${permission.module}.${permission.action}" assigned successfully`);
          // Emit after change detection to avoid circular updates
          this.emitPermissionsChange();
          // Don't call markForCheck() - Zone.js will trigger change detection automatically after HTTP request
          // OnPush will ensure only the card whose isAssigned input changed will update
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
    if (this.readonly || this.saving) return;
    
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/e29febe2-c049-45a2-b934-1123e1e94a05',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'permission-selector.component.ts:192',message:'unassignPermission: starting',data:{permissionId:permission.id,isAssignedBefore:this.isAssigned(permission.id)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'})}).catch(()=>{});
    // #endregion
    this.saving = true;
    
    this.rolesService.removePermissionFromRole(this.roleId, permission.id).pipe(
      finalize(() => {
        // Always reset saving flag, even if error handler throws
        this.saving = false;
        // Don't call detectChanges() - let Angular handle change detection naturally
        // This prevents unnecessary re-rendering of all cards
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
          // Don't call markForCheck() - Zone.js will trigger change detection automatically after HTTP request
          // OnPush will ensure only the card whose isAssigned input changed will update
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
    if (this.readonly || this.saving) return;
    
    const modulePermissions = this.getModulePermissions(module);
    const unassigned = modulePermissions.filter(p => !this.isAssigned(p.id));
    
    if (unassigned.length === 0) return;
    
    this.saving = true;
    let completed = 0;
    let errors = 0;
    const total = unassigned.length;
    
    const checkComplete = () => {
      if (completed === total) {
        this.emitPermissionsChange();
        if (errors === 0) {
          this.message.success(`All permissions in "${module}" assigned`);
        } else if (errors === total) {
          this.message.error(`Failed to assign permissions`);
        } else {
          this.message.error(`Failed to assign some permissions`);
        }
        this.saving = false;
        // Don't call markForCheck() - Zone.js will trigger change detection automatically after HTTP requests
        // OnPush will ensure only cards whose isAssigned input changed will update
      }
    };
    
    unassigned.forEach(permission => {
      this.rolesService.addPermissionToRole(this.roleId, permission.id).pipe(
        finalize(() => {
          completed++;
          if (completed === total) {
            this.saving = false;
          }
          checkComplete();
        })
      ).subscribe({
        next: () => {
          this.assignedPermissions.add(permission.id);
        },
        error: () => {
          errors++;
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
    const total = assigned.length;
    
    const checkComplete = () => {
      if (completed === total) {
        this.emitPermissionsChange();
        if (errors === 0) {
          this.message.success(`All permissions in "${module}" unassigned`);
        } else if (errors === total) {
          this.message.error(`Failed to unassign permissions`);
        } else {
          this.message.error(`Failed to unassign some permissions`);
        }
        this.saving = false;
        // Don't call markForCheck() - Zone.js will trigger change detection automatically after HTTP requests
        // OnPush will ensure only cards whose isAssigned input changed will update
      }
    };
    
    assigned.forEach(permission => {
      this.rolesService.removePermissionFromRole(this.roleId, permission.id).pipe(
        finalize(() => {
          completed++;
          if (completed === total) {
            this.saving = false;
          }
          checkComplete();
        })
      ).subscribe({
        next: () => {
          this.assignedPermissions.delete(permission.id);
        },
        error: () => {
          errors++;
        }
      });
    });
  }

  isAssigned(permissionId: string): boolean {
    return this.assignedPermissions.has(permissionId);
  }

  getModulePermissions(module: string): Permission[] {
    return this.filteredPermissions.filter(p => p.module === module);
  }

  get filteredPermissions(): Permission[] {
    // Check if cache is still valid
    const searchChanged = this._lastSearchTerm !== this.searchTerm;
    const moduleChanged = this._lastSelectedModule !== this.selectedModule;
    const permissionsChanged = this._lastAllPermissionsLength !== this.allPermissions.length;
    
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
    }
    
    return this._filteredPermissions;
  }

  get groupedPermissions(): PermissionGroup[] {
    // Use cached value if available (cleared when filteredPermissions changes)
    if (this._groupedPermissions === null) {
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
    }
    
    return this._groupedPermissions;
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
    // Set flag to skip next ngOnChanges to prevent circular update
    this.skipNextChange = true;
    this.permissionsChange.emit(permissions);
    // Reset flag after change detection cycle completes
    setTimeout(() => {
      this.skipNextChange = false;
    }, 0);
  }
}
