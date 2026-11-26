import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { ProjectUsagePanelComponent } from './project-usage-panel.component';
import { ProjectPostingService } from '../../../../core/services/project-posting.service';
import { ProjectTasksService } from '../../../../core/services/project-tasks.service';
import { ProjectResourcesService } from '../../../../core/services/project-resources.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ThemeService } from '../../../../core/services/theme.service';

describe('ProjectUsagePanelComponent', () => {
  let component: ProjectUsagePanelComponent;
  let fixture: ComponentFixture<ProjectUsagePanelComponent>;
  let postingSpy: jasmine.SpyObj<ProjectPostingService>;
  let messageSpy: jasmine.SpyObj<NzMessageService>;

  beforeEach(async () => {
    postingSpy = jasmine.createSpyObj('ProjectPostingService', ['postUsage']);
    messageSpy = jasmine.createSpyObj('NzMessageService', ['success', 'error']);

    await TestBed.configureTestingModule({
      imports: [ProjectUsagePanelComponent],
      providers: [
        { provide: ProjectPostingService, useValue: postingSpy },
        {
          provide: ProjectTasksService,
          useValue: { list: () => of([{ id: 't1', taskNo: '10', description: 'T', projectId: 'p1' }]) },
        },
        {
          provide: ProjectResourcesService,
          useValue: {
            getAll: () =>
              of({
                items: [{ id: 'r1', resourceNo: 'R1', name: 'Dev', baseUnitOfMeasure: 'HOUR' }],
                total: 1,
              }),
          },
        },
        { provide: NzMessageService, useValue: messageSpy },
        { provide: ThemeService, useValue: { effectiveTheme: () => 'light' } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectUsagePanelComponent);
    component = fixture.componentInstance;
    component.projectId = 'p1';
    component.permissions = {
      canRead: true,
      canCreate: false,
      canUpdate: true,
      canDelete: false,
      canExport: false,
      canExecute: true,
    };
    component.ngOnChanges({
      projectId: {
        currentValue: 'p1',
        previousValue: undefined,
        firstChange: true,
        isFirstChange: () => true,
      },
    });
    fixture.detectChanges();
  });

  it('should allow posting when permitted', () => {
    expect(component.canPost).toBeTrue();
  });

  it('should post usage', () => {
    postingSpy.postUsage.and.returnValue(of({ id: 'e1', projectId: 'p1', projectTaskId: 't1' }));
    component.form.patchValue({ projectTaskId: 't1', quantity: 2, resourceId: 'r1' });
    component.submit();
    expect(postingSpy.postUsage).toHaveBeenCalled();
    expect(messageSpy.success).toHaveBeenCalled();
  });

  it('should handle post error', () => {
    postingSpy.postUsage.and.returnValue(throwError(() => new Error('fail')));
    component.form.patchValue({ projectTaskId: 't1', quantity: 1 });
    component.submit();
    expect(messageSpy.error).toHaveBeenCalled();
  });
});
