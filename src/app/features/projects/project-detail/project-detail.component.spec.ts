import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { ProjectDetailComponent } from './project-detail.component';
import { ProjectsService } from '../../../core/services/projects.service';
import { CustomersService } from '../../../core/services/customers.service';
import { ProjectCurrenciesService } from '../../../core/services/project-currencies.service';
import { AuthService } from '../../../core/services/auth.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ActivatedRoute, Router } from '@angular/router';
import { ThemeService } from '../../../core/services/theme.service';
import { ProjectStatus } from '../../../types/projects.types';

describe('ProjectDetailComponent', () => {
  let fixture: ComponentFixture<ProjectDetailComponent>;
  let component: ProjectDetailComponent;
  let projectsSpy: jasmine.SpyObj<ProjectsService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let messageSpy: jasmine.SpyObj<NzMessageService>;

  const perms = {
    canRead: true,
    canCreate: true,
    canUpdate: true,
    canDelete: false,
    canExport: false,
    canExecute: true,
  };

  function setup(id: string | null): Promise<void> {
    projectsSpy = jasmine.createSpyObj('ProjectsService', [
      'getById',
      'create',
      'update',
      'getStatistics',
      'changeStatus',
      'copy',
    ]);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    messageSpy = jasmine.createSpyObj('NzMessageService', ['success', 'error']);

    return TestBed.configureTestingModule({
      imports: [ProjectDetailComponent],
      providers: [
        { provide: ProjectsService, useValue: projectsSpy },
        { provide: CustomersService, useValue: { getAll: () => of({ items: [{ id: 'c1', name: 'Cust' }], total: 1 }) } },
        { provide: ProjectCurrenciesService, useValue: { list: () => of([{ id: '1', code: 'EUR', description: 'Euro' }]) } },
        { provide: AuthService, useValue: { getModulePermissions: () => of(perms) } },
        { provide: NzMessageService, useValue: messageSpy },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => id } } } },
        { provide: Router, useValue: routerSpy },
        { provide: ThemeService, useValue: { effectiveTheme: () => 'light' } },
      ],
    }).compileComponents();
  }

  it('should create in new mode and create project', async () => {
    await setup(null);
    fixture = TestBed.createComponent(ProjectDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component.isNewMode).toBeTrue();

    projectsSpy.create.and.returnValue(of({ id: 'p1', description: 'New' }));
    component.form.patchValue({ description: 'New', customerId: 'c1', currencyCode: 'EUR' });
    component.save();
    expect(projectsSpy.create).toHaveBeenCalled();
    expect(routerSpy.navigate).toHaveBeenCalled();
  });

  it('should load and update existing project', async () => {
    await setup('p1');
    projectsSpy.getById.and.returnValue(
      of({
        id: 'p1',
        description: 'Proj',
        customerId: 'c1',
        currencyCode: 'EUR',
        status: 'Open',
        blocked: 'None',
      }),
    );
    projectsSpy.getStatistics.and.returnValue(
      of({ projectId: 'p1', totals: { budgetCostLcy: 10 } }),
    );
    projectsSpy.update.and.returnValue(of({ id: 'p1', description: 'Updated' }));

    fixture = TestBed.createComponent(ProjectDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.isNewMode).toBeFalse();
    expect(projectsSpy.getById).toHaveBeenCalledWith('p1');
    expect(component.statistics?.totals?.budgetCostLcy).toBe(10);

    component.form.patchValue({ description: 'Updated', customerId: 'c1', currencyCode: 'EUR' });
    component.save();
    expect(projectsSpy.update).toHaveBeenCalled();
    expect(messageSpy.success).toHaveBeenCalled();
  });

  it('should change status and copy', async () => {
    await setup('p1');
    projectsSpy.getById.and.returnValue(of({ id: 'p1', description: 'Proj', customerId: 'c1', currencyCode: 'EUR' }));
    projectsSpy.getStatistics.and.returnValue(of({ projectId: 'p1' }));
    projectsSpy.changeStatus.and.returnValue(of({ id: 'p1', status: 'Open' }));
    projectsSpy.copy.and.returnValue(of({ id: 'p2' }));

    fixture = TestBed.createComponent(ProjectDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    component.statusForm.patchValue({ status: ProjectStatus.Open });
    component.applyStatus();
    expect(projectsSpy.changeStatus).toHaveBeenCalled();

    component.copyForm.patchValue({ description: 'Copy', includePlanningLines: true });
    component.copyProject();
    expect(projectsSpy.copy).toHaveBeenCalled();
    expect(routerSpy.navigate).toHaveBeenCalled();
  });

  it('should handle load error', async () => {
    await setup('p1');
    projectsSpy.getById.and.returnValue(throwError(() => new Error('fail')));
    fixture = TestBed.createComponent(ProjectDetailComponent);
    fixture.detectChanges();
    expect(messageSpy.error).toHaveBeenCalled();
  });
});
