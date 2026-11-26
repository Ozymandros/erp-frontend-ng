import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { ResourceGroupsListComponent } from './resource-groups-list.component';
import { ProjectResourceGroupsService } from '../../../core/services/project-resource-groups.service';
import { AuthService } from '../../../core/services/auth.service';
import { FileService } from '../../../core/services/file.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ThemeService } from '../../../core/services/theme.service';

describe('ResourceGroupsListComponent', () => {
  let component: ResourceGroupsListComponent;
  let fixture: ComponentFixture<ResourceGroupsListComponent>;
  let groupsSpy: jasmine.SpyObj<ProjectResourceGroupsService>;
  let messageSpy: jasmine.SpyObj<NzMessageService>;
  let fileSpy: jasmine.SpyObj<FileService>;

  beforeEach(async () => {
    groupsSpy = jasmine.createSpyObj('ProjectResourceGroupsService', [
      'list',
      'delete',
      'exportToXlsx',
      'exportToPdf',
    ]);
    messageSpy = jasmine.createSpyObj('NzMessageService', ['success', 'error']);
    fileSpy = jasmine.createSpyObj('FileService', ['saveFile']);
    groupsSpy.list.and.returnValue(of([{ id: '1', code: 'ENG', name: 'Engineering' }]));

    await TestBed.configureTestingModule({
      imports: [ResourceGroupsListComponent],
      providers: [
        { provide: ProjectResourceGroupsService, useValue: groupsSpy },
        { provide: NzMessageService, useValue: messageSpy },
        { provide: FileService, useValue: fileSpy },
        {
          provide: AuthService,
          useValue: {
            getModulePermissions: () =>
              of({
                canRead: true,
                canCreate: true,
                canUpdate: true,
                canDelete: true,
                canExport: true,
                canExecute: false,
              }),
          },
        },
        { provide: ThemeService, useValue: { effectiveTheme: () => 'light' } },
        { provide: ActivatedRoute, useValue: { queryParams: of({}) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ResourceGroupsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should load groups', () => {
    expect(component.groups.length).toBe(1);
  });

  it('should handle load error', () => {
    groupsSpy.list.and.returnValue(throwError(() => new Error('fail')));
    component.load();
    expect(messageSpy.error).toHaveBeenCalled();
  });

  it('should delete group', () => {
    groupsSpy.delete.and.returnValue(of(void 0));
    groupsSpy.list.and.returnValue(of([]));
    component.deleteGroup({ id: '1', code: 'ENG', name: 'Engineering' });
    expect(groupsSpy.delete).toHaveBeenCalledWith('1');
    expect(messageSpy.success).toHaveBeenCalled();
  });

  it('should export', () => {
    groupsSpy.exportToXlsx.and.returnValue(of(new Blob()));
    groupsSpy.exportToPdf.and.returnValue(of(new Blob()));
    component.exportToXlsx();
    component.exportToPdf();
    expect(fileSpy.saveFile).toHaveBeenCalledTimes(2);
  });
});
