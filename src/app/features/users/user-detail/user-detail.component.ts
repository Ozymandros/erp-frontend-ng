import { Component, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzMessageService } from 'ng-zorro-antd/message';
import { UsersService } from '../../../core/services/users.service';
import { RolesService } from '../../../core/services/roles.service';
import { PermissionService } from '../../../core/services/permission.service';
import { PERMISSION_MODULES, PERMISSION_ACTIONS } from '../../../core/constants/permissions';
import { RoleSelectorComponent } from '../components/role-selector/role-selector.component';
import { User, Role } from '../../../types/api.types';
import { AppButtonComponent, AppInputComponent } from '../../../shared/components';

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    NzFormModule,
    NzCardModule,
    NzSwitchModule,
    NzBadgeModule,
    NzGridModule,
    RoleSelectorComponent,
    AppButtonComponent,
    AppInputComponent
  ],
  templateUrl: './user-detail.component.html',
  styleUrls: ['./user-detail.component.css']
})
export class UserDetailComponent implements OnInit {
  userForm: FormGroup;
  userId: string | null = null;
  isEditMode = false;
  loading = false;
  saving = false;
  user: User | null = null;
  userRoles: Role[] = [];

  // Permission checks
  canUpdate = computed(() => {
    return this.permissionService.hasPermission(
      PERMISSION_MODULES.USERS,
      PERMISSION_ACTIONS.UPDATE
    );
  });

  constructor(
    private readonly fb: FormBuilder,
    private readonly usersService: UsersService,
    private readonly rolesService: RolesService,
    private readonly permissionService: PermissionService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly message: NzMessageService
  ) {
    this.userForm = this.fb.group({
      username: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      firstName: [''],
      lastName: [''],
      password: [''],
      isActive: [true]
    });
  }

  ngOnInit(): void {
    this.userId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.userId && this.userId !== 'new';

    if (this.isEditMode && this.userId) {
      this.loadUser(this.userId);
      this.userForm.get('password')?.clearValidators();
    } else {
      this.userForm.get('password')?.setValidators([Validators.required]);
    }
  }

  loadUser(id: string): void {
    this.loading = true;
    this.usersService.getById(id).subscribe({
      next: (user) => {
        this.user = user;
        this.userRoles = user.roles || [];
        this.userForm.patchValue({
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          isActive: user.isActive
        });
        this.loading = false;
      },
      error: (err) => {
        this.message.error('Failed to load user: ' + err.message);
        this.loading = false;
      }
    });
  }

  onRolesChange(roles: Role[]): void {
    this.userRoles = roles;
    // Refresh user data to get updated permissions
    if (this.userId) {
      this.usersService.getById(this.userId).subscribe({
        next: (user) => {
          this.user = user;
          this.userRoles = user.roles || [];
        }
      });
    }
  }

  save(): void {
    if (this.userForm.valid) {
      this.saving = true;
      const data = this.userForm.value;

      const observable = this.isEditMode && this.userId
        ? this.usersService.update(this.userId, data)
        : this.usersService.create(data);


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
