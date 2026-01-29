import { Component, ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { Subject, takeUntil, finalize } from 'rxjs';
import { BaseApiService } from './base-api.service';
import { FileService } from '../services/file.service';
import { AuthService } from '../services/auth.service';
import { ModulePermissions } from '../types/api.types';
import { Observable, of } from 'rxjs';

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
    this.loadData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadData(): void {
    this.loading = true;
    const params: any = {
      page: this.pageIndex,
      pageSize: this.pageSize
    };
    
    // Add search parameter if provided
    // Backend API expects SearchTerm (capital S) for search functionality
    if (this.searchTerm && this.searchTerm.trim()) {
      params.SearchTerm = this.searchTerm.trim();
    }
    
    this.service.getAll(params).pipe(
      takeUntil(this.destroy$),
      finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (response: any) => {
        // Handle both wrapper and direct array responses for flexibility, though BaseApi expects wrapper
        this.data = response?.items || (Array.isArray(response) ? response : []);
        this.total = response?.total || (Array.isArray(response) ? response.length : 0);
      },
      error: (error) => {
        this.message.error('Failed to load data');
        console.error(error);
      }
    });
  }


  onSearch(): void {
    this.pageIndex = 1;
    this.loadData();
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
