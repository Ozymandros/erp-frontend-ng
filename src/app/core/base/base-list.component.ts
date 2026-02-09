import {
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  inject,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { Observable, Subject, debounceTime, finalize, of, takeUntil } from 'rxjs';
import { ModulePermissions } from '../../types/api.types';
import { AuthService } from '../services/auth.service';
import { FileService } from '../services/file.service';
import { BaseApiService } from './base-api.service';

/** Min characters before search is sent to the API; fewer means no SearchTerm param (show all). */
const SEARCH_MIN_LENGTH = 3;
/** Debounce delay (ms) for search input before triggering API. */
const SEARCH_DEBOUNCE_MS = 300;

@Component({
  template: '',
})
export abstract class BaseListComponent<T> implements OnInit, OnDestroy {
  data: T[] = [];
  loading = false;
  total = 0;
  pageIndex = 1;
  pageSize = 10;
  searchTerm = '';

  /** Triggers a debounced load when search input changes. */
  private readonly searchTrigger$ = new Subject<void>();
  protected readonly destroy$ = new Subject<void>();

  // Inject Router and ActivatedRoute using standalone inject() API
  protected readonly router = inject(Router);
  protected readonly route = inject(ActivatedRoute);

  // Explicit orchestration: components define which module they belong to
  protected abstract get moduleName(): string;

  // Granular permissions observable
  permissions$: Observable<ModulePermissions> = of({
    canRead: false,
    canCreate: false,
    canUpdate: false,
    canDelete: false,
    canExport: false,
  });

  constructor(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    protected readonly service: BaseApiService<T, any, any>,
    protected readonly message: NzMessageService,
    protected readonly modal: NzModalService,
    protected readonly fileService: FileService,
    protected readonly cdr: ChangeDetectorRef,
    protected readonly authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.permissions$ = this.authService.getModulePermissions(this.moduleName);

    // Initialize state from URL query parameters for deep-linking
    // Guard against test environments where ActivatedRoute may not be provided
    if (this.route?.queryParams) {
      this.route.queryParams
        .pipe(takeUntil(this.destroy$))
        .subscribe((params) => {
          const page = Number.parseInt(params['page'], 10);
          const size = Number.parseInt(params['pageSize'], 10);
          const search = params['search'];

          if (page && page !== this.pageIndex) {
            this.pageIndex = page;
          }
          if (size && size !== this.pageSize) {
            this.pageSize = size;
          }
          if (search !== undefined && search !== this.searchTerm) {
            this.searchTerm = search;
          }
        });
    }

    this.searchTrigger$
      .pipe(debounceTime(SEARCH_DEBOUNCE_MS), takeUntil(this.destroy$))
      .subscribe(() => this.loadData());
    this.loadData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadData(): void {
    this.loading = true;
    const params: Record<string, string | number> = {
      page: this.pageIndex,
      pageSize: this.pageSize,
    };

    // Add search parameter only when at least SEARCH_MIN_LENGTH characters
    // Backend API expects SearchTerm (capital S) for search functionality
    const term = (this.searchTerm || '').trim();
    if (term.length >= SEARCH_MIN_LENGTH) {
      params['SearchTerm'] = term;
    }

    this.service
      .getAll(params)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        }),
      )
      .subscribe({
        next: (response: { items?: T[]; total?: number } | T[]) => {
          // Handle both wrapper and direct array responses for flexibility, though BaseApi expects wrapper
          this.data =
            (response && typeof response === 'object' && 'items' in response
              ? response.items
              : Array.isArray(response)
                ? response
                : []) ?? [];
          this.total =
            (response && typeof response === 'object' && 'total' in response
              ? response.total
              : Array.isArray(response)
                ? response.length
                : 0) ?? 0;
        },
        error: (error) => {
          this.message.error('Failed to load data');
          console.error(error);
        },
      });
  }

  onSearch(): void {
    this.pageIndex = 1;
    this.updateUrl();
    this.searchTrigger$.next();
  }

  onPageChange(page: number): void {
    this.pageIndex = page;
    this.updateUrl();
    this.loadData();
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.pageIndex = 1;
    this.updateUrl();
    this.loadData();
  }

  /** Sync current pagination and search state to URL query parameters for deep-linking */
  private updateUrl(): void {
    // Guard against test environments where Router may not be available
    if (!this.router || !this.route) {
      return;
    }

    const queryParams: Record<string, string | number> = {
      page: this.pageIndex,
      pageSize: this.pageSize,
    };

    // Only include search if it has meaningful content
    if (this.searchTerm && this.searchTerm.trim().length > 0) {
      queryParams['search'] = this.searchTerm.trim();
    }

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'merge',
      replaceUrl: true, // Don't add to browser history for every pagination change
    });
  }

  deleteItem(id: string, name: string = 'item', displayName?: string): void {
    this.modal.confirm({
      nzTitle: `Delete ${name}`,
      nzContent: `Are you sure you want to delete this ${name}?`,
      nzOkText: 'Delete',
      nzOkDanger: true,
      nzOnOk: () => {
        this.service
          .delete(id)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.message.success(`${name} deleted successfully`);
              this.loadData();
            },
            error: (error) => {
              const errorMsg = displayName
                ? `Failed to delete ${name} "${displayName}"`
                : `Failed to delete ${name}`;
              this.message.error(errorMsg);
              console.error(error);
            },
          });
      },
    });
  }

  exportToXlsx(fileName: string = 'export.xlsx'): void {
    this.service
      .exportToXlsx()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (blob) => {
          this.fileService.saveFile(blob, fileName);
          this.message.success('Exported to XLSX successfully');
        },
        error: (error) => {
          this.message.error('Failed to export to XLSX');
          console.error(error);
        },
      });
  }

  exportToPdf(fileName: string = 'export.pdf'): void {
    this.service
      .exportToPdf()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (blob) => {
          this.fileService.saveFile(blob, fileName);
          this.message.success('Exported to PDF successfully');
        },
        error: (error) => {
          this.message.error('Failed to export to PDF');
          console.error(error);
        },
      });
  }
}
