import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzMessageService } from 'ng-zorro-antd/message';
import { AuthService } from '@/app/core/services/auth.service';
import { RegisterRequest } from '@/app/types/api.types';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzCardModule
  ],
  template: `
    <div class="register-container">
      <nz-card class="register-card" nzTitle="Create Account">
        <form nz-form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
          <nz-form-item>
            <nz-form-label nzRequired>Username</nz-form-label>
            <nz-form-control nzErrorTip="Please input your username!">
              <input nz-input formControlName="username" placeholder="Username" />
            </nz-form-control>
          </nz-form-item>

          <nz-form-item>
            <nz-form-label nzRequired>Email</nz-form-label>
            <nz-form-control nzErrorTip="Please input a valid email!">
              <input nz-input formControlName="email" type="email" placeholder="Email" />
            </nz-form-control>
          </nz-form-item>

          <nz-form-item>
            <nz-form-label>First Name</nz-form-label>
            <nz-form-control>
              <input nz-input formControlName="firstName" placeholder="First Name" />
            </nz-form-control>
          </nz-form-item>

          <nz-form-item>
            <nz-form-label>Last Name</nz-form-label>
            <nz-form-control>
              <input nz-input formControlName="lastName" placeholder="Last Name" />
            </nz-form-control>
          </nz-form-item>

          <nz-form-item>
            <nz-form-label nzRequired>Password</nz-form-label>
            <nz-form-control nzErrorTip="Please input your password!">
              <input nz-input formControlName="password" type="password" placeholder="Password" />
            </nz-form-control>
          </nz-form-item>

          <nz-form-item>
            <nz-form-label nzRequired>Confirm Password</nz-form-label>
            <nz-form-control nzErrorTip="Passwords do not match!">
              <input nz-input formControlName="passwordConfirm" type="password" placeholder="Confirm Password" />
            </nz-form-control>
          </nz-form-item>

          <nz-form-item>
            <button nz-button nzType="primary" nzBlock [nzLoading]="isLoading" [disabled]="!registerForm.valid">
              Register
            </button>
          </nz-form-item>

          <div class="login-link">
            Already have an account? <a routerLink="/login">Login here</a>
          </div>
        </form>
      </nz-card>
    </div>
  `,
  styles: [`
    .register-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }

    .register-card {
      width: 500px;
      max-width: 100%;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .login-link {
      text-align: center;
      margin-top: 16px;
    }
  `]
})
export class RegisterComponent {
  registerForm: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private message: NzMessageService
  ) {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      firstName: [''],
      lastName: [''],
      password: ['', [Validators.required, Validators.minLength(6)]],
      passwordConfirm: ['', [Validators.required]]
    });
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      const formValue = this.registerForm.value;
      
      if (formValue.password !== formValue.passwordConfirm) {
        this.message.error('Passwords do not match!');
        return;
      }

      this.isLoading = true;
      const registerData: RegisterRequest = formValue;

      this.authService.register(registerData).subscribe({
        next: () => {
          this.message.success('Registration successful!');
        },
        error: (error) => {
          this.message.error(error.message || 'Registration failed');
          this.isLoading = false;
        }
      });
    }
  }
}
