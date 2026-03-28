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
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { distinctUntilChanged, map, skip } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { CrmContactsService } from '../../../core/services/crm-contacts.service';
import { ContactDto } from '../../../types/crm.types';
import { BaseListComponent } from '../../../core/base/base-list.component';
import { FileService } from '../../../core/services/file.service';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';
import { AppButtonComponent, AppInputComponent } from '../../../shared/components';
import { APP_PATHS } from '../../../core/constants/routes.constants';

const SEARCH_MIN = 3;

@Component({
  selector: 'app-contacts-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    NzTableModule,
    NzTagModule,
    NzCardModule,
    NzTooltipModule,
    NzSpaceModule,
    AppButtonComponent,
    AppInputComponent,
  ],
  templateUrl: './contacts-list.component.html',
  styleUrls: ['./contacts-list.component.css'],
})
export class ContactsListComponent extends BaseListComponent<ContactDto> implements OnInit {
  readonly paths = APP_PATHS.CRM;

  protected override get moduleName(): string {
    return 'crm';
  }

  constructor(
    svc: CrmContactsService,
    message: NzMessageService,
    confirmDialog: AppConfirmDialogService,
    fileService: FileService,
    cdr: ChangeDetectorRef,
    authService: AuthService,
    public readonly themeService: ThemeService,
  ) {
    super(svc, message, confirmDialog, fileService, cdr, authService);
  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.route.queryParamMap
      .pipe(
        map((q) => q.get('accountId')),
        distinctUntilChanged(),
        skip(1),
        takeUntil(this.destroy$),
      )
      .subscribe(() => {
        this.pageIndex = 1;
        this.loadData();
      });
  }

  override loadData(): void {
    this.loading = true;
    const params: Record<string, string | number> = {
      page: this.pageIndex,
      pageSize: this.pageSize,
    };

    const term = (this.searchTerm || '').trim();
    if (term.length >= SEARCH_MIN) {
      params['SearchTerm'] = term;
    }

    const accountId = this.route.snapshot.queryParamMap.get('accountId');
    if (accountId) {
      params['AccountId'] = accountId;
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
        next: (response: { items?: ContactDto[]; total?: number } | ContactDto[]) => {
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

  get contacts(): ContactDto[] {
    return this.data;
  }

  deleteContact(c: ContactDto): void {
    super.deleteItem(c.id, 'contact', c.fullName);
  }
}
