import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ProjectLedgerPanelComponent } from './project-ledger-panel.component';
import { ProjectPostingService } from '../../../../core/services/project-posting.service';
import { ProjectTasksService } from '../../../../core/services/project-tasks.service';
import { FileService } from '../../../../core/services/file.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ThemeService } from '../../../../core/services/theme.service';

describe('ProjectLedgerPanelComponent', () => {
  let component: ProjectLedgerPanelComponent;
  let fixture: ComponentFixture<ProjectLedgerPanelComponent>;
  let postingSpy: jasmine.SpyObj<ProjectPostingService>;
  let fileSpy: jasmine.SpyObj<FileService>;

  beforeEach(async () => {
    postingSpy = jasmine.createSpyObj('ProjectPostingService', [
      'listLedgerEntries',
      'exportLedgerToXlsx',
    ]);
    fileSpy = jasmine.createSpyObj('FileService', ['saveFile']);
    postingSpy.listLedgerEntries.and.returnValue(
      of([{ id: 'e1', projectId: 'p1', projectTaskId: 't1', entryNo: 1 }]),
    );

    await TestBed.configureTestingModule({
      imports: [ProjectLedgerPanelComponent],
      providers: [
        { provide: ProjectPostingService, useValue: postingSpy },
        { provide: ProjectTasksService, useValue: { list: () => of([{ id: 't1', taskNo: '10', description: 'T', projectId: 'p1' }]) } },
        { provide: FileService, useValue: fileSpy },
        { provide: NzMessageService, useValue: jasmine.createSpyObj('NzMessageService', ['error']) },
        { provide: ThemeService, useValue: { effectiveTheme: () => 'light' } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectLedgerPanelComponent);
    component = fixture.componentInstance;
    component.projectId = 'p1';
    component.permissions = {
      canRead: true,
      canCreate: false,
      canUpdate: false,
      canDelete: false,
      canExport: true,
      canExecute: false,
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

  it('should load ledger entries', () => {
    expect(component.entries.length).toBe(1);
  });

  it('should filter and export', () => {
    component.onFilterChange('t1');
    expect(postingSpy.listLedgerEntries).toHaveBeenCalledWith('p1', 't1');
    postingSpy.exportLedgerToXlsx.and.returnValue(of(new Blob()));
    component.exportXlsx();
    expect(fileSpy.saveFile).toHaveBeenCalled();
  });
});
