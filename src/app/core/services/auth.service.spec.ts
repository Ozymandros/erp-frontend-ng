import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { ApiClientService } from '../api/http-client.service';
import { AuthResponse, User } from '../types/api.types';

describe('AuthService', () => {
  let service: AuthService;
  let apiClientSpy: jasmine.SpyObj<ApiClientService>;
  let routerSpy: jasmine.SpyObj<Router>;

  const mockUser: User = {
    id: '1',
    username: 'admin',
    roles: [],
    permissions: [],
    emailConfirmed: true,
    isExternalLogin: false,
    isActive: true,
    isAdmin: true,
    createdAt: '',
    createdBy: ''
  };

  const mockAuthResponse: AuthResponse = {
    accessToken: 'test-token',
    refreshToken: 'test-refresh-token',
    expiresIn: 3600,
    tokenType: 'Bearer',
    user: mockUser
  };

  beforeEach(() => {
    apiClientSpy = jasmine.createSpyObj('ApiClientService', ['get', 'post', 'put', 'delete', 'setAuthToken']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    // Mock initial fetchCurrentUser call that happens in constructor if token exists
    // actually initializeAuth checks getAccessToken() which we can control via sessionStorage
    sessionStorage.clear();
    
    // By default, make sure get('users/me') returns the mock user if called
    apiClientSpy.get.and.returnValue(of(mockUser));
    apiClientSpy.post.and.returnValue(of({}));

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: ApiClientService, useValue: apiClientSpy },
        { provide: Router, useValue: routerSpy }
      ]
    });
    
    service = TestBed.inject(AuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should login and store token', () => {
    apiClientSpy.post.and.returnValue(of(mockAuthResponse));

    service.login({ email: 'admin@example.com', password: 'password' }).subscribe(response => {
      expect(response.accessToken).toBe('test-token');
      expect(sessionStorage.getItem('access_token')).toBe('test-token');
      expect(apiClientSpy.setAuthToken).toHaveBeenCalledWith('test-token');
    });
  });

  it('should logout and clear token', () => {
    apiClientSpy.post.and.returnValue(of(null));
    sessionStorage.setItem('access_token', 'test-token');
    
    service.logout().subscribe(() => {
      expect(sessionStorage.getItem('access_token')).toBeNull();
      expect(apiClientSpy.setAuthToken).toHaveBeenCalledWith(null);
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
    });
  });

  it('should check permissions via API', () => {
    apiClientSpy.post.and.returnValue(of({ allowed: true }));
    
    service.checkPermission('Users', 'View').subscribe(allowed => {
      expect(allowed).toBeTrue();
      expect(apiClientSpy.post).toHaveBeenCalled();
    });
  });
});
