import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import {
  AuditEntityChangesService,
  buildEntityChangeListQueryParams,
} from './audit-entity-changes.service';
import { ApiClientService } from '../api/http-client.service';
import { AUDIT_ENDPOINTS } from '../api/endpoints.constants';
import { EntityChangeDto, PaginatedResponse } from '../../types/api.types';

describe('buildEntityChangeListQueryParams', () => {
  it('returns empty object when params undefined', () => {
    expect(buildEntityChangeListQueryParams()).toEqual({});
  });

  it('flattens filters to Filters[key] keys', () => {
    const q = buildEntityChangeListQueryParams({
      page: 2,
      pageSize: 20,
      filters: { entityName: 'User', changeType: 'Updated' },
      searchTerm: 'admin',
      searchFields: 'entityName,createdBy',
      sortBy: 'createdAt',
      sortDesc: true,
    });
    expect(q['page']).toBe(2);
    expect(q['Filters[entityName]']).toBe('User');
    expect(q['Filters[changeType]']).toBe('Updated');
    expect(q['searchTerm']).toBe('admin');
    expect(q['sortDesc']).toBe(true);
  });

  it('maps sortOrder asc/desc and search alias', () => {
    const asc = buildEntityChangeListQueryParams({ sortOrder: 'asc' });
    expect(asc['sortDesc']).toBe(false);
    const desc = buildEntityChangeListQueryParams({ sortOrder: 'desc' });
    expect(desc['sortDesc']).toBe(true);
    const search = buildEntityChangeListQueryParams({ search: 'term' });
    expect(search['searchTerm']).toBe('term');
  });

  it('skips empty filter values', () => {
    const q = buildEntityChangeListQueryParams({
      filters: { entityName: '', changeType: 'Updated' },
    });
    expect(q['Filters[entityName]']).toBeUndefined();
    expect(q['Filters[changeType]']).toBe('Updated');
  });
});

describe('AuditEntityChangesService', () => {
  let service: AuditEntityChangesService;
  let apiClientSpy: jasmine.SpyObj<ApiClientService>;

  beforeEach(() => {
    apiClientSpy = jasmine.createSpyObj('ApiClientService', ['get', 'post', 'put', 'delete', 'download']);

    TestBed.configureTestingModule({
      providers: [
        AuditEntityChangesService,
        { provide: ApiClientService, useValue: apiClientSpy },
      ],
    });
    service = TestBed.inject(AuditEntityChangesService);
  });

  it('should fetch paginated entity changes', (done) => {
    const mockResult: PaginatedResponse<EntityChangeDto> = {
      items: [],
      total: 0,
      page: 1,
      pageSize: 20,
      totalPages: 0,
      hasPreviousPage: false,
      hasNextPage: false,
    };
    apiClientSpy.get.and.returnValue(of(mockResult));

    service.getAll({ page: 1, pageSize: 20 }).subscribe((result) => {
      expect(result).toEqual(mockResult);
      expect(apiClientSpy.get).toHaveBeenCalledWith(
        AUDIT_ENDPOINTS.ENTITY_CHANGES,
        jasmine.objectContaining({ page: 1, pageSize: 20 }),
      );
      done();
    });
  });

  it('should fetch by entity', (done) => {
    const items = [{ id: '1' } as EntityChangeDto];
    apiClientSpy.get.and.returnValue(of(items));

    service.getByEntity('User', '550e8400-e29b-41d4-a716-446655440000').subscribe((result) => {
      expect(result).toEqual(items);
      expect(apiClientSpy.get).toHaveBeenCalledWith(
        AUDIT_ENDPOINTS.BY_ENTITY('User', '550e8400-e29b-41d4-a716-446655440000'),
      );
      done();
    });
  });

  it('should fetch by id', (done) => {
    const item = { id: '1' } as EntityChangeDto;
    apiClientSpy.get.and.returnValue(of(item));

    service.getById('1').subscribe((result) => {
      expect(result).toEqual(item);
      expect(apiClientSpy.get).toHaveBeenCalledWith(AUDIT_ENDPOINTS.BY_ID('1'));
      done();
    });
  });

  it('should encode entity name in by-entity path', (done) => {
    apiClientSpy.get.and.returnValue(of([]));
    service.getByEntity('Role/User', 'id-1').subscribe(() => {
      expect(apiClientSpy.get).toHaveBeenCalledWith(
        AUDIT_ENDPOINTS.BY_ENTITY('Role/User', 'id-1'),
      );
      done();
    });
  });
});
