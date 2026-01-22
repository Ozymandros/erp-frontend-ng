import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { ApiClientService } from '../api/http-client.service';
import { AUTH_ENDPOINTS, USERS_ENDPOINTS, PERMISSIONS_ENDPOINTS } from '../api/endpoints.constants';
import {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  User,
  PermissionCheckRequest,
  PermissionCheckResponse
} from '../types/api.types';

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const TOKEN_EXPIRY_KEY = 'token_expiry';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
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
        next: () => this.isLoadingSubject.next(false),
        error: () => {
          this.clearTokens();
          this.isLoadingSubject.next(false);
        }
      });
    } else {
      this.isLoadingSubject.next(false);
    }
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.apiClient.post<AuthResponse>(AUTH_ENDPOINTS.LOGIN, credentials).pipe(
      tap(response => {
        this.storeTokens(response.accessToken, response.refreshToken, response.expiresIn);
        this.currentUserSubject.next(response.user);
        this.router.navigate(['/']);
      })
    );
  }

  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.apiClient.post<AuthResponse>(AUTH_ENDPOINTS.REGISTER, data).pipe(
      tap(response => {
        this.storeTokens(response.accessToken, response.refreshToken, response.expiresIn);
        this.currentUserSubject.next(response.user);
        this.router.navigate(['/']);
      })
    );
  }

  logout(): Observable<void> {
    return this.apiClient.post<void>(AUTH_ENDPOINTS.LOGOUT).pipe(
      tap(() => {
        this.clearTokens();
        this.currentUserSubject.next(null);
        this.router.navigate(['/login']);
      })
    );
  }

  checkPermission(module: string, action: string): Observable<boolean> {
    const request: PermissionCheckRequest = { module, action };
    return this.apiClient.post<PermissionCheckResponse>(PERMISSIONS_ENDPOINTS.CHECK, request).pipe(
      map(response => response.allowed)
    );
  }

  refreshUserData(): Observable<User> {
    return this.fetchCurrentUser();
  }

  private fetchCurrentUser(): Observable<User> {
    return this.apiClient.get<User>(USERS_ENDPOINTS.ME).pipe(
      tap(user => this.currentUserSubject.next(user))
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
    return Date.now() >= parseInt(expiryTime, 10);
  }
}
