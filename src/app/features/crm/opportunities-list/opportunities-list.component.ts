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
import { of, TimeoutError } from 'rxjs';
import { catchError, finalize, takeUntil, timeout } from 'rxjs/operators';
import { CrmOpportunitiesService } from '../../../core/services/crm-opportunities.service';
import { ForecastSummaryDto, OpportunityDto } from '../../../types/crm.types';
import { BaseListComponent } from '../../../core/base/base-list.component';
import { FileService } from '../../../core/services/file.service';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';
import { AppButtonComponent, AppInputComponent } from '../../../shared/components';
import { APP_PATHS } from '../../../core/constants/routes.constants';

/** Abort hanging forecast API calls so the summary card cannot spin forever. */
const FORECAST_REQUEST_TIMEOUT_MS = 60_000;

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
      .pipe(
        takeUntil(this.destroy$),
        timeout(FORECAST_REQUEST_TIMEOUT_MS),
        catchError((err: unknown) => {
          console.error('Forecast summary failed', err);
          this.message.error(
            err instanceof TimeoutError ? 'Forecast summary request timed out' : 'Failed to load forecast summary',
          );
          return of(null);
        }),
        finalize(() => {
          this.loadingForecast = false;
          // Same pattern as BaseListComponent.loadData — avoid stuck spinner when async updates land in the same CD turn
          queueMicrotask(() => this.cdr.detectChanges());
        }),
      )
      .subscribe({
        next: (f) => {
          this.forecast = f;
        },
      });
  }

  get opportunities(): OpportunityDto[] {
    return this.data;
  }
}
