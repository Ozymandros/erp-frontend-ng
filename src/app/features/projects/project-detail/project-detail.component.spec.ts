import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ProjectDetailComponent } from './project-detail.component';
import { ProjectsService } from '../../../core/services/projects.service';
import { CustomersService } from '../../../core/services/customers.service';
import { ProjectCurrenciesService } from '../../../core/services/project-currencies.service';
import { AuthService } from '../../../core/services/auth.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ActivatedRoute, Router } from '@angular/router';

describe('ProjectDetailComponent', () => {
  let fixture: ComponentFixture<ProjectDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectDetailComponent],
      providers: [
        {
          provide: ProjectsService,
          useValue: jasmine.createSpyObj('ProjectsService', ['getById', 'create', 'update', 'getStatistics']),
        },
        {
          provide: CustomersService,
          useValue: { getAll: () => of({ items: [], total: 0 }) },
        },
        {
          provide: ProjectCurrenciesService,
          useValue: { list: () => of([]) },
        },
        {
          provide: AuthService,
          useValue: {
            getModulePermissions: () =>
              of({
                canRead: true,
                canCreate: true,
                canUpdate: true,
                canDelete: false,
                canExport: false,
                canExecute: true,
              }),
          },
        },
        { provide: NzMessageService, useValue: jasmine.createSpyObj('NzMessageService', ['success', 'error']) },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: () => null } } },
        },
        { provide: Router, useValue: jasmine.createSpyObj('Router', ['navigate']) },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectDetailComponent);
    fixture.detectChanges();
  });

  it('should create in new mode', () => {
    expect(fixture.componentInstance.isNewMode).toBeTrue();
  });
});
