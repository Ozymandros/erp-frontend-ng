import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzMessageService } from 'ng-zorro-antd/message';
import { UsersService } from '@/app/core/services/users.service';
import { RolesService } from '@/app/core/services/roles.service';
import { User, Role } from '@/app/types/api.types';

@Component({
  selector: 'app-user-detail',
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
    NzSwitchModule
  ],
  template: `
    <div class="user-detail">
      <div class="page-header">
        <button nz-button nzType="default" routerLink="/users">
          <span nz-icon nzType="arrow-left"></span>
          Back to List
        </button>
        <h1>{{ isEditMode ? 'Edit User' : 'Create User' }}</h1>
      </div>

      <nz-card [nzLoading]="loading">
        <form nz-form [formGroup]="userForm" (ngSubmit)="save()">
          <div nz-row [nzGutter]="16">
            <div nz-col [nzSpan]="12">
              <nz-form-item>
                <nz-form-label nzRequired>Username</nz-form-label>
                <nz-form-control nzErrorTip="Please input username!">
                  <input nz-input formControlName="username" placeholder="Username" />
                </nz-form-control>
              </nz-form-item>
            </div>
            <div nz-col [nzSpan]="12">
              <nz-form-item>
                <nz-form-label nzRequired>Email</nz-form-label>
                <nz-form-control nzErrorTip="Please input a valid email!">
                  <input nz-input formControlName="email" type="email" placeholder="Email" />
                </nz-form-control>
              </nz-form-item>
            </div>
          </div>

          <div nz-row [nzGutter]="16">
            <div nz-col [nzSpan]="12">
              <nz-form-item>
                <nz-form-label>First Name</nz-form-label>
                <nz-form-control>
                  <input nz-input formControlName="firstName" placeholder="First Name" />
                </nz-form-control>
              </nz-form-item>
            </div>
            <div nz-col [nzSpan]="12">
              <nz-form-item>
                <nz-form-label>Last Name</nz-form-label>
                <nz-form-control>
                  <input nz-input formControlName="lastName" placeholder="Last Name" />
                </nz-form-control>
              </nz-form-item>
            </div>
          </div>

          <div nz-row [nzGutter]="16" *ngIf="!isEditMode">
            <div nz-col [nzSpan]="12">
              <nz-form-item>
                <nz-form-label nzRequired>Password</nz-form-label>
                <nz-form-control nzErrorTip="Password is required!">
                  <input nz-input formControlName="password" type="password" placeholder="Password" />
                </nz-form-control>
              </nz-form-item>
            </div>
          </div>

          <div nz-row [nzGutter]="16">
            <div nz-col [nzSpan]="12">
              <nz-form-item>
                <nz-form-label>Roles</nz-form-label>
                <nz-form-control>
                  <nz-select formControlName="roleIds" nzMode="multiple" nzPlaceHolder="Select roles">
                    <nz-option *ngFor="let role of allRoles" [nzValue]="role.id" [nzLabel]="role.name"></nz-option>
                  </nz-select>
                </nz-form-control>
              </nz-form-item>
            </div>
            <div nz-col [nzSpan]="12">
              <nz-form-item>
                <nz-form-label>Active</nz-form-label>
                <nz-form-control>
                  <nz-switch formControlName="isActive"></nz-switch>
                </nz-form-control>
              </nz-form-item>
            </div>
          </div>

          <div class="form-actions">
            <button nz-button nzType="primary" [nzLoading]="saving" [disabled]="!userForm.valid">
              {{ isEditMode ? 'Update' : 'Create' }}
            </button>
            <button nz-button nzType="default" type="button" routerLink="/users">Cancel</button>
          </div>
        </form>
      </nz-card>
    </div>
  `,
  styles: [`
    .user-detail {
      padding: 24px;
    }

    .page-header {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 24px;
    }

    .page-header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 500;
    }

    .form-actions {
      margin-top: 24px;
      display: flex;
      gap: 8px;
    }
  `]
})
export class UserDetailComponent implements OnInit {
  userForm: FormGroup;
  userId: string | null = null;
  isEditMode = false;
  loading = false;
  saving = false;
  allRoles: Role[] = [];

  constructor(
    private fb: FormBuilder,
    private usersService: UsersService,
    private rolesService: RolesService,
    private route: ActivatedRoute,
    private router: Router,
    private message: NzMessageService
  ) {
    this.userForm = this.fb.group({
      username: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      firstName: [''],
      lastName: [''],
      password: [''],
      roleIds: [[]],
      isActive: [true]
    });
  }

  ngOnInit(): void {
    this.userId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.userId && this.userId !== 'new';
    
    this.loadRoles();

    if (this.isEditMode && this.userId) {
      this.loadUser(this.userId);
      this.userForm.get('password')?.clearValidators();
    } else {
      this.userForm.get('password')?.setValidators([Validators.required]);
    }
  }

  loadRoles(): void {
    this.rolesService.getRoles({ pageSize: 100 }).subscribe({
      next: (response) => {
        this.allRoles = response.items;
      }
    });
  }

  loadUser(id: string): void {
    this.loading = true;
    this.usersService.getUserById(id).subscribe({
      next: (user) => {
        this.userForm.patchValue({
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          isActive: user.isActive,
          roleIds: user.roles.map(r => r.id)
        });
        this.loading = false;
      },
      error: (err) => {
        this.message.error('Failed to load user: ' + err.message);
        this.loading = false;
      }
    });
  }

  save(): void {
    if (this.userForm.valid) {
      this.saving = true;
      const data = this.userForm.value;

      const observable = this.isEditMode && this.userId
        ? this.usersService.updateUser(this.userId, data)
        : this.usersService.createUser(data);

      observable.subscribe({
        next: () => {
          this.message.success(`User ${this.isEditMode ? 'updated' : 'created'} successfully`);
          this.router.navigate(['/users']);
        },
        error: (err) => {
          this.message.error(`Failed to ${this.isEditMode ? 'update' : 'create'} user: ` + err.message);
          this.saving = false;
        }
      });
    }
  }
}
