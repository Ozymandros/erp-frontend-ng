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
import { LoginRequest } from '@/app/types/api.types';

@Component({
  selector: 'app-login',
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
    <div class="login-container">
      <nz-card class="login-card" nzTitle="ERP System Login">
        <form nz-form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <nz-form-item>
            <nz-form-label nzRequired>Email</nz-form-label>
            <nz-form-control nzErrorTip="Please input your email!">
              <input nz-input formControlName="email" type="email" placeholder="Email" />
            </nz-form-control>
          </nz-form-item>

          <nz-form-item>
            <nz-form-label nzRequired>Password</nz-form-label>
            <nz-form-control nzErrorTip="Please input your password!">
              <input nz-input formControlName="password" type="password" placeholder="Password" />
            </nz-form-control>
          </nz-form-item>

          <nz-form-item>
            <button nz-button nzType="primary" nzBlock [nzLoading]="isLoading" [disabled]="!loginForm.valid">
              Log in
            </button>
          </nz-form-item>

          <div class="register-link">
            Don't have an account? <a routerLink="/register">Register here</a>
          </div>
        </form>
      </nz-card>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .login-card {
      width: 400px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .register-link {
      text-align: center;
      margin-top: 16px;
    }
  `]
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private message: NzMessageService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      const credentials: LoginRequest = this.loginForm.value;

      this.authService.login(credentials).subscribe({
        next: () => {
          this.message.success('Login successful!');
        },
        error: (error) => {
          this.message.error(error.message || 'Login failed');
          this.isLoading = false;
        }
      });
    }
  }
}
