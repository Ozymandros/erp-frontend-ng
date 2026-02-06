import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { WarehouseStocksService } from '../../../core/services/warehouse-stocks.service';
import { WarehouseStockDto } from '../../../types/api.types';
import { BaseListComponent } from '../../../core/base/base-list.component';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { FileService } from '../../../core/services/file.service';
import { AuthService } from '../../../core/services/auth.service';
import { AppButtonComponent, AppInputComponent } from '../../../shared/components';

@Component({
  selector: 'app-warehouse-stocks-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzTableModule,
    NzTagModule,
    NzCardModule,
    NzTypographyModule,
    AppButtonComponent,
    AppInputComponent
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
