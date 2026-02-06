import { Component, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzMessageService } from 'ng-zorro-antd/message';
import { RolesService } from '../../../core/services/roles.service';
import { PermissionsService } from '../../../core/services/permissions.service';
import { PermissionService } from '../../../core/services/permission.service';
import { PERMISSION_MODULES, PERMISSION_ACTIONS } from '../../../core/constants/permissions';
import { PermissionSelectorComponent } from '../components/permission-selector/permission-selector.component';
import { AssignedPermissionsViewComponent } from '../components/assigned-permissions-view/assigned-permissions-view.component';
import { Role, Permission } from '../../../types/api.types';
import { forkJoin, finalize } from 'rxjs';
import { AppButtonComponent, AppInputComponent, AppTextareaComponent } from '../../../shared/components';

@Component({
  selector: 'app-role-detail',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    NzFormModule,
    NzCardModule,
    PermissionSelectorComponent,
    AssignedPermissionsViewComponent,
    AppButtonComponent,
    AppInputComponent,
    AppTextareaComponent
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
    private readonly fb: FormBuilder,
    private readonly rolesService: RolesService,
    private readonly permissionsService: PermissionsService,
    private readonly permissionService: PermissionService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly message: NzMessageService
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
        this.role = role;
        this.rolePermissions = permissions;
        this.roleForm.patchValue({
          name: role.name,
          description: role.description
        });
      },
      error: (_err) => {
        this.message.error('Failed to load role');
      }
    });
  }

  onPermissionsChange(permissions: Permission[]): void {
    // Compare IDs to avoid unnecessary updates that cause re-renders
    const oldIds = this.rolePermissions.map(p => p.id).sort((a, b) => a.localeCompare(b)).join(',');
    const newIds = permissions.map(p => p.id).sort((a, b) => a.localeCompare(b)).join(',');
    
    if (oldIds !== newIds) {
      // Only update if IDs actually changed
      // Use setTimeout to defer update to next JavaScript event loop tick, ensuring it happens after Angular's change detection completes
      setTimeout(() => {
        this.rolePermissions = permissions;
      }, 0);
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
