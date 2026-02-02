import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Subject, of } from 'rxjs';
import { delay, switchMap, takeUntil } from 'rxjs/operators';
import { ProductsService } from '../../../core/services/products.service';
import { StockOperationsService } from '../../../core/services/stock-operations.service';
import { WarehousesService } from '../../../core/services/warehouses.service';
import { ProductDto, WarehouseDto } from '../../../types/api.types';
import { ThemeService } from '../../../core/services/theme.service';
import { 
  AppButtonComponent, 
  AppTextareaComponent,
  AppInputNumberComponent, 
  AppSelectComponent 
} from '../../../shared/components';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTypographyModule } from 'ng-zorro-antd/typography';

const SEARCH_MIN_LENGTH = 3;
const SEARCH_DEBOUNCE_MS = 300;
const DROPDOWN_PAGE_SIZE = 50;

@Component({
  selector: 'app-stock-operations',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzFormModule,
    NzGridModule,
    NzCardModule,
    NzTypographyModule,
    AppButtonComponent,
    AppTextareaComponent,
    AppInputNumberComponent,
    AppSelectComponent
  ],
  templateUrl: './stock-operations.component.html',
  styleUrls: ['./stock-operations.component.css'],
})
export class StockOperationsComponent implements OnInit, OnDestroy {
  adjustmentForm: FormGroup;
  products: ProductDto[] = [];
  warehouses: WarehouseDto[] = [];
  submitting = false;
  productSearching = false;
  warehouseSearching = false;

  private productSearch$ = new Subject<string>();
  private warehouseSearch$ = new Subject<string>();
  private destroy$ = new Subject<void>();
  private lastProductTerm = '';
  private lastWarehouseTerm = '';

  constructor(
    private fb: FormBuilder,
    private stockOperationsService: StockOperationsService,
    private productsService: ProductsService,
    private warehousesService: WarehousesService,
    private message: NzMessageService,
    private cdr: ChangeDetectorRef,
    public themeService: ThemeService
  ) {
    this.adjustmentForm = this.fb.group({
      productId: ['', [Validators.required]],
      warehouseId: ['', [Validators.required]],
      quantity: [0, [Validators.required]],
      reason: [''],
    });
  }

  ngOnInit(): void {
    this.productSearch$
      .pipe(
        switchMap((term) => {
          const t = (term || '').trim();
          const prev = this.lastProductTerm;
          this.lastProductTerm = t;
          const isLikelyPaste =
            t.length >= SEARCH_MIN_LENGTH &&
            (prev.length < SEARCH_MIN_LENGTH || t.length > prev.length + 1);
          return isLikelyPaste
            ? of(term)
            : of(term).pipe(delay(SEARCH_DEBOUNCE_MS));
        }),
        takeUntil(this.destroy$),
      )
      .subscribe((term) => {
        if ((term || '').trim().length < SEARCH_MIN_LENGTH) {
          this.products = [];
          return;
        }
        this.productSearching = true;
        this.productsService.getAll({ 
          page: 1, 
          pageSize: DROPDOWN_PAGE_SIZE, 
          search: term.trim() 
        }).subscribe({
          next: (res) => {
            this.products = res?.items ?? [];
            this.productSearching = false;
            this.cdr.detectChanges();
          },
          error: () => {
            this.productSearching = false;
            this.cdr.detectChanges();
          },
        });
      });

    this.warehouseSearch$
      .pipe(
        switchMap((term) => {
          const t = (term || '').trim();
          const prev = this.lastWarehouseTerm;
          this.lastWarehouseTerm = t;
          const isLikelyPaste =
            t.length >= SEARCH_MIN_LENGTH &&
            (prev.length < SEARCH_MIN_LENGTH || t.length > prev.length + 1);
          return isLikelyPaste
            ? of(term)
            : of(term).pipe(delay(SEARCH_DEBOUNCE_MS));
        }),
        takeUntil(this.destroy$),
      )
      .subscribe((term) => {
        if ((term || '').trim().length < SEARCH_MIN_LENGTH) {
          this.warehouses = [];
          return;
        }
        this.warehouseSearching = true;
        this.warehousesService.getAll({ 
          page: 1, 
          pageSize: DROPDOWN_PAGE_SIZE, 
          search: term.trim() 
        }).subscribe({
          next: (res) => {
            this.warehouses = res?.items ?? [];
            this.warehouseSearching = false;
            this.cdr.detectChanges();
          },
          error: () => {
            this.warehouseSearching = false;
            this.cdr.detectChanges();
          },
        });
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onProductSearch(value: string): void {
    this.productSearch$.next(value ?? '');
  }

  onWarehouseSearch(value: string): void {
    this.warehouseSearch$.next(value ?? '');
  }

  submitAdjustment(): void {
    if (this.adjustmentForm.valid) {
      this.submitting = true;
      const data = this.adjustmentForm.value;
      this.stockOperationsService.adjust(data).subscribe({
        next: () => {
          this.message.success(`Stock adjustment completed successfully`);
          this.adjustmentForm.reset({ quantity: 0 });
          this.submitting = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.submitting = false;
          this.cdr.detectChanges();
        },
      });
    }
  }
}
