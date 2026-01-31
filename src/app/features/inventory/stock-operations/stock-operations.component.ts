import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { Subject, of } from 'rxjs';
import { delay, switchMap, takeUntil } from 'rxjs/operators';
import { ProductsService } from '../../../core/services/products.service';
import { StockOperationsService } from '../../../core/services/stock-operations.service';
import { WarehousesService } from '../../../core/services/warehouses.service';
import { ProductDto, WarehouseDto } from '../../../types/api.types';

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
    NzInputModule,
    NzButtonModule,
    NzCardModule,
    NzSelectModule,
    NzInputNumberModule,
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
  productSearchTerm = '';
  warehouseSearchTerm = '';
  notFoundProductText = 'Type at least 3 characters to search';
  notFoundWarehouseText = 'Type at least 3 characters to search';
  productDropdownOpen = false;
  warehouseDropdownOpen = false;

  @ViewChild('productSelectHost') productSelectHost?: ElementRef<HTMLElement>;
  @ViewChild('warehouseSelectHost')
  warehouseSelectHost?: ElementRef<HTMLElement>;

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
        this.productSearchTerm = term;
        if ((term || '').trim().length < SEARCH_MIN_LENGTH) {
          this.products = [];
          this.notFoundProductText = 'Type at least 3 characters to search';
          return;
        }
        this.productSearching = true;
        const params: Record<string, string | number> = {
          page: 1,
          pageSize: DROPDOWN_PAGE_SIZE,
          SearchTerm: term.trim(),
        };
        this.productsService.getAll(params).subscribe({
          next: (res) => {
            const list = res?.items ?? (Array.isArray(res) ? res : []);
            const selectedId = this.adjustmentForm.get('productId')?.value;
            if (
              selectedId &&
              !list.some((p: ProductDto) => p.id === selectedId)
            ) {
              this.productsService.getById(selectedId).subscribe({
                next: (one) => {
                  this.products = [one, ...list];
                  this.notFoundProductText =
                    this.products.length === 0
                      ? 'No results'
                      : 'Type at least 3 characters to search';
                  this.productSearching = false;
                  this.cdr.detectChanges();
                },
                error: () => {
                  this.products = list;
                  this.productSearching = false;
                  this.cdr.detectChanges();
                },
              });
            } else {
              this.products = list;
              this.notFoundProductText =
                this.products.length === 0
                  ? 'No results'
                  : 'Type at least 3 characters to search';
              this.productSearching = false;
              this.cdr.detectChanges();
            }
          },
          error: () => {
            this.message.error('Failed to load products');
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
        this.warehouseSearchTerm = term;
        if ((term || '').trim().length < SEARCH_MIN_LENGTH) {
          this.warehouses = [];
          this.notFoundWarehouseText = 'Type at least 3 characters to search';
          return;
        }
        this.warehouseSearching = true;
        const params: Record<string, string | number> = {
          page: 1,
          pageSize: DROPDOWN_PAGE_SIZE,
          SearchTerm: term.trim(),
        };
        this.warehousesService.getAll(params).subscribe({
          next: (res) => {
            const list = res?.items ?? (Array.isArray(res) ? res : []);
            const selectedId = this.adjustmentForm.get('warehouseId')?.value;
            if (
              selectedId &&
              !list.some((w: WarehouseDto) => w.id === selectedId)
            ) {
              this.warehousesService.getById(selectedId).subscribe({
                next: (one) => {
                  this.warehouses = [one, ...list];
                  this.notFoundWarehouseText =
                    this.warehouses.length === 0
                      ? 'No results'
                      : 'Type at least 3 characters to search';
                  this.warehouseSearching = false;
                  this.cdr.detectChanges();
                },
                error: () => {
                  this.warehouses = list;
                  this.warehouseSearching = false;
                  this.cdr.detectChanges();
                },
              });
            } else {
              this.warehouses = list;
              this.notFoundWarehouseText =
                this.warehouses.length === 0
                  ? 'No results'
                  : 'Type at least 3 characters to search';
              this.warehouseSearching = false;
              this.cdr.detectChanges();
            }
          },
          error: () => {
            this.message.error('Failed to load warehouses');
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

  onProductOpenChange(open: boolean): void {
    this.productDropdownOpen = open;
  }

  onWarehouseOpenChange(open: boolean): void {
    this.warehouseDropdownOpen = open;
  }

  @HostListener('document:paste', ['$event'])
  onDocumentPaste(event: ClipboardEvent): void {
    if (!event.clipboardData) return;
    const text = event.clipboardData.getData('text/plain')?.trim() ?? '';
    if (text.length < SEARCH_MIN_LENGTH) return;
    const el = document.activeElement;
    if (this.productDropdownOpen) {
      this.productSearch$.next(text);
    } else if (this.warehouseDropdownOpen) {
      this.warehouseSearch$.next(text);
    } else if (this.productSelectHost?.nativeElement?.contains(el)) {
      this.productDropdownOpen = true;
      this.productSearch$.next(text);
      this.cdr.detectChanges();
    } else if (this.warehouseSelectHost?.nativeElement?.contains(el)) {
      this.warehouseDropdownOpen = true;
      this.warehouseSearch$.next(text);
      this.cdr.detectChanges();
    }
  }

  submitAdjustment(): void {
    if (this.adjustmentForm.valid) {
      this.submitting = true;
      const data = this.adjustmentForm.value;
      // Assuming this form is specifically for 'adjust' operation
      const obs = this.stockOperationsService.adjust(data);

      obs.subscribe({
        next: () => {
          this.message.success(`Stock adjustment completed successfully`);
          this.adjustmentForm.reset({ quantity: 0 });
          this.submitting = false;
        },
        error: () => (this.submitting = false),
      });
    }
  }
}
