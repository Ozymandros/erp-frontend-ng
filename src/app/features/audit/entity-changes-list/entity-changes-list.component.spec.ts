import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';
import { EntityChangesListComponent } from './entity-changes-list.component';
import { AuditEntityChangesService } from '../../../core/services/audit-entity-changes.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { AppConfirmDialogService } from '../../../shared/services/app-confirm-dialog.service';
import { FileService } from '../../../core/services/file.service';
import { AuthService } from '../../../core/services/auth.service';
import { EntityChangeDto, PaginatedResponse } from '../../../types/api.types';

describe('EntityChangesListComponent', () => {
  let component: EntityChangesListComponent;
  let fixture: ComponentFixture<EntityChangesListComponent>;
  let auditServiceSpy: jasmine.SpyObj<AuditEntityChangesService>;
  let messageServiceSpy: jasmine.SpyObj<NzMessageService>;
  let router: Router;
  let queryParams$: Subject<Record<string, string>>;

  const mockResponse: PaginatedResponse<EntityChangeDto> = {
    items: [
      {
        id: '1',
        entityName: 'User',
        entityId: '550e8400-e29b-41d4-a716-446655440000',
        changeType: 'Updated',
        originalValue: null,
        newValue: null,
        createdAt: '2025-01-01T00:00:00Z',
        createdBy: 'admin',
        updatedAt: '2025-01-01T00:00:00Z',
        updatedBy: null,
        propertyChanges: [],
      },
    ],
    total: 1,
    page: 1,
    pageSize: 20,
    totalPages: 1,
    hasPreviousPage: false,
    hasNextPage: false,
  };

  beforeEach(async () => {
    queryParams$ = new Subject<Record<string, string>>();
    auditServiceSpy = jasmine.createSpyObj('AuditEntityChangesService', [
      'getAll',
      'getById',
      'delete',
      'exportToXlsx',
      'exportToPdf',
    ]);
    auditServiceSpy.getAll.and.returnValue(of(mockResponse));
    messageServiceSpy = jasmine.createSpyObj('NzMessageService', ['success', 'error']);

    const authSpy = jasmine.createSpyObj('AuthService', ['getModulePermissions']);
    authSpy.getModulePermissions.and.returnValue(
      of({ canRead: true, canCreate: false, canUpdate: false, canDelete: false, canExport: false }),
    );

    await TestBed.configureTestingModule({
      imports: [EntityChangesListComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuditEntityChangesService, useValue: auditServiceSpy },
        { provide: NzMessageService, useValue: messageServiceSpy },
        { provide: AppConfirmDialogService, useValue: jasmine.createSpyObj('AppConfirmDialogService', ['deleteConfirm']) },
        { provide: FileService, useValue: jasmine.createSpyObj('FileService', ['saveFile']) },
        { provide: AuthService, useValue: authSpy },
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { queryParams: { entityName: 'Product', changeType: 'Created' } },
            queryParams: queryParams$.asObservable(),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EntityChangesListComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));
    fixture.detectChanges();
  });

  it('should create and load entity changes', () => {
    expect(component).toBeTruthy();
    expect(auditServiceSpy.getAll).toHaveBeenCalled();
    expect(component.entityChanges.length).toBe(1);
    expect(component.filterEntityName).toBe('Product');
    expect(component.filterChangeType).toBe('Created');
  });

  it('should not expose create/delete actions in template', () => {
    const html = fixture.nativeElement.innerHTML as string;
    expect(html).not.toContain('Add ');
    expect(html).not.toContain('Delete');
    expect(html).not.toContain('Export');
    expect(html).toContain('View');
  });

  it('should pass filters when applying filters', () => {
    component.filterEntityName = 'User';
    component.filterChangeType = 'Updated';
    component.applyFilters();
    expect(auditServiceSpy.getAll).toHaveBeenCalledWith(
      jasmine.objectContaining({
        filters: { entityName: 'User', changeType: 'Updated' },
      }),
    );
    expect(router.navigate).toHaveBeenCalled();
  });

  it('should clear filters and reload', () => {
    component.filterEntityName = 'User';
    component.filterChangeType = 'Updated';
    component.searchTerm = 'admin';
    component.clearFilters();
    expect(component.filterEntityName).toBe('');
    expect(component.filterChangeType).toBe('');
    expect(component.searchTerm).toBe('');
    expect(component.pageIndex).toBe(1);
    expect(auditServiceSpy.getAll).toHaveBeenCalled();
  });

  it('should debounce search and include searchTerm when long enough', fakeAsync(() => {
    auditServiceSpy.getAll.calls.reset();
    component.searchTerm = 'adm';
    component.onSearch();
    tick(300);
    expect(auditServiceSpy.getAll).toHaveBeenCalledWith(
      jasmine.objectContaining({ searchTerm: 'adm' }),
    );
  }));

  it('should not include searchTerm when shorter than 3 chars', () => {
    auditServiceSpy.getAll.calls.reset();
    component.searchTerm = 'ab';
    component.loadData();
    const lastCall = auditServiceSpy.getAll.calls.mostRecent().args[0] as Record<string, unknown>;
    expect(lastCall['searchTerm']).toBeUndefined();
  });

  it('should handle pagination and page size changes', () => {
    component.onPageChange(2);
    expect(component.pageIndex).toBe(2);
    component.onPageSizeChange(50);
    expect(component.pageSize).toBe(50);
    expect(component.pageIndex).toBe(1);
  });

  it('should toggle sort direction on same column and reset on new column', () => {
    component.onSort('createdAt');
    expect(component.sortDesc).toBeFalse();
    component.onSort('entityName');
    expect(component.sortBy).toBe('entityName');
    expect(component.sortDesc).toBeTrue();
  });

  it('should map change type colors', () => {
    expect(component.getChangeTypeColor('Created')).toBe('green');
    expect(component.getChangeTypeColor('Deleted')).toBe('red');
    expect(component.getChangeTypeColor('Updated')).toBe('blue');
    expect(component.getChangeTypeColor('Modified')).toBe('blue');
    expect(component.getChangeTypeColor('Other')).toBe('default');
  });

  it('should truncate long ids', () => {
    expect(component.truncateId('short')).toBe('short');
    expect(component.truncateId('550e8400-e29b-41d4-a716-446655440000')).toBe('550e8400…');
  });

  it('should sync filters from query params subscription', () => {
    queryParams$.next({ entityName: 'Role', changeType: 'Deleted' });
    expect(component.filterEntityName).toBe('Role');
    expect(component.filterChangeType).toBe('Deleted');
  });

  it('should handle load error', () => {
    spyOn(console, 'error');
    auditServiceSpy.getAll.and.returnValue(throwError(() => new Error('fail')));
    component.loadData();
    expect(messageServiceSpy.error).toHaveBeenCalledWith('Failed to load audit history');
  });

  it('should hide content when user lacks read permission', async () => {
    const authSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    authSpy.getModulePermissions.and.returnValue(
      of({ canRead: false, canCreate: false, canUpdate: false, canDelete: false, canExport: false }),
    );
    fixture = TestBed.createComponent(EntityChangesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('do not have permission');
  });
});
