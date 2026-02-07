import { Component, Input, computed, booleanAttribute } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzButtonModule, NzButtonType, NzButtonSize } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule, NzButtonModule, NzIconModule],
  template: `
    <button
      nz-button
      [nzType]="finalType()"
      [nzSize]="size"
      [nzLoading]="loading"
      [disabled]="disabled"
      [nzDanger]="danger"
      [nzGhost]="ghost"
      [nzBlock]="block"
      [attr.type]="btnType"
      [attr.aria-label]="ariaLabel"
    >
      @if (icon) {
        <span nz-icon [nzType]="icon"></span>
      }
      <ng-content></ng-content>
    </button>
  `,
  styles: [`
    :host {
      display: inline-block;
    }
    :host([block]) {
      display: block;
      width: 100%;
    }
  `]
})
export class AppButtonComponent {
  @Input() type: NzButtonType = 'default';
  @Input() size: NzButtonSize = 'default';
  @Input({ transform: booleanAttribute }) loading = false;
  @Input({ transform: booleanAttribute }) disabled = false;
  @Input({ transform: booleanAttribute }) danger = false;
  @Input({ transform: booleanAttribute }) ghost = false;
  @Input({ transform: booleanAttribute }) block = false;
  @Input() icon?: string;
  @Input() btnType: 'button' | 'submit' | 'reset' = 'button';
  @Input() ariaLabel?: string;

  constructor(private readonly themeService: ThemeService) {}

  isDark = computed(() => this.themeService.effectiveTheme() === 'dark');

  finalType = computed(() => {
    const isDark = this.isDark();
    if (isDark && this.type === 'primary') {
      return 'default';
    }
    return this.type;
  });
}
