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
import { RolesService } from '@/app/core/services/roles.service';
import { PermissionsService } from '@/app/core/services/permissions.service';
import { Role, Permission } from '@/app/types/api.types';

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
  template: `
    <div class="role-detail">
      <div class="page-header" style="margin-bottom: 24px;">
        <button nz-button nzType="default" routerLink="/roles" style="margin-right: 16px;">
          <i nz-icon nzType="arrow-left"></i> Back
        </button>
        <h1>{{ isEditMode ? 'Edit Role' : 'Create Role' }}</h1>
      </div>

      <nz-card [nzLoading]="loading">
        <form nz-form [formGroup]="roleForm" (ngSubmit)="save()">
          <nz-form-item>
            <nz-form-label [nzSpan]="4" nzRequired>Role Name</nz-form-label>
            <nz-form-control [nzSpan]="14" nzErrorTip="Please input role name!">
              <input nz-input formControlName="name" placeholder="e.g. Administrator" />
            </nz-form-control>
          </nz-form-item>

          <nz-form-item>
            <nz-form-label [nzSpan]="4">Description</nz-form-label>
            <nz-form-control [nzSpan]="14">
              <textarea nz-input formControlName="description" placeholder="Role description..." [nzAutosize]="{ minRows: 2, maxRows: 6 }"></textarea>
            </nz-form-control>
          </nz-form-item>

          <nz-form-item>
            <nz-form-label [nzSpan]="4">Permissions</nz-form-label>
            <nz-form-control [nzSpan]="14">
              <nz-select formControlName="permissionIds" nzMode="multiple" nzPlaceHolder="Select permissions">
                <nz-option *ngFor="let p of allPermissions" [nzValue]="p.id" [nzLabel]="p.module + ':' + p.action"></nz-option>
              </nz-select>
            </nz-form-control>
          </nz-form-item>

          <nz-form-item>
            <nz-form-control [nzOffset]="4" [nzSpan]="14">
              <button nz-button nzType="primary" [nzLoading]="saving" [disabled]="!roleForm.valid">
                {{ isEditMode ? 'Update' : 'Create' }}
              </button>
              <button nz-button nzType="default" type="button" routerLink="/roles" style="margin-left: 8px;">Cancel</button>
            </nz-form-control>
          </nz-form-item>
        </form>
      </nz-card>
    </div>
  `,
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
    this.permissionsService.getPermissions({ pageSize: 1000 }).subscribe({
      next: (response) => {
        this.allPermissions = response.items;
      }
    });
  }

  loadRole(id: string): void {
    this.loading = true;
    this.rolesService.getRoleById(id).subscribe({
      next: (role) => {
        this.roleForm.patchValue({
          name: role.name,
          description: role.description,
          permissionIds: role.permissions.map(p => p.id)
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
        ? this.rolesService.updateRole(this.roleId, data)
        : this.rolesService.createRole(data);

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
