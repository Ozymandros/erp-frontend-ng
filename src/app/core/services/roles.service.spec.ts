import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { RolesService } from './roles.service';
import { ApiClientService } from '../api/http-client.service';
import { Role, PaginatedResponse } from '../types/api.types';

describe('RolesService', () => {
  let service: RolesService;
  let apiClientSpy: jasmine.SpyObj<ApiClientService>;

  beforeEach(() => {
    apiClientSpy = jasmine.createSpyObj('ApiClientService', ['get', 'post', 'put', 'delete']);

    TestBed.configureTestingModule({
      providers: [
        RolesService,
        { provide: ApiClientService, useValue: apiClientSpy }
      ]
    });
    service = TestBed.inject(RolesService);
  });

  it('should fetch roles', (done) => {
    const mockResult: PaginatedResponse<Role> = {
      items: [{ id: '1', name: 'Admin' } as Role],
      total: 1,
      page: 1,
      pageSize: 10,
      totalPages: 1,
      hasPreviousPage: false,
      hasNextPage: false
    };
    apiClientSpy.get.and.returnValue(of(mockResult));

    service.getRoles().subscribe(result => {
      expect(result).toEqual(mockResult);
      done();
    });
  });

  it('should assign permissions to role', (done) => {
    const role = { id: '1', name: 'Admin' } as Role;
    apiClientSpy.post.and.returnValue(of(role));

    service.assignPermissions('1', ['perm-1', 'perm-2']).subscribe(result => {
      expect(result).toEqual(role);
      expect(apiClientSpy.post).toHaveBeenCalledWith(jasmine.any(String), { permissionIds: ['perm-1', 'perm-2'] });
      done();
    });
  });
});
