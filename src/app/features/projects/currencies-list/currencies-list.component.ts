import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { finalize } from 'rxjs';
import { ProjectCurrenciesService } from '../../../core/services/project-currencies.service';
import { AuthService } from '../../../core/services/auth.service';
import { FileService } from '../../../core/services/file.service';
import { CurrencyDto } from '../../../types/projects.types';
import { ModulePermissions } from '../../../types/api.types';
import { AppButtonComponent } from '../../../shared/components';
import { APP_PATHS } from '../../../core/constants/routes.constants';

@Component({
  selector: 'app-currencies-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    NzTableModule,
    NzPopconfirmModule,
    NzSpaceModule,
    AppButtonComponent,
  ],
  templateUrl: './currencies-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./currencies-list.component.css'],
})
export class CurrenciesListComponent implements OnInit {
  readonly paths = APP_PATHS.PROJECTS;
  currencies: CurrencyDto[] = [];
  loading = false;
  permissions: ModulePermissions = {
    canRead: false,
    canCreate: false,
    canUpdate: false,
    canDelete: false,
    canExport: false,
    canExecute: false,
  };

  constructor(
    private readonly currenciesService: ProjectCurrenciesService,
    private readonly message: NzMessageService,
    private readonly fileService: FileService,
    private readonly authService: AuthService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.authService.getModulePermissions('projects').subscribe((p) => {
      this.permissions = p;
      this.cdr.markForCheck();
    });
    this.load();
  }

  load(): void {
    this.loading = true;
    this.currenciesService
      .list()
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: (items) => {
          this.currencies = items;
        },
        error: () => this.message.error('Failed to load currencies'),
      });
  }

  deleteCurrency(currency: CurrencyDto): void {
    this.currenciesService.delete(currency.code).subscribe({
      next: () => {
        this.message.success('Currency deleted');
        this.load();
      },
      error: () => this.message.error('Failed to delete currency'),
    });
  }

  exportToXlsx(): void {
    this.currenciesService.exportToXlsx().subscribe({
      next: (blob) => this.fileService.saveFile(blob, 'currencies.xlsx'),
      error: () => this.message.error('Export failed'),
    });
  }

  exportToPdf(): void {
    this.currenciesService.exportToPdf().subscribe({
      next: (blob) => this.fileService.saveFile(blob, 'currencies.pdf'),
      error: () => this.message.error('Export failed'),
    });
  }
}
