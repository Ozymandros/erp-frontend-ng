import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzMessageService } from 'ng-zorro-antd/message';
import { finalize } from 'rxjs';
import { ProjectPostingService } from '../../../../core/services/project-posting.service';
import { ProjectTasksService } from '../../../../core/services/project-tasks.service';
import { FileService } from '../../../../core/services/file.service';
import { ProjectLedgerEntryDto, ProjectTaskDto } from '../../../../types/projects.types';
import { ModulePermissions } from '../../../../types/api.types';
import { AppButtonComponent } from '../../../../shared/components';

@Component({
  selector: 'app-project-ledger-panel',
  standalone: true,
  imports: [CommonModule, FormsModule, NzTableModule, NzSelectModule, AppButtonComponent],
  templateUrl: './project-ledger-panel.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectLedgerPanelComponent implements OnChanges {
  @Input({ required: true }) projectId!: string;
  @Input() permissions: ModulePermissions | null = null;

  entries: ProjectLedgerEntryDto[] = [];
  tasks: ProjectTaskDto[] = [];
  filterTaskId: string | null = null;
  loading = false;

  constructor(
    private readonly postingService: ProjectPostingService,
    private readonly tasksService: ProjectTasksService,
    private readonly fileService: FileService,
    private readonly message: NzMessageService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['projectId'] && this.projectId) {
      this.tasksService.list(this.projectId).subscribe((t) => {
        this.tasks = t;
        this.cdr.markForCheck();
      });
      this.load();
    }
  }

  load(): void {
    this.loading = true;
    this.postingService
      .listLedgerEntries(this.projectId, this.filterTaskId ?? undefined)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: (items) => {
          this.entries = items;
        },
        error: () => this.message.error('Failed to load ledger'),
      });
  }

  onFilterChange(taskId: string | null): void {
    this.filterTaskId = taskId;
    this.load();
  }

  exportXlsx(): void {
    this.postingService.exportLedgerToXlsx(this.projectId).subscribe({
      next: (blob) => this.fileService.saveFile(blob, 'ledger.xlsx'),
      error: () => this.message.error('Export failed'),
    });
  }
}
