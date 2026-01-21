import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { UsersListComponent } from './users-list.component';
import { UsersService } from '@/app/core/services/users.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { of, throwError } from 'rxjs';
import { PaginatedResponse, User } from '@/app/types/api.types';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';

describe('UsersListComponent', () => {
  let component: UsersListComponent;
  let fixture: ComponentFixture<UsersListComponent>;
  let usersServiceSpy: jasmine.SpyObj<UsersService>;
  let messageServiceSpy: jasmine.SpyObj<NzMessageService>;

  const mockUsers: PaginatedResponse<User> = {
    items: [
      {
        id: '1',
        username: 'u1',
        email: 'u1@e.com',
        roles: [{ id: 'r1', name: 'USER', permissions: [], createdAt: '', createdBy: '' }], // Mock Role object
        permissions: [],
        firstName: 'U',
        lastName: '1',
        isActive: true,
        emailConfirmed: true,
        isExternalLogin: false,
        isAdmin: false,
        createdAt: new Date().toISOString(),
        createdBy: 'system'
      }
    ] as any, // casting to avoid strict type mismatch if partial
    total: 1,
    page: 1,
    pageSize: 10,
    totalPages: 1,
    hasPreviousPage: false,
    hasNextPage: false
  };
  // The service returns { items: [], total: ... } mapped format or the raw one?
  // Looking at the component: response.items, response.total.
  // The service probably maps it. The component expects { items: User[], total: number } or similar.
  // Let's re-read component code in thought...
  // Component: this.users = response.items; this.total = response.total;
  // So the service returns an object with items and total.

  const mockResponse = { items: mockUsers.items, total: 1 };

  beforeEach(async () => {
    usersServiceSpy = jasmine.createSpyObj('UsersService', ['getUsers', 'deleteUser']);
    messageServiceSpy = jasmine.createSpyObj('NzMessageService', ['success', 'error']);

    usersServiceSpy.getUsers.and.returnValue(of(mockResponse as any));

    await TestBed.configureTestingModule({
      imports: [ UsersListComponent, BrowserAnimationsModule, HttpClientTestingModule ],
      providers: [
        { provide: UsersService, useValue: usersServiceSpy },
        { provide: NzMessageService, useValue: messageServiceSpy },
        { provide: ActivatedRoute, useValue: {} }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UsersListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load users on init', () => {
    expect(component.users.length).toBe(1);
    expect(component.total).toBe(1);
    expect(component.loading).toBeFalse();
  });

  it('should search users', () => {
    component.searchTerm = 'query';
    component.onSearch();
    expect(usersServiceSpy.getUsers).toHaveBeenCalledWith(jasmine.objectContaining({ search: 'query', page: 1 }));
  });

  it('should delete user', () => {
    usersServiceSpy.deleteUser.and.returnValue(of(undefined));
    component.deleteUser('1');
    expect(usersServiceSpy.deleteUser).toHaveBeenCalledWith('1');
    expect(messageServiceSpy.success).toHaveBeenCalled();
    expect(usersServiceSpy.getUsers).toHaveBeenCalledTimes(2); // Init + Reload
  });

  it('should handle delete error', () => {
    usersServiceSpy.deleteUser.and.returnValue(throwError(() => new Error('Failed')));
    component.deleteUser('1');
    expect(messageServiceSpy.error).toHaveBeenCalled();
  });
});
