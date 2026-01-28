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
    this.rolesService.getById(id).subscribe({
      next: (role) => {
        this.role = role;
        this.rolePermissions = role.permissions || [];
        this.roleForm.patchValue({
          name: role.name,
          description: role.description
        });
        this.loading = false;
      },
      error: () => {
        this.message.error('Failed to load role');
        this.loading = false;
      }
    });
  }

  onPermissionsChange(permissions: Permission[]): void {
    this.rolePermissions = permissions;
    // Refresh role data to get updated permissions
    if (this.roleId) {
      this.rolesService.getById(this.roleId).subscribe({
        next: (role) => {
          this.role = role;
          this.rolePermissions = role.permissions || [];
        }
      });
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
