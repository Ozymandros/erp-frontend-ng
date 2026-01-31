import { Component, ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { Subject, takeUntil, finalize, debounceTime } from 'rxjs';
import { BaseApiService } from './base-api.service';
import { FileService } from '../services/file.service';
import { AuthService } from '../services/auth.service';
import { ModulePermissions } from '../../types/api.types';
import { Observable, of } from 'rxjs';

/** Min characters before search is sent to the API; fewer means no SearchTerm param (show all). */
const SEARCH_MIN_LENGTH = 3;
/** Debounce delay (ms) for search input before triggering API. */
const SEARCH_DEBOUNCE_MS = 300;

@Component({
  template: ''
})
export abstract class BaseListComponent<T> implements OnInit, OnDestroy {
  data: T[] = [];
  loading = false;
  total = 0;
  pageIndex = 1;
  pageSize = 10;
  searchTerm = '';

  /** Triggers a debounced load when search input changes. */
  private searchTrigger$ = new Subject<void>();
  protected destroy$ = new Subject<void>();

  // Explicit orchestration: components define which module they belong to
  protected abstract get moduleName(): string;

  // Granular permissions observable
  permissions$: Observable<ModulePermissions> = of({
    canRead: false,
    canCreate: false,
    canUpdate: false,
    canDelete: false,
    canExport: false
  });

  constructor(
    protected service: BaseApiService<T>,
    protected message: NzMessageService,
    protected modal: NzModalService,
    protected fileService: FileService,
    protected cdr: ChangeDetectorRef,
    protected authService: AuthService
  ) {}

  ngOnInit(): void {
    this.permissions$ = this.authService.getModulePermissions(this.moduleName);
    this.searchTrigger$.pipe(
      debounceTime(SEARCH_DEBOUNCE_MS),
      takeUntil(this.destroy$)
    ).subscribe(() => this.loadData());
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
      pageSize: this.pageSize
    };
    
    // Add search parameter only when at least SEARCH_MIN_LENGTH characters
    // Backend API expects SearchTerm (capital S) for search functionality
    const term = (this.searchTerm || '').trim();
    if (term.length >= SEARCH_MIN_LENGTH) {
      params['SearchTerm'] = term;
    }
    
    this.service.getAll(params).pipe(
      takeUntil(this.destroy$),
      finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (response: { items?: T[]; total?: number } | T[]) => {
        // Handle both wrapper and direct array responses for flexibility, though BaseApi expects wrapper
        this.data = (response && typeof response === 'object' && 'items' in response ? response.items : Array.isArray(response) ? response : []) ?? [];
        this.total = (response && typeof response === 'object' && 'total' in response ? response.total : Array.isArray(response) ? response.length : 0) ?? 0;
      },
      error: (error) => {
        this.message.error('Failed to load data');
        console.error(error);
      }
    });
  }


  onSearch(): void {
    this.pageIndex = 1;
    this.searchTrigger$.next();
  }

  onPageChange(page: number): void {
    this.pageIndex = page;
    this.loadData();
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.pageIndex = 1;
    this.loadData();
  }

  deleteItem(id: string, name: string = 'item'): void {
    this.modal.confirm({
      nzTitle: `Delete ${name}`,
      nzContent: `Are you sure you want to delete this ${name}?`,
      nzOkText: 'Delete',
      nzOkDanger: true,
      nzOnOk: () => {
        this.service.delete(id).pipe(
          takeUntil(this.destroy$)
        ).subscribe({
          next: () => {
            this.message.success(`${name} deleted successfully`);
            this.loadData();
          },
          error: (error) => {
            this.message.error(`Failed to delete ${name}`);
            console.error(error);
          }
        });
      }
    });
  }

  exportToXlsx(fileName: string = 'export.xlsx'): void {
    this.service.exportToXlsx().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (blob) => {
        this.fileService.saveFile(blob, fileName);
        this.message.success('Exported to XLSX successfully');
      },
      error: (error) => {
        this.message.error('Failed to export to XLSX');
        console.error(error);
      }
    });
  }

  exportToPdf(fileName: string = 'export.pdf'): void {
    this.service.exportToPdf().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (blob) => {
        this.fileService.saveFile(blob, fileName);
        this.message.success('Exported to PDF successfully');
      },
      error: (error) => {
        this.message.error('Failed to export to PDF');
        console.error(error);
      }
    });
  }
}
