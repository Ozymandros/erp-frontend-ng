import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
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
    auditServiceSpy = jasmine.createSpyObj('AuditEntityChangesService', [
      'getAll',
      'getById',
      'delete',
      'exportToXlsx',
      'exportToPdf',
    ]);
    auditServiceSpy.getAll.and.returnValue(of(mockResponse));

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
        { provide: NzMessageService, useValue: jasmine.createSpyObj('NzMessageService', ['success', 'error']) },
        { provide: AppConfirmDialogService, useValue: jasmine.createSpyObj('AppConfirmDialogService', ['deleteConfirm']) },
        { provide: FileService, useValue: jasmine.createSpyObj('FileService', ['saveFile']) },
        { provide: AuthService, useValue: authSpy },
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { queryParams: {} }, queryParams: of({}) },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EntityChangesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and load entity changes', () => {
    expect(component).toBeTruthy();
    expect(auditServiceSpy.getAll).toHaveBeenCalled();
    expect(component.entityChanges.length).toBe(1);
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
  });
});
