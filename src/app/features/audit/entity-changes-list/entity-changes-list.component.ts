import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { Subject, debounceTime, finalize, takeUntil } from 'rxjs';
import { AppConfirmDialogService } from '../../../shared/services/app-confirm-dialog.service';
import { AuditEntityChangesService } from '../../../core/services/audit-entity-changes.service';
import { EntityChangeDto, EntityChangeListParams } from '../../../types/api.types';
import { BaseListComponent } from '../../../core/base/base-list.component';
import { FileService } from '../../../core/services/file.service';
import { AuthService } from '../../../core/services/auth.service';
import {
  AppButtonComponent,
  AppInputComponent,
  AppSelectComponent,
} from '../../../shared/components';
import { normalizePaginatedResponse } from '../../../core/utils/paginated-response.util';
import { APP_PATHS } from '../../../core/constants/routes.constants';

const CHANGE_TYPE_OPTIONS = [
  { label: 'All types', value: '' },
  { label: 'Created', value: 'Created' },
  { label: 'Updated', value: 'Updated' },
  { label: 'Deleted', value: 'Deleted' },
];

@Component({
  selector: 'app-entity-changes-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    NzTableModule,
    NzSpaceModule,
    NzTagModule,
    NzCardModule,
    NzTooltipModule,
    NzTypographyModule,
    AppButtonComponent,
    AppInputComponent,
    AppSelectComponent,
  ],
  templateUrl: './entity-changes-list.component.html',
  styleUrls: ['./entity-changes-list.component.css'],
})
export class EntityChangesListComponent extends BaseListComponent<EntityChangeDto> implements OnInit {
  readonly changeTypeOptions = CHANGE_TYPE_OPTIONS;
  readonly pageSizeOptions = [10, 20, 50, 100];
  readonly detailPath = APP_PATHS.AUDIT.DETAIL;

  filterEntityName = '';
  filterChangeType = '';
  sortBy = 'createdAt';
  sortDesc = true;

  override pageSize = 20;

  private readonly auditSearchTrigger$ = new Subject<void>();

  protected get moduleName(): string {
    return 'audit';
  }

  constructor(
    private readonly auditService: AuditEntityChangesService,
    message: NzMessageService,
    confirmDialog: AppConfirmDialogService,
    fileService: FileService,
    cdr: ChangeDetectorRef,
    authService: AuthService,
  ) {
    super(auditService, message, confirmDialog, fileService, cdr, authService);
  }

  get entityChanges(): EntityChangeDto[] {
    return this.data;
  }

  override ngOnInit(): void {
    const snapshot = this.route?.snapshot?.queryParams ?? {};
    this.filterEntityName = (snapshot['entityName'] as string) ?? '';
    this.filterChangeType = (snapshot['changeType'] as string) ?? '';
    super.ngOnInit();

    this.auditSearchTrigger$
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe(() => this.loadData());

    if (this.route?.queryParams) {
      this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe((params) => {
        const entityName = (params['entityName'] as string) ?? '';
        const changeType = (params['changeType'] as string) ?? '';
        if (entityName !== this.filterEntityName || changeType !== this.filterChangeType) {
          this.filterEntityName = entityName;
          this.filterChangeType = changeType;
          this.cdr.detectChanges();
        }
      });
    }
  }

  override loadData(): void {
    this.loading = true;
    const params: EntityChangeListParams = {
      page: this.pageIndex,
      pageSize: this.pageSize,
      sortBy: this.sortBy,
      sortDesc: this.sortDesc,
      searchFields: 'entityName,createdBy',
    };

    const term = (this.searchTerm || '').trim();
    if (term.length >= 3) {
      params.searchTerm = term;
    }

    const filters: Record<string, string> = {};
    const entityName = this.filterEntityName.trim();
    if (entityName) {
      filters['entityName'] = entityName;
    }
    if (this.filterChangeType) {
      filters['changeType'] = this.filterChangeType;
    }
    if (Object.keys(filters).length > 0) {
      params.filters = filters;
    }

    this.auditService
      .getAll(params)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        }),
      )
      .subscribe({
        next: (response) => {
          const { items, total } = normalizePaginatedResponse<EntityChangeDto>(response);
          this.data = items;
          this.total = total;
        },
        error: (error) => {
          this.message.error('Failed to load audit history');
          console.error(error);
        },
      });
  }

  applyFilters(): void {
    this.pageIndex = 1;
    this.syncListUrl();
    this.loadData();
  }

  clearFilters(): void {
    this.filterEntityName = '';
    this.filterChangeType = '';
    this.searchTerm = '';
    this.pageIndex = 1;
    this.syncListUrl();
    this.loadData();
  }

  override onSearch(): void {
    this.pageIndex = 1;
    this.syncListUrl();
    this.auditSearchTrigger$.next();
  }

  override onPageChange(page: number): void {
    this.pageIndex = page;
    this.syncListUrl();
    this.loadData();
  }

  override onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.pageIndex = 1;
    this.syncListUrl();
    this.loadData();
  }

  onSort(column: string): void {
    if (this.sortBy === column) {
      this.sortDesc = !this.sortDesc;
    } else {
      this.sortBy = column;
      this.sortDesc = true;
    }
    this.pageIndex = 1;
    this.syncListUrl();
    this.loadData();
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

  truncateId(id: string): string {
    if (!id || id.length <= 12) {
      return id;
    }
    return `${id.slice(0, 8)}…`;
  }

  private syncListUrl(): void {
    if (!this.router || !this.route) {
      return;
    }

    const queryParams: Record<string, string | number> = {
      page: this.pageIndex,
      pageSize: this.pageSize,
    };

    const search = this.searchTerm?.trim();
    if (search) {
      queryParams['search'] = search;
    }
    const entityName = this.filterEntityName.trim();
    if (entityName) {
      queryParams['entityName'] = entityName;
    }
    if (this.filterChangeType) {
      queryParams['changeType'] = this.filterChangeType;
    }

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      replaceUrl: true,
    });
  }
}
