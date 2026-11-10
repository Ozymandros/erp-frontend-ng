import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ResourceGroupDetailComponent } from './resource-group-detail.component';
import { ProjectResourceGroupsService } from '../../../core/services/project-resource-groups.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ActivatedRoute, Router } from '@angular/router';
import { ThemeService } from '../../../core/services/theme.service';

describe('ResourceGroupDetailComponent', () => {
  let component: ResourceGroupDetailComponent;
  let fixture: ComponentFixture<ResourceGroupDetailComponent>;
  let groupsSpy: jasmine.SpyObj<ProjectResourceGroupsService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    groupsSpy = jasmine.createSpyObj('ProjectResourceGroupsService', ['getById', 'create', 'update']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [ResourceGroupDetailComponent],
      providers: [
        { provide: ProjectResourceGroupsService, useValue: groupsSpy },
        { provide: NzMessageService, useValue: jasmine.createSpyObj('NzMessageService', ['success', 'error']) },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => 'new' } } } },
        { provide: Router, useValue: routerSpy },
        { provide: ThemeService, useValue: { effectiveTheme: () => 'light' } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ResourceGroupDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create group', () => {
    groupsSpy.create.and.returnValue(of({ id: '1', code: 'ENG', name: 'Engineering' }));
    component.form.patchValue({ code: 'ENG', name: 'Engineering' });
    component.save();
    expect(groupsSpy.create).toHaveBeenCalled();
    expect(routerSpy.navigate).toHaveBeenCalled();
  });
});
