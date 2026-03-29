import { Component, Input, Output, EventEmitter, forwardRef, TemplateRef, booleanAttribute } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NG_VALUE_ACCESSOR, ControlValueAccessor, ReactiveFormsModule } from '@angular/forms';
import type { NzSafeAny } from 'ng-zorro-antd/core/types';
import { NzSelectModule, NzSelectModeType } from 'ng-zorro-antd/select';

/** Row object or primitive used as both label and value when no keys match */
export type AppSelectOption = string | number | boolean | Record<string, unknown>;

@Component({
  selector: 'app-select',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NzSelectModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AppSelectComponent),
      multi: true
    }
  ],
  template: `
    <nz-select
      [(ngModel)]="value"
      [nzPlaceHolder]="placeholder"
      [nzLoading]="loading"
      [nzDisabled]="disabled"
      [nzShowSearch]="showSearch"
      [nzServerSearch]="serverSearch"
      [nzNotFoundContent]="notFoundContent"
      [nzAllowClear]="allowClear"
      [nzMode]="mode"
      [nzShowArrow]="showArrow"
      (nzOnSearch)="searchQuery.emit($event)"
      (nzOpenChange)="openChange.emit($event)"
      (ngModelChange)="onChange($event)"
      [nzOpen]="open"
      style="width: 100%"
    >
      @if (options && options.length > 0) {
        @for (opt of options; track optionTrackKey(opt)) {
          <nz-option
            [nzLabel]="optionLabel(opt)"
            [nzValue]="optionValue(opt)"
          ></nz-option>
        }
      } @else {
        <ng-content></ng-content>
      }
    </nz-select>
  `
})
export class AppSelectComponent implements ControlValueAccessor {
  @Input() placeholder = '';
  @Input({ transform: booleanAttribute }) loading = false;
  @Input({ transform: booleanAttribute }) disabled = false;
  @Input({ transform: booleanAttribute }) showSearch = true; // Default to true for better UX
  @Input({ transform: booleanAttribute }) serverSearch = false;
  @Input() notFoundContent?: string | TemplateRef<void>;
  @Input({ transform: booleanAttribute }) open = false;
  @Input({ transform: booleanAttribute }) allowClear = true; // Default to true for better UX
  @Input() mode: NzSelectModeType = 'default';
  @Input({ transform: booleanAttribute }) showArrow = true;
  
  @Input() options: AppSelectOption[] = [];
  @Input() labelKey = 'label';
  @Input() valueKey = 'value';

  @Output() searchQuery = new EventEmitter<string>();
  @Output() openChange = new EventEmitter<boolean>();

  value: unknown;
  onChange: (value: unknown) => void = () => {};
  onTouched: () => void = () => {};

  writeValue(value: unknown): void {
    this.value = value;
  }

  registerOnChange(fn: (value: unknown) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  optionLabel(opt: AppSelectOption): string | number | null {
    const raw = this.resolveOptionField(opt, this.labelKey);
    if (raw === null || raw === undefined) return null;
    if (typeof raw === 'string' || typeof raw === 'number') return raw;
    if (typeof raw === 'boolean') return raw ? 'true' : 'false';
    return String(raw);
  }

  optionValue(opt: AppSelectOption): NzSafeAny | null {
    const raw = this.resolveOptionField(opt, this.valueKey);
    return raw === undefined ? null : (raw as NzSafeAny);
  }

  optionTrackKey(opt: AppSelectOption): NzSafeAny | null {
    return this.optionValue(opt);
  }

  private resolveOptionField(opt: AppSelectOption, key: string): unknown {
    if (typeof opt === 'object' && opt !== null) {
      const row = opt as Record<string, unknown>;
      return row[key] ?? opt;
    }
    return opt;
  }
}
