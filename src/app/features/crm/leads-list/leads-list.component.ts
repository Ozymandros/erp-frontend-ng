import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzCardModule } from 'ng-zorro-antd/card';
import { AppConfirmDialogService } from '../../../shared/services/app-confirm-dialog.service';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';
import { CrmLeadsService } from '../../../core/services/crm-leads.service';
import { LeadDto } from '../../../types/crm.types';
import { BaseListComponent } from '../../../core/base/base-list.component';
import { FileService } from '../../../core/services/file.service';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';
import { AppButtonComponent, AppInputComponent } from '../../../shared/components';
import { APP_PATHS } from '../../../core/constants/routes.constants';

@Component({
  selector: 'app-leads-list',
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
  templateUrl: './leads-list.component.html',
  styleUrls: ['./leads-list.component.css'],
})
export class LeadsListComponent extends BaseListComponent<LeadDto> {
  readonly paths = APP_PATHS.CRM;

  protected override get moduleName(): string {
    return 'crm';
  }

  constructor(
    leadsService: CrmLeadsService,
    message: NzMessageService,
    confirmDialog: AppConfirmDialogService,
    fileService: FileService,
    cdr: ChangeDetectorRef,
    authService: AuthService,
    public readonly themeService: ThemeService,
  ) {
    super(leadsService, message, confirmDialog, fileService, cdr, authService);
  }

  get leads(): LeadDto[] {
    return this.data;
  }

  deleteLead(lead: LeadDto): void {
    super.deleteItem(lead.id, 'lead', lead.title);
  }
}
