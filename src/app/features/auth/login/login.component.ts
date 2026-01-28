import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzMessageService } from 'ng-zorro-antd/message';
import { AuthService } from '../../../core/services/auth.service';
import { LoginRequest } from '../../../types/api.types';

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
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  isLoading = false;
  isFormDisabled = true;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private message: NzMessageService
  ) {
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/e29febe2-c049-45a2-b934-1123e1e94a05',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'login.component.ts:constructor',message:'Component constructor called',data:{timestamp:Date.now()},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/e29febe2-c049-45a2-b934-1123e1e94a05',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'login.component.ts:constructor',message:'Form created',data:{valid:this.loginForm.valid,emailValue:this.loginForm.get('email')?.value,passwordValue:this.loginForm.get('password')?.value},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    
    // Update disabled state when form validity changes (using setTimeout to avoid change detection issues)
    this.loginForm.statusChanges.subscribe(() => {
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/e29febe2-c049-45a2-b934-1123e1e94a05',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'login.component.ts:statusChanges',message:'Form status changed',data:{valid:this.loginForm.valid,status:this.loginForm.status,currentDisabled:this.isFormDisabled},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      setTimeout(() => {
        this.isFormDisabled = !this.loginForm.valid;
        // #region agent log
        fetch('http://127.0.0.1:7244/ingest/e29febe2-c049-45a2-b934-1123e1e94a05',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'login.component.ts:statusChanges:setTimeout',message:'Disabled state updated',data:{isFormDisabled:this.isFormDisabled,valid:this.loginForm.valid},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
      }, 0);
    });
    
    this.loginForm.valueChanges.subscribe(() => {
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/e29febe2-c049-45a2-b934-1123e1e94a05',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'login.component.ts:valueChanges',message:'Form value changed',data:{valid:this.loginForm.valid,emailValue:this.loginForm.get('email')?.value},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
    });
  }

  ngOnInit(): void {
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/e29febe2-c049-45a2-b934-1123e1e94a05',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'login.component.ts:ngOnInit',message:'ngOnInit called',data:{valid:this.loginForm.valid,isLoading:this.isLoading,isFormDisabled:this.isFormDisabled},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
  }

  onSubmit(): void {
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/e29febe2-c049-45a2-b934-1123e1e94a05',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'login.component.ts:onSubmit',message:'onSubmit called',data:{valid:this.loginForm.valid,isLoading:this.isLoading,isFormDisabled:this.isFormDisabled},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    if (this.loginForm.valid) {
      this.isLoading = true;
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/e29febe2-c049-45a2-b934-1123e1e94a05',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'login.component.ts:onSubmit',message:'isLoading set to true',data:{isLoading:this.isLoading},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      const credentials: LoginRequest = this.loginForm.value;

      this.authService.login(credentials).subscribe({
        next: () => {
          // #region agent log
          fetch('http://127.0.0.1:7244/ingest/e29febe2-c049-45a2-b934-1123e1e94a05',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'login.component.ts:onSubmit:next',message:'Login success',data:{isLoading:this.isLoading},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'D'})}).catch(()=>{});
          // #endregion
          this.message.success('Login successful!');
        },
        error: (error) => {
          // #region agent log
          fetch('http://127.0.0.1:7244/ingest/e29febe2-c049-45a2-b934-1123e1e94a05',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'login.component.ts:onSubmit:error',message:'Login error',data:{isLoading:this.isLoading,errorMessage:error.message},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'D'})}).catch(()=>{});
          // #endregion
          this.message.error(error.message || 'Login failed');
          this.isLoading = false;
        }
      });
    }
  }
}
