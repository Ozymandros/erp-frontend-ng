import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { finalize } from 'rxjs';
import { ProjectCurrenciesService } from '../../../core/services/project-currencies.service';
import { AppButtonComponent, AppInputComponent, AppInputNumberComponent } from '../../../shared/components';
import { APP_PATHS } from '../../../core/constants/routes.constants';
import { CurrencyDto } from '../../../types/projects.types';

@Component({
  selector: 'app-currency-detail',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    NzFormModule,
    NzCardModule,
    NzTableModule,
    NzDatePickerModule,
    NzPopconfirmModule,
    AppButtonComponent,
    AppInputComponent,
    AppInputNumberComponent,
  ],
  templateUrl: './currency-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./currency-detail.component.css'],
})
export class CurrencyDetailComponent implements OnInit {
  readonly paths = APP_PATHS.PROJECTS;
  form: FormGroup;
  rateForm: FormGroup;
  code: string | null = null;
  isNewMode = false;
  loading = false;
  saving = false;
  currency: CurrencyDto | null = null;

  constructor(
    private readonly fb: FormBuilder,
    private readonly currenciesService: ProjectCurrenciesService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly message: NzMessageService,
    private readonly cdr: ChangeDetectorRef,
  ) {
    this.form = this.fb.group({
      code: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(3)]],
      description: ['', [Validators.required]],
      symbol: [''],
    });
    this.rateForm = this.fb.group({
      startingDate: [null as Date | null, Validators.required],
      rateToLocal: [1, [Validators.required, Validators.min(0.00000001)]],
    });
  }

  ngOnInit(): void {
    this.code = this.route.snapshot.paramMap.get('code');
    this.isNewMode = !this.code;
    if (!this.isNewMode && this.code) {
      this.load(this.code);
    }
  }

  load(code: string): void {
    this.loading = true;
    this.currenciesService
      .getByCode(code)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: (c) => {
          this.currency = c;
          this.form.patchValue({
            code: c.code,
            description: c.description,
            symbol: c.symbol ?? '',
          });
          this.form.get('code')?.disable();
        },
        error: () => this.message.error('Failed to load currency'),
      });
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving = true;
    const raw = this.form.getRawValue();
    const dto = {
      code: String(raw.code).toUpperCase(),
      description: raw.description as string,
      symbol: raw.symbol || null,
    };
    const req =
      this.isNewMode
        ? this.currenciesService.create(dto)
        : this.currenciesService.update(this.code!, dto);
    req
      .pipe(
        finalize(() => {
          this.saving = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: (c) => {
          this.message.success('Currency saved');
          if (this.isNewMode) {
            this.router.navigate([this.paths.CURRENCY_DETAIL(c.code)]);
          } else {
            this.currency = c;
          }
        },
        error: () => this.message.error('Failed to save currency'),
      });
  }

  addRate(): void {
    if (!this.code || this.rateForm.invalid) {
      this.rateForm.markAllAsTouched();
      return;
    }
    const v = this.rateForm.value;
    this.currenciesService
      .addExchangeRate(this.code, {
        startingDate: (v.startingDate as Date).toISOString(),
        rateToLocal: v.rateToLocal,
      })
      .subscribe({
        next: () => {
          this.message.success('Exchange rate added');
          this.rateForm.reset({ rateToLocal: 1 });
          this.load(this.code!);
        },
        error: () => this.message.error('Failed to add exchange rate'),
      });
  }

  deleteRate(rateId: string): void {
    if (!this.code) {
      return;
    }
    this.currenciesService.deleteExchangeRate(this.code, rateId).subscribe({
      next: () => {
        this.message.success('Rate deleted');
        this.load(this.code!);
      },
      error: () => this.message.error('Failed to delete rate'),
    });
  }
}
