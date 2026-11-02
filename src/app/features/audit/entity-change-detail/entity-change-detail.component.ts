import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzResultModule } from 'ng-zorro-antd/result';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Subject, finalize, takeUntil } from 'rxjs';
import { AuditEntityChangesService } from '../../../core/services/audit-entity-changes.service';
import { EntityChangeDto } from '../../../types/api.types';
import { SafeJsonViewerComponent } from '../../../shared/components';
import { APP_PATHS } from '../../../core/constants/routes.constants';
import { looksLikeJson } from '../../../core/utils/json-display.util';
import {
  resolvePropertyChanges,
  shouldShowPropertyChangesSection,
} from '../../../core/utils/audit-property-changes.util';
import { PropertyChangeDto } from '../../../types/api.types';

@Component({
  selector: 'app-entity-change-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterLink,
    NzCardModule,
    NzResultModule,
    NzSpinModule,
    NzTableModule,
    NzTagModule,
    NzTypographyModule,
    SafeJsonViewerComponent,
  ],
  templateUrl: './entity-change-detail.component.html',
  styleUrls: ['./entity-change-detail.component.css'],
})
export class EntityChangeDetailComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly auditService = inject(AuditEntityChangesService);
  private readonly message = inject(NzMessageService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroy$ = new Subject<void>();

  readonly listPath = APP_PATHS.AUDIT.ROOT;

  change: EntityChangeDto | null = null;
  displayPropertyChanges: PropertyChangeDto[] = [];
  loading = true;
  notFound = false;

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      const id = params.get('id');
      if (!id) {
        this.notFound = true;
        this.loading = false;
        this.cdr.markForCheck();
        return;
      }
      this.loadChange(id);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getChangeTypeColor(changeType: string): string {
    const t = changeType.toLowerCase();
    if (t.includes('creat') || t.includes('add')) {
      return 'green';
    }
    if (t.includes('delet') || t.includes('remov')) {
      return 'red';
    }
    if (t.includes('updat') || t.includes('modif')) {
      return 'blue';
    }
    return 'default';
  }

  showPropertyChangesSection(): boolean {
    if (!this.change) {
      return false;
    }
    return shouldShowPropertyChangesSection(this.change, this.displayPropertyChanges);
  }

  showJsonViewer(value: string | null): boolean {
    if (value == null || value === '') {
      return false;
    }
    return looksLikeJson(value) || value.length > 80;
  }

  private loadChange(id: string): void {
    this.loading = true;
    this.notFound = false;
    this.change = null;
    this.cdr.markForCheck();

    this.auditService
      .getById(id)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.loading = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: (dto) => {
          this.change = dto;
          this.displayPropertyChanges = resolvePropertyChanges(dto);
          this.cdr.markForCheck();
        },
        error: (err: Error) => {
          const msg = err?.message ?? '';
          if (msg.toLowerCase().includes('not found') || msg.includes('404')) {
            this.notFound = true;
          } else {
            this.message.error('Failed to load audit entry');
            console.error(err);
          }
          this.cdr.markForCheck();
        },
      });
  }
}
