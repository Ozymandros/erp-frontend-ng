import { Component, Input, Output, EventEmitter, forwardRef, TemplateRef, booleanAttribute } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NG_VALUE_ACCESSOR, ControlValueAccessor, ReactiveFormsModule } from '@angular/forms';
import { NzSelectModule, NzSelectModeType } from 'ng-zorro-antd/select';

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
        @for (opt of options; track (opt[valueKey] || opt)) {
          <nz-option
            [nzLabel]="opt[labelKey] || opt"
            [nzValue]="opt[valueKey] || opt"
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
  
  @Input() options: any[] = [];
  @Input() labelKey = 'label';
  @Input() valueKey = 'value';

  @Output() searchQuery = new EventEmitter<string>();
  @Output() openChange = new EventEmitter<boolean>();

  value: any;
  onChange: (value: any) => void = () => {};
  onTouched: () => void = () => {};

  writeValue(value: any): void {
    this.value = value;
  }

  registerOnChange(fn: (value: any) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
