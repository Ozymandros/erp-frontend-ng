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
import { SalesOrderDto } from '../../../types/api.types';
import { SalesOrdersService } from '../../../core/services/sales-orders.service';
import { FileService } from '../../../core/services/file.service';
import { AuthService } from '../../../core/services/auth.service';
import { AppButtonComponent, AppInputComponent } from '../../../shared/components';

@Component({
  selector: 'app-sales-orders-list',
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
  templateUrl: './sales-orders-list.component.html',
  styleUrls: ['./sales-orders-list.component.css']
})
export class SalesOrdersListComponent extends BaseListComponent<SalesOrderDto> implements OnInit {
  protected get moduleName(): string {
    return 'sales';
  }

  constructor(
    private salesOrdersService: SalesOrdersService,
    message: NzMessageService,
    modal: NzModalService,
    fileService: FileService,
    cdr: ChangeDetectorRef,
    authService: AuthService
  ) {
    super(salesOrdersService, message, modal, fileService, cdr, authService);
  }

  override ngOnInit(): void {
    super.ngOnInit();
  }

  deleteOrder(id: string): void {
    this.deleteItem(id, 'order');
  }

  getStatusColor(status: string | number): string {
    switch (status) {
      case 'Draft': 
      case 0: return 'default';
      case 'Confirmed': 
      case 2: return 'blue';
      case 'Shipped': 
      case 3: return 'green';
      case 'Delivered': 
      case 4: return 'cyan';
      case 'Cancelled': 
      case 5: return 'red';
      default: return 'default';
    }
  }

  // exportToXlsx and exportToPdf are inherited from BaseListComponent
}
