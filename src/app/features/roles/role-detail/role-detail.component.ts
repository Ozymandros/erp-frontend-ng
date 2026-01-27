import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzMessageService } from 'ng-zorro-antd/message';
import { RolesService } from '../../../core/services/roles.service';
import { PermissionsService } from '../../../core/services/permissions.service';
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
    NzSelectModule
  ],
  templateUrl: './role-detail.component.html',
  styles: [`
    h1 {
      display: inline-block;
      margin: 0;
      vertical-align: middle;
    }
  `]
})
export class RoleDetailComponent implements OnInit {
  roleForm: FormGroup;
  roleId: string | null = null;
  isEditMode = false;
  loading = false;
  saving = false;
  allPermissions: Permission[] = [];

  constructor(
    private fb: FormBuilder,
    private rolesService: RolesService,
    private permissionsService: PermissionsService,
    private route: ActivatedRoute,
    private router: Router,
    private message: NzMessageService
  ) {
    this.roleForm = this.fb.group({
      name: ['', [Validators.required]],
      description: [''],
      permissionIds: [[]]
    });
  }

  ngOnInit(): void {
    this.roleId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.roleId && this.roleId !== 'new';
    
    this.loadPermissions();

    if (this.isEditMode && this.roleId) {
      this.loadRole(this.roleId);
    }
  }

  loadPermissions(): void {
    this.permissionsService.getAll({ pageSize: 1000 }).subscribe({
      next: (response) => {
        this.allPermissions = response.items;
      }
    });
  }

  loadRole(id: string): void {
    this.loading = true;
    this.rolesService.getById(id).subscribe({
      next: (role) => {
        this.roleForm.patchValue({
          name: role.name,
          description: role.description,
          permissionIds: role.permissions?.map((p: Permission) => p.id)
        });
        this.loading = false;
      },
      error: () => {
        this.message.error('Failed to load role');
        this.loading = false;
      }
    });
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
