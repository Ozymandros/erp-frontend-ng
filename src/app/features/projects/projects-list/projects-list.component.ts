import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';
import { AppConfirmDialogService } from '../../../shared/services/app-confirm-dialog.service';
import { ProjectsService } from '../../../core/services/projects.service';
import { ProjectDto } from '../../../types/projects.types';
import { BaseListComponent } from '../../../core/base/base-list.component';
import { FileService } from '../../../core/services/file.service';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';
import { AppButtonComponent, AppInputComponent } from '../../../shared/components';
import { APP_PATHS } from '../../../core/constants/routes.constants';
import { projectStatusTagColor } from '../projects.constants';

@Component({
  selector: 'app-projects-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    NzTableModule,
    NzSpaceModule,
    NzTagModule,
    NzPopconfirmModule,
    NzCardModule,
    NzTooltipModule,
    AppButtonComponent,
    AppInputComponent,
  ],
  templateUrl: './projects-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./projects-list.component.css'],
})
export class ProjectsListComponent extends BaseListComponent<ProjectDto> {
  readonly paths = APP_PATHS.PROJECTS;
  readonly statusTagColor = projectStatusTagColor;

  protected override get moduleName(): string {
    return 'projects';
  }

  constructor(
    projectsService: ProjectsService,
    message: NzMessageService,
    confirmDialog: AppConfirmDialogService,
    fileService: FileService,
    cdr: ChangeDetectorRef,
    authService: AuthService,
    public readonly themeService: ThemeService,
  ) {
    super(projectsService, message, confirmDialog, fileService, cdr, authService);
  }

  get projects(): ProjectDto[] {
    return this.data;
  }

  deleteProject(project: ProjectDto): void {
    super.deleteItem(project.id, 'project', project.description ?? project.projectNumber ?? project.id);
  }
}
