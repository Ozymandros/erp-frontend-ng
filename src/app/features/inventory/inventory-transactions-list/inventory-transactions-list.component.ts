import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { InventoryTransactionsService } from '../../../core/services/inventory-transactions.service';
import { InventoryTransactionDto } from '../../../types/api.types';
import { BaseListComponent } from '../../../core/base/base-list.component';
import { NzModalService } from 'ng-zorro-antd/modal';
import { FileService } from '../../../core/services/file.service';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';
import { AppButtonComponent, AppInputComponent } from '../../../shared/components';

@Component({
  selector: 'app-inventory-transactions-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    NzTableModule,
    NzInputModule,
    NzIconModule,
    NzSpaceModule,
    NzTagModule,
    NzCardModule,
    NzTypographyModule,
    AppButtonComponent,
    AppInputComponent
  ],
  templateUrl: './inventory-transactions-list.component.html',
  styleUrls: ['./inventory-transactions-list.component.css']
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
    authService: AuthService,
    public themeService: ThemeService
  ) {
    super(inventoryTransactionsService, message, modal, fileService, cdr, authService);
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
