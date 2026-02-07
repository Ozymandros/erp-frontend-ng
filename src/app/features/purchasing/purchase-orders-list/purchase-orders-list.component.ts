import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';
import { PurchaseOrdersService } from '../../../core/services/purchase-orders.service';
import { PurchaseOrderDto } from '../../../types/api.types';
import { BaseListComponent } from '../../../core/base/base-list.component';
import { FileService } from '../../../core/services/file.service';
import { AuthService } from '../../../core/services/auth.service';
import { AppButtonComponent, AppInputComponent } from '../../../shared/components';

@Component({
  selector: 'app-purchase-orders-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
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
  templateUrl: './purchase-orders-list.component.html',
  styleUrls: ['./purchase-orders-list.component.css']
})
export class PurchaseOrdersListComponent extends BaseListComponent<PurchaseOrderDto> implements OnInit {
  protected get moduleName(): string {
    return 'purchasing';
  }

  constructor(
    private readonly purchaseOrdersService: PurchaseOrdersService,
    message: NzMessageService,
    modal: NzModalService,
    fileService: FileService,
    cdr: ChangeDetectorRef,
    authService: AuthService
  ) {
    super(purchaseOrdersService, message, modal, fileService, cdr, authService);
  }

  override ngOnInit(): void {
    super.ngOnInit();
  }

  deleteOrder(id: string): void {
    this.deleteItem(id, 'order');
  }

  getStatusColor(status: number | string): string {
    switch (status) {
      case 'Draft': 
      case 0: return 'default';
      case 'Pending':
      case 1: return 'orange';
      case 'Confirmed':
      case 2: return 'blue';
      case 'Received':
      case 3: return 'green';
      case 'Cancelled':
      case 4: return 'red';
      default: return 'default';
    }
  }
}
