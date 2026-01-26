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
import { UsersService } from '../../../core/services/users.service';
import { RolesService } from '../../../core/services/roles.service';
import { User, Role } from '../../../types/api.types';

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
  templateUrl: './user-detail.component.html',
  styleUrls: ['./user-detail.component.css']
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
      roleIds: [[]]
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
          roleIds: user.roles?.map((r: { id: string }) => r.id)
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
