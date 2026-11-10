import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ProjectConsumptionPanelComponent } from './project-consumption-panel.component';
import { ProjectPostingService } from '../../../../core/services/project-posting.service';
import { ProjectPlanningLinesService } from '../../../../core/services/project-planning-lines.service';
import { WarehousesService } from '../../../../core/services/warehouses.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ThemeService } from '../../../../core/services/theme.service';

describe('ProjectConsumptionPanelComponent', () => {
  let component: ProjectConsumptionPanelComponent;
  let fixture: ComponentFixture<ProjectConsumptionPanelComponent>;
  let postingSpy: jasmine.SpyObj<ProjectPostingService>;

  beforeEach(async () => {
    postingSpy = jasmine.createSpyObj('ProjectPostingService', [
      'listConsumptionOrders',
      'createConsumptionOrder',
    ]);
    postingSpy.listConsumptionOrders.and.returnValue(
      of([{ id: 'c1', projectId: 'p1', orderId: 'o1', warehouseId: 'w1', orderNumber: 'ORD-1' }]),
    );

    await TestBed.configureTestingModule({
      imports: [ProjectConsumptionPanelComponent],
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
                  kind: 'Item',
                  lineNo: 1,
                  description: 'Item line',
                },
              ]),
          },
        },
        {
          provide: WarehousesService,
          useValue: { getAll: () => of({ items: [{ id: 'w1', name: 'Main', location: 'A' }], total: 1 }) },
        },
        { provide: NzMessageService, useValue: jasmine.createSpyObj('NzMessageService', ['success', 'error']) },
        { provide: ThemeService, useValue: { effectiveTheme: () => 'light' } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectConsumptionPanelComponent);
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

  it('should load orders and allow create', () => {
    expect(component.orders.length).toBe(1);
    expect(component.canCreate).toBeTrue();
  });

  it('should create consumption order', () => {
    postingSpy.createConsumptionOrder.and.returnValue(
      of({ id: 'c2', projectId: 'p1', orderId: 'o2', warehouseId: 'w1' }),
    );
    component.openCreate();
    component.form.patchValue({
      warehouseId: 'w1',
      lines: [{ planningLineId: 'l1', quantity: 1 }],
    });
    component.submit();
    expect(postingSpy.createConsumptionOrder).toHaveBeenCalled();
  });
});
