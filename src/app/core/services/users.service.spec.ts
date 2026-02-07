import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { UsersService } from './users.service';
import { ApiClientService } from '../api/http-client.service';
import { User, PaginatedResponse } from '../../types/api.types';

describe('UsersService', () => {
  let service: UsersService;
  let apiClientSpy: jasmine.SpyObj<ApiClientService>;

  beforeEach(() => {
    apiClientSpy = jasmine.createSpyObj('ApiClientService', ['get', 'post', 'put', 'delete', 'download']);

    TestBed.configureTestingModule({
      providers: [
        UsersService,
        { provide: ApiClientService, useValue: apiClientSpy }
      ]
    });
    service = TestBed.inject(UsersService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch users list', (done) => {
    const mockUsers: PaginatedResponse<User> = {
      items: [{ id: '1', username: 'user1' } as unknown as User],
      total: 1,
      page: 1,
      pageSize: 10,
      totalPages: 1,
      hasPreviousPage: false,
      hasNextPage: false
    };

    apiClientSpy.get.and.returnValue(of(mockUsers));

    service.getAll().subscribe(response => {
      expect(response).toEqual(mockUsers);
      expect(apiClientSpy.get).toHaveBeenCalled();
      done();
    });
  });

  it('should delete a user', (done) => {
    apiClientSpy.delete.and.returnValue(of(undefined));

    service.delete('1').subscribe(() => {
      expect(apiClientSpy.delete).toHaveBeenCalled();
      done();
    });
  });

  it('should export to XLSX', (done) => {
    const mockBlob = new Blob(['data'], { type: 'application/octet-stream' });
    apiClientSpy.download.and.returnValue(of(mockBlob));

    service.exportToXlsx().subscribe(blob => {
      expect(blob).toEqual(mockBlob);
      expect(apiClientSpy.download).toHaveBeenCalled();
      done();
    });
  });

  it('should export to PDF', (done) => {
    const mockBlob = new Blob(['data'], { type: 'application/pdf' });
    apiClientSpy.download.and.returnValue(of(mockBlob));

    service.exportToPdf().subscribe(blob => {
      expect(blob).toEqual(mockBlob);
      expect(apiClientSpy.download).toHaveBeenCalled();
      done();
    });
  });

  it('should get user by id', (done) => {
    const user = { id: '1', username: 'u1' } as unknown as User;
    apiClientSpy.get.and.returnValue(of(user));
    service.getById('1').subscribe(u => {
      expect(u).toEqual(user);
      expect(apiClientSpy.get).toHaveBeenCalledWith(jasmine.stringMatching(/\/users\/1$/));
      done();
    });
  });

  it('should create user', (done) => {
    const created = { id: '2', username: 'u2' } as unknown as User;
    apiClientSpy.post.and.returnValue(of(created));
    service.create({ username: 'u2', email: 'u@u.com', password: 'p' } as any).subscribe(u => {
      expect(u).toEqual(created);
      expect(apiClientSpy.post).toHaveBeenCalled();
      done();
    });
  });

  it('should update user', (done) => {
    const updated = { id: '1', username: 'u1' } as unknown as User;
    apiClientSpy.put.and.returnValue(of(updated));
    service.update('1', { username: 'u1' } as any).subscribe(u => {
      expect(u).toEqual(updated);
      expect(apiClientSpy.put).toHaveBeenCalled();
      done();
    });
  });

  it('should assign role to user', (done) => {
    apiClientSpy.post.and.returnValue(of(undefined));
    service.assignRole('u1', 'Admin').subscribe(() => {
      expect(apiClientSpy.post).toHaveBeenCalledWith(jasmine.stringMatching(/\/users\/u1\/roles\/Admin/), null);
      done();
    });
  });

  it('should remove role from user', (done) => {
    apiClientSpy.delete.and.returnValue(of(undefined));
    service.removeRole('u1', 'Admin').subscribe(() => {
      expect(apiClientSpy.delete).toHaveBeenCalledWith(jasmine.stringMatching(/\/users\/u1\/roles\/Admin/));
      done();
    });
  });

  it('should get user roles', (done) => {
    const roles = [{ id: '1', name: 'Admin', createdAt: '', createdBy: '', permissions: [] }];
    apiClientSpy.get.and.returnValue(of(roles as any));
    service.getUserRoles('u1').subscribe(r => {
      expect(r.length).toBe(1);
      expect(r[0].name).toBe('Admin');
      expect(apiClientSpy.get).toHaveBeenCalledWith(jasmine.stringMatching(/\/users\/u1\/roles/));
      done();
    });
  });
});
