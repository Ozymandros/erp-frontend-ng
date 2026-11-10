import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ResourceDetailComponent } from './resource-detail.component';
import { ProjectResourcesService } from '../../../core/services/project-resources.service';
import { ProjectResourceGroupsService } from '../../../core/services/project-resource-groups.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ActivatedRoute, Router } from '@angular/router';
import { ThemeService } from '../../../core/services/theme.service';

describe('ResourceDetailComponent', () => {
  let component: ResourceDetailComponent;
  let fixture: ComponentFixture<ResourceDetailComponent>;
  let resourcesSpy: jasmine.SpyObj<ProjectResourcesService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    resourcesSpy = jasmine.createSpyObj('ProjectResourcesService', ['getById', 'create', 'update']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [ResourceDetailComponent],
      providers: [
        { provide: ProjectResourcesService, useValue: resourcesSpy },
        { provide: ProjectResourceGroupsService, useValue: { list: () => of([{ id: 'g1', code: 'ENG', name: 'Eng' }]) } },
        { provide: NzMessageService, useValue: jasmine.createSpyObj('NzMessageService', ['success', 'error']) },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => 'new' } } } },
        { provide: Router, useValue: routerSpy },
        { provide: ThemeService, useValue: { effectiveTheme: () => 'light' } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ResourceDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create resource', () => {
    resourcesSpy.create.and.returnValue(
      of({ id: '1', resourceNo: 'R1', name: 'Dev', baseUnitOfMeasure: 'HOUR' }),
    );
    component.form.patchValue({
      resourceNo: 'R1',
      name: 'Dev',
      baseUnitOfMeasure: 'HOUR',
      unitCost: 10,
      unitPrice: 20,
      dailyCapacity: 8,
      blocked: false,
    });
    component.save();
    expect(resourcesSpy.create).toHaveBeenCalled();
    expect(routerSpy.navigate).toHaveBeenCalled();
  });
});
