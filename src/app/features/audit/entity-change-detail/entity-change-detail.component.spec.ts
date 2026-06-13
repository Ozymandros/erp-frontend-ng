import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';
import { EntityChangeDetailComponent } from './entity-change-detail.component';
import { AuditEntityChangesService } from '../../../core/services/audit-entity-changes.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { EntityChangeDto } from '../../../types/api.types';

describe('EntityChangeDetailComponent', () => {
  let component: EntityChangeDetailComponent;
  let fixture: ComponentFixture<EntityChangeDetailComponent>;
  let auditServiceSpy: jasmine.SpyObj<AuditEntityChangesService>;
  let messageServiceSpy: jasmine.SpyObj<NzMessageService>;
  let paramMap$: Subject<ReturnType<typeof convertToParamMap>>;

  const mockChange: EntityChangeDto = {
    id: '1',
    entityName: 'User',
    entityId: '550e8400-e29b-41d4-a716-446655440000',
    changeType: 'Updated',
    originalValue: '{"name":"old"}',
    newValue: '{"name":"new"}',
    createdAt: '2025-01-01T00:00:00Z',
    createdBy: 'admin',
    updatedAt: '2025-01-01T00:00:00Z',
    updatedBy: null,
    propertyChanges: [
      {
        id: 'p1',
        propertyName: 'Email',
        originalValue: 'a@b.com',
        newValue: 'c@d.com',
      },
    ],
  };

  beforeEach(async () => {
    paramMap$ = new Subject();
    auditServiceSpy = jasmine.createSpyObj('AuditEntityChangesService', ['getById']);
    auditServiceSpy.getById.and.returnValue(of(mockChange));
    messageServiceSpy = jasmine.createSpyObj('NzMessageService', ['success', 'error']);

    await TestBed.configureTestingModule({
      imports: [EntityChangeDetailComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuditEntityChangesService, useValue: auditServiceSpy },
        { provide: NzMessageService, useValue: messageServiceSpy },
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { paramMap: paramMap$.asObservable() },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EntityChangeDetailComponent);
    component = fixture.componentInstance;
    paramMap$.next(convertToParamMap({ id: '1' }));
    fixture.detectChanges();
  });

  it('should load and display entity change', () => {
    expect(component.change?.entityName).toBe('User');
    expect(auditServiceSpy.getById).toHaveBeenCalledWith('1');
    expect(component.displayPropertyChanges.length).toBe(1);
    const html = fixture.nativeElement.innerHTML as string;
    expect(html).toContain('Property changes');
    expect(html).toContain('Email');
  });

  it('derives property changes for Updated when API list is empty', () => {
    auditServiceSpy.getById.and.returnValue(
      of({
        ...mockChange,
        propertyChanges: [],
        originalValue: JSON.stringify({ name: 'old', email: 'a@b.com' }),
        newValue: JSON.stringify({ name: 'new', email: 'c@d.com' }),
      }),
    );
    paramMap$.next(convertToParamMap({ id: '2' }));
    fixture.detectChanges();
    expect(component.displayPropertyChanges.length).toBe(2);
    expect(fixture.nativeElement.textContent).toContain('name');
  });

  it('should show not found when id is missing', () => {
    paramMap$.next(convertToParamMap({}));
    fixture.detectChanges();
    expect(component.notFound).toBeTrue();
    expect(component.loading).toBeFalse();
  });

  it('should show not found on 404 error', () => {
    auditServiceSpy.getById.and.returnValue(throwError(() => new Error('404 Not Found')));
    paramMap$.next(convertToParamMap({ id: 'missing' }));
    fixture.detectChanges();
    expect(component.notFound).toBeTrue();
  });

  it('should show error message on generic load failure', () => {
    spyOn(console, 'error');
    auditServiceSpy.getById.and.returnValue(throwError(() => new Error('Server error')));
    paramMap$.next(convertToParamMap({ id: 'bad' }));
    fixture.detectChanges();
    expect(messageServiceSpy.error).toHaveBeenCalledWith('Failed to load audit entry');
    expect(component.notFound).toBeFalse();
  });

  it('should map change type colors', () => {
    expect(component.getChangeTypeColor('Created')).toBe('green');
    expect(component.getChangeTypeColor('Added')).toBe('green');
    expect(component.getChangeTypeColor('Deleted')).toBe('red');
    expect(component.getChangeTypeColor('Removed')).toBe('red');
    expect(component.getChangeTypeColor('Updated')).toBe('blue');
    expect(component.getChangeTypeColor('Modified')).toBe('blue');
    expect(component.getChangeTypeColor('Other')).toBe('default');
  });

  it('should decide json viewer visibility', () => {
    expect(component.showJsonViewer(null)).toBeFalse();
    expect(component.showJsonViewer('')).toBeFalse();
    expect(component.showJsonViewer('{"a":1}')).toBeTrue();
    expect(component.showJsonViewer('x'.repeat(81))).toBeTrue();
    expect(component.showJsonViewer('short')).toBeFalse();
  });

  it('should hide property section when change is null', () => {
    component.change = null;
    expect(component.showPropertyChangesSection()).toBeFalse();
  });

  it('should show empty hint when Updated has no property rows', () => {
    auditServiceSpy.getById.and.returnValue(
      of({
        ...mockChange,
        propertyChanges: [],
        originalValue: 'not-json',
        newValue: 'also-not-json',
      }),
    );
    paramMap$.next(convertToParamMap({ id: '3' }));
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('No individual property changes');
  });

  it('should clean up on destroy', () => {
    expect(() => component.ngOnDestroy()).not.toThrow();
  });
});
