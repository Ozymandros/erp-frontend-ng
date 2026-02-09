import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';
import { BaseListComponent } from '../../../core/base/base-list.component';
import { SupplierDto } from '../../../types/api.types';
import { SuppliersService } from '../../../core/services/suppliers.service';
import { FileService } from '../../../core/services/file.service';
import { AuthService } from '../../../core/services/auth.service';
import { AppButtonComponent, AppInputComponent } from '../../../shared/components';

@Component({
  selector: 'app-suppliers-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    NzTableModule,
    NzTagModule,
    NzSpaceModule,
    NzPopconfirmModule,
    NzTypographyModule,
    NzCardModule,
    NzTooltipModule,
    AppButtonComponent,
    AppInputComponent
  ],
  templateUrl: './suppliers-list.component.html',
  styleUrls: ['./suppliers-list.component.css']
})
export class SuppliersListComponent extends BaseListComponent<SupplierDto> implements OnInit {
  protected get moduleName(): string {
    return 'purchasing';
  }

  constructor(
    private readonly suppliersService: SuppliersService,
    message: NzMessageService,
    modal: NzModalService,
    fileService: FileService,
    cdr: ChangeDetectorRef,
    authService: AuthService
  ) {
    super(suppliersService, message, modal, fileService, cdr, authService);
  }

  override ngOnInit(): void {
    super.ngOnInit();
  }

  deleteSupplier(supplier: SupplierDto): void {
    this.deleteItem(supplier.id, 'supplier');
  }

  // onSearch, onPageChange, onPageSizeChange, exportToXlsx, exportToPdf are inherited
}
