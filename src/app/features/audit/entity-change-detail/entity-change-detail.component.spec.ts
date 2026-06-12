import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
import { EntityChangeDetailComponent } from './entity-change-detail.component';
import { AuditEntityChangesService } from '../../../core/services/audit-entity-changes.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { EntityChangeDto } from '../../../types/api.types';

describe('EntityChangeDetailComponent', () => {
  let component: EntityChangeDetailComponent;
  let fixture: ComponentFixture<EntityChangeDetailComponent>;
  let auditServiceSpy: jasmine.SpyObj<AuditEntityChangesService>;

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
    auditServiceSpy = jasmine.createSpyObj('AuditEntityChangesService', ['getById']);
    auditServiceSpy.getById.and.returnValue(of(mockChange));

    await TestBed.configureTestingModule({
      imports: [EntityChangeDetailComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuditEntityChangesService, useValue: auditServiceSpy },
        { provide: NzMessageService, useValue: jasmine.createSpyObj('NzMessageService', ['success', 'error']) },
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { paramMap: of(convertToParamMap({ id: '1' })) },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EntityChangeDetailComponent);
    component = fixture.componentInstance;
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
    component.ngOnInit();
    fixture.detectChanges();
    expect(component.displayPropertyChanges.length).toBe(2);
    expect(fixture.nativeElement.textContent).toContain('name');
  });
});
