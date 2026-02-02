import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';
import { SalesOrdersService } from '../../../core/services/sales-orders.service';
import { SalesOrderDto } from '../../../types/api.types';
import { BaseApiService } from '../../../core/base/base-api.service';
import { BaseListComponent } from '../../../core/base/base-list.component';
import { NzModalService } from 'ng-zorro-antd/modal';
import { FileService } from '../../../core/services/file.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-sales-orders-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    NzTableModule,
    NzButtonModule,
    NzInputModule,
    NzIconModule,
    NzSpaceModule,
    NzTagModule,
    NzPopconfirmModule,
    NzCardModule,
    NzTooltipModule
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
    super(salesOrdersService as BaseApiService<SalesOrderDto>, message, modal, fileService, cdr, authService);
  }

  override ngOnInit(): void {
    super.ngOnInit();
  }

  deleteOrder(id: string): void {
    this.service.delete(id).subscribe({
      next: () => {
        this.message.success('Order cancelled successfully');
        this.loadData();
      },
      error: () => {
        this.message.error('Failed to cancel order');
      }
    });
  }

  getStatusColor(status: number | string): string {
    switch (status) {
      case 'Draft': 
      case 0: return 'default';
      case 'Pending':
      case 1: return 'orange';
      case 'Confirmed':
      case 2: return 'blue';
      case 'Shipped':
      case 3: return 'cyan';
      case 'Delivered':
      case 4: return 'green';
      case 'Cancelled':
      case 5: return 'red';
      default: return 'default';
    }
  }
}
