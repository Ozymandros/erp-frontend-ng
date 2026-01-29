import { Component, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzMessageService } from 'ng-zorro-antd/message';
import { RolesService } from '../../../core/services/roles.service';
import { PermissionsService } from '../../../core/services/permissions.service';
import { PermissionService } from '../../../core/services/permission.service';
import { PERMISSION_MODULES, PERMISSION_ACTIONS } from '../../../core/constants/permissions';
import { PermissionSelectorComponent } from '../components/permission-selector/permission-selector.component';
import { Role, Permission } from '../../../types/api.types';
import { forkJoin, finalize } from 'rxjs';

@Component({
  selector: 'app-role-detail',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzCardModule,
    NzSelectModule,
    NzBadgeModule,
    PermissionSelectorComponent
  ],
  templateUrl: './role-detail.component.html',
  styleUrls: ['./role-detail.component.css']
})
export class RoleDetailComponent implements OnInit {
  roleForm: FormGroup;
  roleId: string | null = null;
  isEditMode = false;
  loading = false;
  saving = false;
  role: Role | null = null;
  rolePermissions: Permission[] = [];

  // Permission checks
  canUpdate = computed(() => {
    return this.permissionService.hasPermission(
      PERMISSION_MODULES.ROLES,
      PERMISSION_ACTIONS.UPDATE
    );
  });

  constructor(
    private fb: FormBuilder,
    private rolesService: RolesService,
    private permissionsService: PermissionsService,
    private permissionService: PermissionService,
    private route: ActivatedRoute,
    private router: Router,
    private message: NzMessageService
  ) {
    this.roleForm = this.fb.group({
      name: ['', [Validators.required]],
      description: ['']
    });
  }

  ngOnInit(): void {
    this.roleId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.roleId && this.roleId !== 'new';

    if (this.isEditMode && this.roleId) {
      this.loadRole(this.roleId);
    }
  }

  loadRole(id: string): void {
    this.loading = true;
    
    // Load role data and permissions in parallel
    forkJoin({
      role: this.rolesService.getById(id),
      permissions: this.rolesService.getRolePermissions(id)
    }).pipe(
      finalize(() => {
        this.loading = false;
      })
    ).subscribe({
      next: ({ role, permissions }) => {
        // #region agent log
        fetch('http://127.0.0.1:7244/ingest/e29febe2-c049-45a2-b934-1123e1e94a05',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'role-detail.component.ts:85',message:'loadRole: received role and permissions',data:{roleId:role.id,permissionsCount:permissions.length,permissionsIds:permissions.map(p=>p.id)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
        // #endregion
        this.role = role;
        this.rolePermissions = permissions;
        // #region agent log
        fetch('http://127.0.0.1:7244/ingest/e29febe2-c049-45a2-b934-1123e1e94a05',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'role-detail.component.ts:89',message:'loadRole: rolePermissions set',data:{rolePermissionsCount:this.rolePermissions.length,rolePermissionsIds:this.rolePermissions.map(p=>p.id)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
        // #endregion
        this.roleForm.patchValue({
          name: role.name,
          description: role.description
        });
      },
      error: (err) => {
        // #region agent log
        fetch('http://127.0.0.1:7244/ingest/e29febe2-c049-45a2-b934-1123e1e94a05',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'role-detail.component.ts:97',message:'loadRole: error loading',data:{errorMessage:err?.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
        // #endregion
        this.message.error('Failed to load role');
      }
    });
  }

  onPermissionsChange(permissions: Permission[]): void {
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/e29febe2-c049-45a2-b934-1123e1e94a05',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'role-detail.component.ts:114',message:'onPermissionsChange: received permissions',data:{permissionsCount:permissions.length,permissionsIds:permissions.map(p=>p.id),oldRolePermissionsCount:this.rolePermissions.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'G'})}).catch(()=>{});
    // #endregion
    // Compare IDs to avoid unnecessary updates that cause re-renders
    const oldIds = this.rolePermissions.map(p => p.id).sort().join(',');
    const newIds = permissions.map(p => p.id).sort().join(',');
    
    if (oldIds !== newIds) {
      // Only update if IDs actually changed
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/e29febe2-c049-45a2-b934-1123e1e94a05',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'role-detail.component.ts:120',message:'onPermissionsChange: IDs changed, updating rolePermissions',data:{oldIds,newIds},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'G'})}).catch(()=>{});
      // #endregion
      // Use requestAnimationFrame to defer update to next animation frame, avoiding interruption of current change detection
      requestAnimationFrame(() => {
        this.rolePermissions = permissions;
        // #region agent log
        fetch('http://127.0.0.1:7244/ingest/e29febe2-c049-45a2-b934-1123e1e94a05',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'role-detail.component.ts:124',message:'onPermissionsChange: rolePermissions updated',data:{rolePermissionsCount:this.rolePermissions.length,rolePermissionsIds:this.rolePermissions.map(p=>p.id)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'G'})}).catch(()=>{});
        // #endregion
      });
    } else {
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/e29febe2-c049-45a2-b934-1123e1e94a05',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'role-detail.component.ts:128',message:'onPermissionsChange: IDs unchanged, skipping update',data:{oldIds,newIds},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'G'})}).catch(()=>{});
      // #endregion
    }
  }

  save(): void {
    if (this.roleForm.valid) {
      this.saving = true;
      const data = this.roleForm.value;

      const obs = this.isEditMode && this.roleId
        ? this.rolesService.update(this.roleId, data)
        : this.rolesService.create(data);


      obs.subscribe({
        next: () => {
          this.message.success(`Role ${this.isEditMode ? 'updated' : 'created'} successfully`);
          this.router.navigate(['/roles']);
        },
        error: (err) => {
          this.message.error('Operation failed: ' + err.message);
          this.saving = false;
        }
      });
    }
  }
}
