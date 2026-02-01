import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { ApiClientService } from '../api/http-client.service';
import { AuthResponse, User } from '../../types/api.types';

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
    isAdmin: true,
    isActive: true,
    createdAt: '',
    createdBy: ''
  };

  const mockUserNonAdmin: User = {
    ...mockUser,
    id: '2',
    username: 'user',
    isAdmin: false,
    permissions: [
      { id: '1', module: 'Inventory', action: 'Read', createdAt: '', createdBy: '' },
      { id: '2', module: 'Inventory', action: 'Create', createdAt: '', createdBy: '' }
    ] as any
  };

  const mockAuthResponse: AuthResponse = {
    accessToken: 'test-token',
    refreshToken: 'test-refresh-token',
    expiresIn: 3600,
    tokenType: 'Bearer',
    user: mockUser
  };

  function setValidToken(): void {
    const expiry = Date.now() + 3600000;
    sessionStorage.setItem('access_token', 'token');
    sessionStorage.setItem('refresh_token', 'refresh');
    sessionStorage.setItem('token_expiry', String(expiry));
  }

  beforeEach(() => {
    apiClientSpy = jasmine.createSpyObj('ApiClientService', ['get', 'post', 'put', 'delete', 'setAuthToken']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    sessionStorage.clear();
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
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
    });
  });

  it('should register and store token', () => {
    apiClientSpy.post.and.returnValue(of(mockAuthResponse));
    service.register({
      email: 'a@b.com',
      username: 'user',
      password: 'Pass1!',
      passwordConfirm: 'Pass1!'
    }).subscribe(response => {
      expect(response.user).toEqual(mockUser);
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
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

  it('should return admin true from checkPermission when user is admin', (done) => {
    apiClientSpy.post.and.returnValue(of(mockAuthResponse));
    service.login({ email: 'a@b.com', password: 'p' }).subscribe(() => {
      service.checkPermission('Any', 'Any').subscribe(allowed => {
        expect(allowed).toBeTrue();
        expect(apiClientSpy.get).not.toHaveBeenCalledWith(jasmine.stringMatching(/permissions\/check/));
        done();
      });
    });
  });

  it('should check permissions via API when user has permission in cache', (done) => {
    apiClientSpy.post.and.returnValue(of({ ...mockAuthResponse, user: mockUserNonAdmin }));
    apiClientSpy.get.and.returnValue(of(true));
    service.login({ email: 'a@b.com', password: 'p' }).subscribe(() => {
      service.checkPermission('Inventory', 'Read').subscribe(allowed => {
        expect(allowed).toBeTrue();
        expect(apiClientSpy.get).toHaveBeenCalled();
        done();
      });
    });
  });

  it('should return false from checkPermission when user lacks permission in cache', (done) => {
    apiClientSpy.post.and.returnValue(of({ ...mockAuthResponse, user: mockUserNonAdmin }));
    service.login({ email: 'a@b.com', password: 'p' }).subscribe(() => {
      service.checkPermission('Users', 'Create').subscribe(allowed => {
        expect(allowed).toBeFalse();
        done();
      });
    });
  });

  it('should return false when checkPermission API errors', (done) => {
    apiClientSpy.post.and.returnValue(of({ ...mockAuthResponse, user: mockUserNonAdmin }));
    apiClientSpy.get.and.returnValue(throwError(() => new Error('API error')));
    service.login({ email: 'a@b.com', password: 'p' }).subscribe(() => {
      service.checkPermission('Inventory', 'Read').subscribe(allowed => {
        expect(allowed).toBeFalse();
        done();
      });
    });
  });

  it('should return null from getCurrentUser when not logged in', () => {
    expect(service.getCurrentUser()).toBeNull();
  });

  it('should return user from getCurrentUser after login', (done) => {
    apiClientSpy.post.and.returnValue(of(mockAuthResponse));
    service.login({ email: 'admin@example.com', password: 'password' }).subscribe(() => {
      expect(service.getCurrentUser()).toEqual(mockUser);
      done();
    });
  });

  it('should expose all false from getModulePermissions when no user', (done) => {
    service.getModulePermissions('Inventory').subscribe(p => {
      expect(p.canRead).toBeFalse();
      expect(p.canCreate).toBeFalse();
      expect(p.canExport).toBeFalse();
      done();
    });
  });

  it('should expose all true from getModulePermissions when user is admin', (done) => {
    apiClientSpy.post.and.returnValue(of(mockAuthResponse));
    service.login({ email: 'a@b.com', password: 'p' }).subscribe(() => {
      service.getModulePermissions('Any').subscribe(p => {
        expect(p.canRead).toBeTrue();
        expect(p.canCreate).toBeTrue();
        expect(p.canDelete).toBeTrue();
        expect(p.canExport).toBeTrue();
        done();
      });
    });
  });

  it('should map module permissions from user permissions', (done) => {
    apiClientSpy.post.and.returnValue(of({ ...mockAuthResponse, user: mockUserNonAdmin }));
    service.login({ email: 'a@b.com', password: 'p' }).subscribe(() => {
      service.getModulePermissions('Inventory').subscribe(p => {
        expect(p.canRead).toBeTrue();
        expect(p.canCreate).toBeTrue();
        expect(p.canUpdate).toBeFalse();
        done();
      });
    });
  });

  it('should refresh user data via fetchCurrentUser', (done) => {
    const otherUser = { ...mockUser, username: 'updated' };
    apiClientSpy.post.and.returnValue(of(mockAuthResponse));
    apiClientSpy.get.and.returnValue(of(otherUser));
    service.login({ email: 'a@b.com', password: 'p' }).subscribe(() => {
      service.refreshUserData().subscribe(user => {
        expect(user.username).toBe('updated');
        expect(service.getCurrentUser()?.username).toBe('updated');
        done();
      });
    });
  });

  it('should clear tokens when init fetchCurrentUser errors', (done) => {
    sessionStorage.clear();
    setValidToken();
    const apiSpy = jasmine.createSpyObj('ApiClientService', ['get', 'post', 'setAuthToken']);
    apiSpy.get.and.returnValue(throwError(() => new Error('Unauthorized')));
    apiSpy.post.and.returnValue(of({}));
    const router = jasmine.createSpyObj('Router', ['navigate']);
    new AuthService(apiSpy as unknown as ApiClientService, router as unknown as Router);
    setTimeout(() => {
      expect(sessionStorage.getItem('access_token')).toBeNull();
      done();
    }, 150);
  });

  it('should not call fetch when token is expired', () => {
    sessionStorage.clear();
    sessionStorage.setItem('access_token', 'x');
    sessionStorage.setItem('token_expiry', String(Date.now() - 1000));
    const apiSpy = jasmine.createSpyObj('ApiClientService', ['get', 'post', 'setAuthToken']);
    apiSpy.get.and.returnValue(of(mockUser));
    const router = jasmine.createSpyObj('Router', ['navigate']);
    new AuthService(apiSpy as unknown as ApiClientService, router as unknown as Router);
    expect(apiSpy.get).not.toHaveBeenCalled();
  });
});
