import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';
import { AppConfirmDialogService } from '../../../shared/services/app-confirm-dialog.service';
import { ProjectResourcesService } from '../../../core/services/project-resources.service';
import { ResourceDto } from '../../../types/projects.types';
import { BaseListComponent } from '../../../core/base/base-list.component';
import { FileService } from '../../../core/services/file.service';
import { AuthService } from '../../../core/services/auth.service';
import { AppButtonComponent, AppInputComponent } from '../../../shared/components';
import { APP_PATHS } from '../../../core/constants/routes.constants';

@Component({
  selector: 'app-resources-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    NzTableModule,
    NzSpaceModule,
    NzPopconfirmModule,
    NzTooltipModule,
    AppButtonComponent,
    AppInputComponent,
  ],
  templateUrl: './resources-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./resources-list.component.css'],
})
export class ResourcesListComponent extends BaseListComponent<ResourceDto> {
  readonly paths = APP_PATHS.PROJECTS;

  protected override get moduleName(): string {
    return 'projects';
  }

  constructor(
    resourcesService: ProjectResourcesService,
    message: NzMessageService,
    confirmDialog: AppConfirmDialogService,
    fileService: FileService,
    cdr: ChangeDetectorRef,
    authService: AuthService,
  ) {
    super(resourcesService, message, confirmDialog, fileService, cdr, authService);
  }

  get resources(): ResourceDto[] {
    return this.data;
  }

  deleteResource(resource: ResourceDto): void {
    super.deleteItem(resource.id, 'resource', resource.name);
  }
}
