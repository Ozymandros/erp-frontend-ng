import { Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, tap, switchMap, filter, take, catchError } from 'rxjs/operators';
import { ApiClientService } from '../api/http-client.service';
import { AUTH_ENDPOINTS, USERS_ENDPOINTS, PERMISSIONS_ENDPOINTS } from '../api/endpoints.constants';
import {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  User,
  ModulePermissions
} from '../../types/api.types';

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const TOKEN_EXPIRY_KEY = 'token_expiry';

import { APP_PATHS } from '../constants/routes.constants';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Signals for reactive state management
  private currentUserSignal = signal<User | null>(null);
  private isLoadingSignal = signal<boolean>(true);

  // Computed signals
  public currentUser = computed(() => this.currentUserSignal());
  public isLoading = computed(() => this.isLoadingSignal());
  public isAuthenticated = computed(() => this.currentUserSignal() !== null);
  public permissions = computed(() => this.currentUserSignal()?.permissions || []);

  // RxJS observables for backward compatibility
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private isLoadingSubject = new BehaviorSubject<boolean>(true);

  public currentUser$ = this.currentUserSubject.asObservable();
  public isLoading$ = this.isLoadingSubject.asObservable();
  public isAuthenticated$ = this.currentUser$.pipe(
    map(user => user !== null)
  );

  constructor(
    private apiClient: ApiClientService,
    private router: Router
  ) {
    this.initializeAuth();
  }

  private initializeAuth(): void {
    const token = this.getAccessToken();
    if (token && !this.isTokenExpired()) {
      this.apiClient.setAuthToken(token);
      this.fetchCurrentUser().subscribe({
        next: () => {
          this.isLoadingSubject.next(false);
          this.isLoadingSignal.set(false);
        },
        error: () => {
          this.clearTokens();
          this.isLoadingSubject.next(false);
          this.isLoadingSignal.set(false);
        }
      });
    } else {
      this.isLoadingSubject.next(false);
      this.isLoadingSignal.set(false);
    }
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.apiClient.post<AuthResponse>(AUTH_ENDPOINTS.LOGIN, credentials).pipe(
      tap(response => {
        this.storeTokens(response.accessToken, response.refreshToken, response.expiresIn);
        this.currentUserSubject.next(response.user);
        this.currentUserSignal.set(response.user);
        this.router.navigate([APP_PATHS.DASHBOARD]);
      })
    );
  }

  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.apiClient.post<AuthResponse>(AUTH_ENDPOINTS.REGISTER, data).pipe(
      tap(response => {
        this.storeTokens(response.accessToken, response.refreshToken, response.expiresIn);
        this.currentUserSubject.next(response.user);
        this.currentUserSignal.set(response.user);
        this.router.navigate([APP_PATHS.DASHBOARD]);
      })
    );
  }

  logout(): Observable<void> {
    return this.apiClient.post<void>(AUTH_ENDPOINTS.LOGOUT).pipe(
      tap(() => {
        this.clearTokens();
        this.currentUserSubject.next(null);
        this.currentUserSignal.set(null);
        this.router.navigate([APP_PATHS.AUTH.LOGIN]);
      })
    );
  }

  /**
   * Get current user synchronously (for use in templates and computed signals)
   */
  getCurrentUser(): User | null {
    return this.currentUserSignal();
  }

  /**
   * Check permission via backend API endpoint.
   * This is the ONLY place where /permissions/check should be called.
   * Used by PermissionGuard for route authorization.
   */
  checkPermission(module: string, action: string): Observable<boolean> {
    const user = this.currentUserSignal();
    
    // Admin override
    if (user?.isAdmin) {
      return of(true);
    }

    // If user exists, check cached permissions first (client-side check)
    if (user) {
      const hasPermission = user.permissions?.some(
        (p: { module: string; action: string }) => p.module.toLowerCase() === module.toLowerCase() && 
             p.action.toLowerCase() === action.toLowerCase()
      );
      
      // If permission not found in cache, return early without API call
      if (!hasPermission) {
        return of(false);
      }
      
      // If found in cache, still call backend to verify (for route guards)
      return this.apiClient.get<boolean>(PERMISSIONS_ENDPOINTS.CHECK, { module, action }).pipe(
        map(allowed => allowed),
        catchError(() => of(false))
      );
    }

    // If loading, wait for it to finish
    if (this.isLoadingSignal()) {
      return this.isLoading$.pipe(
        filter(isLoading => !isLoading),
        take(1),
        switchMap(() => {
          const loadedUser = this.currentUserSignal();
          if (loadedUser?.isAdmin) return of(true);
          
          // Call backend API for verification
          return this.apiClient.get<boolean>(PERMISSIONS_ENDPOINTS.CHECK, { module, action }).pipe(
            map(allowed => allowed),
            catchError(() => of(false))
          );
        })
      );
    }

    // Fallback to API if not loading and no user
    return this.apiClient.get<boolean>(PERMISSIONS_ENDPOINTS.CHECK, { module, action }).pipe(
      map(allowed => allowed),
      catchError(() => of(false))
    );
  }

  getModulePermissions(module: string): Observable<ModulePermissions> {
    return this.currentUser$.pipe(
      map(user => {
        if (!user) {
          return { canRead: false, canCreate: false, canUpdate: false, canDelete: false, canExport: false };
        }
        
        if (user.isAdmin) {
          return { canRead: true, canCreate: true, canUpdate: true, canDelete: true, canExport: true };
        }

        const perms = user.permissions || [];
        const modulePerms = perms.filter((p: { module: string; action: string }) => p.module.toLowerCase() === module.toLowerCase());
        
        return {
          canRead: modulePerms.some((p: { action: string }) => ['read', 'view', 'list'].includes(p.action.toLowerCase())),
          canCreate: modulePerms.some((p: { action: string }) => ['create', 'add', 'new'].includes(p.action.toLowerCase())),
          canUpdate: modulePerms.some((p: { action: string }) => ['update', 'edit', 'modify'].includes(p.action.toLowerCase())),
          canDelete: modulePerms.some((p: { action: string }) => ['delete', 'remove'].includes(p.action.toLowerCase())),
          canExport: modulePerms.some((p: { action: string }) => ['export', 'download'].includes(p.action.toLowerCase()))
        };
      })
    );
  }

  refreshUserData(): Observable<User> {
    return this.fetchCurrentUser();
  }

  private fetchCurrentUser(): Observable<User> {
    return this.apiClient.get<User>(USERS_ENDPOINTS.ME).pipe(
      tap(user => {
        this.currentUserSubject.next(user);
        this.currentUserSignal.set(user);
      })
    );
  }

  private storeTokens(accessToken: string, refreshToken: string, expiresIn: number): void {
    sessionStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    sessionStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    const expiryTime = Date.now() + expiresIn * 1000;
    sessionStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString());
    this.apiClient.setAuthToken(accessToken);
  }

  private clearTokens(): void {
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);
    sessionStorage.removeItem(TOKEN_EXPIRY_KEY);
    this.apiClient.setAuthToken(null);
  }

  private getAccessToken(): string | null {
    return sessionStorage.getItem(ACCESS_TOKEN_KEY);
  }

  private isTokenExpired(): boolean {
    const expiryTime = sessionStorage.getItem(TOKEN_EXPIRY_KEY);
    if (!expiryTime) return true;
    return Date.now() >= Number.parseInt(expiryTime, 10);
  }
}
