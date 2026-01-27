import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzCardModule } from 'ng-zorro-antd/card';
import { InventoryTransactionsService } from '../../../core/services/inventory-transactions.service';
import { InventoryTransactionDto } from '../../../types/api.types';
import { BaseListComponent } from '../../../core/base/base-list.component';
import { NzModalService } from 'ng-zorro-antd/modal';
import { FileService } from '../../../core/services/file.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-inventory-transactions-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzTableModule,
    NzButtonModule,
    NzInputModule,
    NzIconModule,
    NzTagModule,
    NzCardModule
  ],
  templateUrl: './inventory-transactions-list.component.html',
  styles: []
})
export class InventoryTransactionsListComponent extends BaseListComponent<InventoryTransactionDto> implements OnInit {
  protected get moduleName(): string {
    return 'inventory';
  }

  constructor(
    private inventoryTransactionsService: InventoryTransactionsService,
    message: NzMessageService,
    modal: NzModalService,
    fileService: FileService,
    cdr: ChangeDetectorRef,
    authService: AuthService
  ) {
    super(inventoryTransactionsService as any, message, modal, fileService, cdr, authService);
  }

  override ngOnInit(): void {
    super.ngOnInit();
  }

  getTransactionColor(type: string): string {
    switch (type) {
      case 'Purchase': return 'green';
      case 'Sale': return 'blue';
      case 'Transfer': return 'orange';
      case 'Adjustment': return 'red';
      default: return 'default';
    }
  }
}

