import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzMessageService } from 'ng-zorro-antd/message';
import { AppConfirmDialogService } from '../../../shared/services/app-confirm-dialog.service';
import { NzCardModule } from 'ng-zorro-antd/card';
import { BaseListComponent } from '../../../core/base/base-list.component';
import { InvoiceDto } from '../../../types/api.types';
import { InvoicesService } from '../../../core/services/invoices.service';
import { FileService } from '../../../core/services/file.service';
import { AuthService } from '../../../core/services/auth.service';
import { AppButtonComponent, AppInputComponent } from '../../../shared/components';
import { APP_PATHS } from '../../../core/constants/routes.constants';

@Component({
  selector: 'app-invoices-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    NzTableModule,
    NzTagModule,
    NzSpaceModule,
    NzTypographyModule,
    NzCardModule,
    AppButtonComponent,
    AppInputComponent
  ],
  templateUrl: './invoices-list.component.html',
  styleUrls: ['./invoices-list.component.css']
})
export class InvoicesListComponent extends BaseListComponent<InvoiceDto> {
  protected override get moduleName(): string {
    return 'invoices';
  }

  readonly paths = APP_PATHS.BILLING;

  constructor(
    invoicesService: InvoicesService,
    message: NzMessageService,
    confirmDialog: AppConfirmDialogService,
    fileService: FileService,
    cdr: ChangeDetectorRef,
    authService: AuthService
  ) {
    super(invoicesService, message, confirmDialog, fileService, cdr, authService);
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'Draft': return 'default';
      case 'Issued': return 'blue';
      case 'Paid': return 'green';
      case 'PartiallyPaid': return 'orange';
      case 'Overdue': return 'red';
      case 'Cancelled': return 'default';
      default: return 'default';
    }
  }
}