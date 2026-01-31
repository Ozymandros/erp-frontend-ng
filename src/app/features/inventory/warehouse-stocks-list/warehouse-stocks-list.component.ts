import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzCardModule } from 'ng-zorro-antd/card';
import { WarehouseStocksService } from '../../../core/services/warehouse-stocks.service';
import { WarehouseStockDto } from '../../../types/api.types';
import { BaseListComponent } from '../../../core/base/base-list.component';
import { NzModalService } from 'ng-zorro-antd/modal';
import { FileService } from '../../../core/services/file.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-warehouse-stocks-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzTableModule,
    NzButtonModule,
    NzInputModule,
    NzIconModule,
    NzSpaceModule,
    NzTagModule,
    NzCardModule
  ],
  templateUrl: './warehouse-stocks-list.component.html',
  styleUrls: ['./warehouse-stocks-list.component.css']
})
export class WarehouseStocksListComponent extends BaseListComponent<WarehouseStockDto> implements OnInit {
  protected get moduleName(): string {
    return 'inventory';
  }

  constructor(
    private warehouseStocksService: WarehouseStocksService,
    message: NzMessageService,
    modal: NzModalService,
    fileService: FileService,
    cdr: ChangeDetectorRef,
    authService: AuthService
  ) {
    super(warehouseStocksService, message, modal, fileService, cdr, authService);
  }

  override ngOnInit(): void {
    super.ngOnInit();
  }
}
