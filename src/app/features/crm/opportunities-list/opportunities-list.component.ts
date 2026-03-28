import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzMessageService } from 'ng-zorro-antd/message';
import { AppConfirmDialogService } from '../../../shared/services/app-confirm-dialog.service';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { finalize } from 'rxjs/operators';
import { CrmOpportunitiesService } from '../../../core/services/crm-opportunities.service';
import { ForecastSummaryDto, OpportunityDto } from '../../../types/crm.types';
import { BaseListComponent } from '../../../core/base/base-list.component';
import { FileService } from '../../../core/services/file.service';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';
import { AppButtonComponent, AppInputComponent } from '../../../shared/components';
import { APP_PATHS } from '../../../core/constants/routes.constants';

@Component({
  selector: 'app-opportunities-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    NzTableModule,
    NzTagModule,
    NzCardModule,
    NzTooltipModule,
    NzSpinModule,
    NzSpaceModule,
    AppButtonComponent,
    AppInputComponent,
  ],
  templateUrl: './opportunities-list.component.html',
  styleUrls: ['./opportunities-list.component.css'],
})
export class OpportunitiesListComponent extends BaseListComponent<OpportunityDto> implements OnInit {
  readonly paths = APP_PATHS.CRM;

  forecast: ForecastSummaryDto | null = null;
  loadingForecast = false;

  protected override get moduleName(): string {
    return 'crm';
  }

  constructor(
    private readonly opportunitiesService: CrmOpportunitiesService,
    message: NzMessageService,
    confirmDialog: AppConfirmDialogService,
    fileService: FileService,
    cdr: ChangeDetectorRef,
    authService: AuthService,
    public readonly themeService: ThemeService,
  ) {
    super(opportunitiesService, message, confirmDialog, fileService, cdr, authService);
  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.loadForecast();
  }

  loadForecast(): void {
    this.loadingForecast = true;
    this.opportunitiesService
      .getForecastSummary({})
      .pipe(finalize(() => (this.loadingForecast = false)))
      .subscribe({
        next: (f) => (this.forecast = f),
        error: () => this.message.error('Failed to load forecast summary'),
      });
  }

  get opportunities(): OpportunityDto[] {
    return this.data;
  }
}
