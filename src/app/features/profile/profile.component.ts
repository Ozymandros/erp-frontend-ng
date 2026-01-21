import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { AuthService } from '@/app/core/services/auth.service';
import { UsersService } from '@/app/core/services/users.service';
import { User } from '@/app/types/api.types';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzCardModule,
    NzAvatarModule,
    NzTagModule
  ],
  template: `
    <div class="profile-container">
      <div class="page-header" style="margin-bottom: 24px;">
        <h1>User Profile</h1>
      </div>

      <div nz-row [nzGutter]="24">
        <div nz-col [nzSpan]="8">
          <nz-card style="text-align: center;">
            <nz-avatar [nzSize]="128" nzIcon="user" [nzSrc]="currentUser?.avatarUrl"></nz-avatar>
            <h2 style="margin-top: 16px;">{{ currentUser?.username }}</h2>
            <p>{{ currentUser?.email }}</p>
            <div style="margin-top: 16px;">
              <nz-tag *ngFor="let role of currentUser?.roles" [nzColor]="'blue'">{{ role.name }}</nz-tag>
            </div>
          </nz-card>
        </div>

        <div nz-col [nzSpan]="16">
          <nz-card nzTitle="Personal Information">
            <form nz-form [formGroup]="profileForm" (ngSubmit)="updateProfile()">
              <nz-form-item>
                <nz-form-label [nzSpan]="6">Username</nz-form-label>
                <nz-form-control [nzSpan]="18">
                  <input nz-input formControlName="username" readonly />
                </nz-form-control>
              </nz-form-item>

              <nz-form-item>
                <nz-form-label [nzSpan]="6" nzRequired>Email</nz-form-label>
                <nz-form-control [nzSpan]="18" nzErrorTip="Please input a valid email!">
                  <input nz-input formControlName="email" type="email" />
                </nz-form-control>
              </nz-form-item>

              <nz-form-item>
                <nz-form-label [nzSpan]="6">First Name</nz-form-label>
                <nz-form-control [nzSpan]="18">
                  <input nz-input formControlName="firstName" />
                </nz-form-control>
              </nz-form-item>

              <nz-form-item>
                <nz-form-label [nzSpan]="6">Last Name</nz-form-label>
                <nz-form-control [nzSpan]="18">
                  <input nz-input formControlName="lastName" />
                </nz-form-control>
              </nz-form-item>

              <nz-form-item>
                <nz-form-control [nzOffset]="6" [nzSpan]="18">
                  <button nz-button nzType="primary" [nzLoading]="saving" [disabled]="!profileForm.valid">
                    Save Changes
                  </button>
                </nz-form-control>
              </nz-form-item>
            </form>
          </nz-card>

          <nz-card nzTitle="Security" style="margin-top: 24px;">
            <form nz-form [formGroup]="passwordForm" (ngSubmit)="changePassword()">
              <nz-form-item>
                <nz-form-label [nzSpan]="6" nzRequired>New Password</nz-form-label>
                <nz-form-control [nzSpan]="18">
                  <input nz-input type="password" formControlName="password" />
                </nz-form-control>
              </nz-form-item>
              <nz-form-item>
                <nz-form-control [nzOffset]="6" [nzSpan]="18">
                  <button nz-button nzType="default" [nzLoading]="updatingPassword" [disabled]="!passwordForm.valid">
                    Change Password
                  </button>
                </nz-form-control>
              </nz-form-item>
            </form>
          </nz-card>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .profile-container {
      padding: 24px;
    }
    h1 { margin: 0; }
  `]
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;
  passwordForm: FormGroup;
  currentUser: User | null = null;
  saving = false;
  updatingPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private usersService: UsersService,
    private message: NzMessageService
  ) {
    this.profileForm = this.fb.group({
      username: [''],
      email: ['', [Validators.required, Validators.email]],
      firstName: [''],
      lastName: ['']
    });

    this.passwordForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.profileForm.patchValue({
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName
        });
      }
    });
  }

  updateProfile(): void {
    if (this.profileForm.valid && this.currentUser) {
      this.saving = true;
      this.usersService.updateUser(this.currentUser.id, this.profileForm.value).subscribe({
        next: () => {
          this.message.success('Profile updated successfully');
          this.saving = false;
        },
        error: (err) => {
          this.message.error('Failed to update profile: ' + err.message);
          this.saving = false;
        }
      });
    }
  }

  changePassword(): void {
    if (this.passwordForm.valid && this.currentUser) {
      this.updatingPassword = true;
      // Assume a specific endpoint or just update via user service
      this.usersService.updateUser(this.currentUser.id, { password: this.passwordForm.value.password }).subscribe({
        next: () => {
          this.message.success('Password changed successfully');
          this.passwordForm.reset();
          this.updatingPassword = false;
        },
        error: (err) => {
          this.message.error('Failed to change password: ' + err.message);
          this.updatingPassword = false;
        }
      });
    }
  }
}
