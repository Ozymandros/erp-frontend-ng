import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';
import { ThemeService, ThemeMode } from '../../core/services/theme.service';

/**
 * Component providing a UI toggle for switching application themes.
 * Displays a sun/moon icon and a dropdown menu for Light/Dark/System selection.
 */
@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [
    CommonModule,
    NzDropDownModule,
    NzButtonModule,
    NzIconModule,
    NzTooltipModule
  ],
  template: `
    <button
      nz-button
      nzType="text"
      nz-dropdown
      [nzDropdownMenu]="themeMenu"
      nzTrigger="click"
      nz-tooltip
      [nzTooltipTitle]="'Theme: ' + themeService.theme()"
      [attr.aria-label]="'Change theme. Current: ' + themeService.theme()"
      class="theme-toggle-btn"
    >
      @switch (themeService.effectiveTheme()) {
        @case ('dark') {
          <span nz-icon nzType="moon" nzTheme="fill" class="theme-icon"></span>
        }
        @default {
          <span nz-icon nzType="sun" nzTheme="fill" class="theme-icon"></span>
        }
      }
    </button>
    <nz-dropdown-menu #themeMenu="nzDropdownMenu">
      <ul nz-menu>
        <li 
          nz-menu-item 
          role="menuitem"
          (click)="setTheme('light')"
          (keydown.enter)="setTheme('light')"
          (keydown.space)="setTheme('light')"
          tabindex="0"
          [nzSelected]="themeService.theme() === 'light'"
        >
          <span nz-icon nzType="sun" nzTheme="outline"></span>
          <span>Light</span>
        </li>
        <li 
          nz-menu-item 
          role="menuitem"
          (click)="setTheme('dark')"
          (keydown.enter)="setTheme('dark')"
          (keydown.space)="setTheme('dark')"
          tabindex="0"
          [nzSelected]="themeService.theme() === 'dark'"
        >
          <span nz-icon nzType="moon" nzTheme="outline"></span>
          <span>Dark</span>
        </li>
        <li nz-menu-divider></li>
        <li 
          nz-menu-item 
          role="menuitem"
          (click)="setTheme('system')"
          (keydown.enter)="setTheme('system')"
          (keydown.space)="setTheme('system')"
          tabindex="0"
          [nzSelected]="themeService.theme() === 'system'"
        >
          <span nz-icon nzType="laptop" nzTheme="outline"></span>
          <span>System</span>
        </li>
      </ul>
    </nz-dropdown-menu>
  `,
  styles: [`
    .theme-toggle-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 4px 8px;
    }
    .theme-toggle-btn:hover {
      background: rgba(0, 0, 0, 0.05);
    }
    :host-context(.dark) .theme-toggle-btn:hover {
      background: rgba(255, 255, 255, 0.1);
    }
    .theme-icon {
      font-size: 18px;
    }
  `]
})
export class ThemeToggleComponent {
  readonly themeService = inject(ThemeService);

  setTheme(mode: ThemeMode): void {
    this.themeService.setTheme(mode);
  }
}
