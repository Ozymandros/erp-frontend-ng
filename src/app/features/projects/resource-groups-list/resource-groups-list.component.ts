import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { finalize } from 'rxjs';
import { ProjectResourceGroupsService } from '../../../core/services/project-resource-groups.service';
import { AuthService } from '../../../core/services/auth.service';
import { FileService } from '../../../core/services/file.service';
import { ResourceGroupDto } from '../../../types/projects.types';
import { ModulePermissions } from '../../../types/api.types';
import { AppButtonComponent } from '../../../shared/components';
import { APP_PATHS } from '../../../core/constants/routes.constants';

@Component({
  selector: 'app-resource-groups-list',
  standalone: true,
  imports: [CommonModule, RouterLink, NzTableModule, NzPopconfirmModule, NzSpaceModule, AppButtonComponent],
  templateUrl: './resource-groups-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./resource-groups-list.component.css'],
})
export class ResourceGroupsListComponent implements OnInit {
  readonly paths = APP_PATHS.PROJECTS;
  groups: ResourceGroupDto[] = [];
  loading = false;
  permissions: ModulePermissions = {
    canRead: false,
    canCreate: false,
    canUpdate: false,
    canDelete: false,
    canExport: false,
    canExecute: false,
  };

  constructor(
    private readonly groupsService: ProjectResourceGroupsService,
    private readonly message: NzMessageService,
    private readonly fileService: FileService,
    private readonly authService: AuthService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.authService.getModulePermissions('projects').subscribe((p) => {
      this.permissions = p;
      this.cdr.markForCheck();
    });
    this.load();
  }

  load(): void {
    this.loading = true;
    this.groupsService
      .list()
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: (items) => {
          this.groups = items;
        },
        error: () => this.message.error('Failed to load resource groups'),
      });
  }

  deleteGroup(group: ResourceGroupDto): void {
    this.groupsService.delete(group.id).subscribe({
      next: () => {
        this.message.success('Resource group deleted');
        this.load();
      },
      error: () => this.message.error('Failed to delete resource group'),
    });
  }

  exportToXlsx(): void {
    this.groupsService.exportToXlsx().subscribe({
      next: (blob) => this.fileService.saveFile(blob, 'resource-groups.xlsx'),
      error: () => this.message.error('Export failed'),
    });
  }

  exportToPdf(): void {
    this.groupsService.exportToPdf().subscribe({
      next: (blob) => this.fileService.saveFile(blob, 'resource-groups.pdf'),
      error: () => this.message.error('Export failed'),
    });
  }
}
