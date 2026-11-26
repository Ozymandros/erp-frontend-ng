import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ProjectInvoicesPanelComponent } from './project-invoices-panel.component';
import { ProjectPostingService } from '../../../../core/services/project-posting.service';
import { ProjectPlanningLinesService } from '../../../../core/services/project-planning-lines.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ThemeService } from '../../../../core/services/theme.service';

describe('ProjectInvoicesPanelComponent', () => {
  let component: ProjectInvoicesPanelComponent;
  let fixture: ComponentFixture<ProjectInvoicesPanelComponent>;
  let postingSpy: jasmine.SpyObj<ProjectPostingService>;

  beforeEach(async () => {
    postingSpy = jasmine.createSpyObj('ProjectPostingService', [
      'listInvoiceRequests',
      'createInvoiceRequest',
    ]);
    postingSpy.listInvoiceRequests.and.returnValue(
      of([{ id: 'i1', projectId: 'p1', customerId: 'c1', status: 'Requested', totalAmount: 100 }]),
    );

    await TestBed.configureTestingModule({
      imports: [ProjectInvoicesPanelComponent],
      providers: [
        { provide: ProjectPostingService, useValue: postingSpy },
        {
          provide: ProjectPlanningLinesService,
          useValue: {
            list: () =>
              of([
                {
                  id: 'l1',
                  projectId: 'p1',
                  projectTaskId: 't1',
                  lineType: 'Billable',
                  quantityToInvoice: 2,
                  lineNo: 1,
                  description: 'Billable',
                },
              ]),
          },
        },
        { provide: NzMessageService, useValue: jasmine.createSpyObj('NzMessageService', ['success', 'error']) },
        { provide: ThemeService, useValue: { effectiveTheme: () => 'light' } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectInvoicesPanelComponent);
    component = fixture.componentInstance;
    component.projectId = 'p1';
    component.permissions = {
      canRead: true,
      canCreate: false,
      canUpdate: false,
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

  it('should load requests', () => {
    expect(component.requests.length).toBe(1);
    expect(component.canCreate).toBeTrue();
  });

  it('should create invoice request', () => {
    postingSpy.createInvoiceRequest.and.returnValue(
      of({ id: 'i2', projectId: 'p1', customerId: 'c1' }),
    );
    component.openCreate();
    component.form.patchValue({
      taxRate: 21,
      lines: [{ planningLineId: 'l1', quantity: 1 }],
    });
    component.submit();
    expect(postingSpy.createInvoiceRequest).toHaveBeenCalled();
  });
});
