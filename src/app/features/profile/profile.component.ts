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
import { AuthService } from '../../core/services/auth.service';
import { UsersService } from '../../core/services/users.service';
import { User } from '../../types/api.types';

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
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
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
