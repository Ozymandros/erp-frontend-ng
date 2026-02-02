import { Component, Input, forwardRef, booleanAttribute } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NG_VALUE_ACCESSOR, ControlValueAccessor, ReactiveFormsModule } from '@angular/forms';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';

@Component({
  selector: 'app-input-number',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NzInputNumberModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AppInputNumberComponent),
      multi: true
    }
  ],
  template: `
    <nz-input-number
      [(ngModel)]="value"
      [nzMin]="minNumber"
      [nzMax]="maxNumber"
      [nzStep]="step"
      [nzPlaceHolder]="placeholder"
      [nzDisabled]="disabled"
      (ngModelChange)="onChange($event)"
      [nzPrecision]="precision ?? null"
      style="width: 100%"
      (nzBlur)="onTouched()"
    ></nz-input-number>
  `
})
export class AppInputNumberComponent implements ControlValueAccessor {
  @Input() min?: number;
  @Input() max?: number;
  @Input() step = 1;
  @Input() placeholder = '';
  @Input({ transform: booleanAttribute }) disabled = false;
  @Input() precision?: number;

  get minNumber(): number {
    return this.min ?? -999999999;
  }

  get maxNumber(): number {
    return this.max ?? 999999999;
  }

  value: number | null = null;
  onChange: (value: number | null) => void = () => {};
  onTouched: () => void = () => {};

  writeValue(value: number | null): void {
    this.value = value;
  }

  registerOnChange(fn: (value: number | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
