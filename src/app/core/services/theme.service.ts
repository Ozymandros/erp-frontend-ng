import { Injectable, signal, effect, computed, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type ThemeMode = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'app-theme';
const DARK_CLASS = 'dark';

/**
 * Service to manage the application's theme state.
 * Supports light, dark, and system themes with localStorage persistence.
 * Uses Angular Signals for reactive state and efficient UI updates.
 */
@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  /** Injected platform ID to ensure SSR safety */
  private readonly platformId = inject(PLATFORM_ID);
  /** Boolean flag indicating if the service is running in a browser environment */
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  /** User's selected theme preference */
  readonly theme = signal<ThemeMode>(this.loadTheme());

  /** The actual applied theme (resolves 'system' to 'light' or 'dark') */
  readonly effectiveTheme = computed(() => {
    const mode = this.theme();
    if (mode === 'system') {
      return this.getSystemPreference();
    }
    return mode;
  });

  private mediaQuery: MediaQueryList | null = null;

  constructor() {
    // Apply theme changes to DOM
    effect(() => {
      this.applyTheme(this.effectiveTheme());
    });

    // Listen for OS theme changes (only in browser)
    if (this.isBrowser) {
      this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      this.mediaQuery.addEventListener('change', () => {
        // Re-trigger computed when in system mode
        if (this.theme() === 'system') {
          // Force reactivity update by toggling and resetting
          const current = this.theme();
          this.theme.set('light');
          this.theme.set(current);
        }
      });
    }
  }

  /** Set the theme and persist to localStorage */
  setTheme(mode: ThemeMode): void {
    this.theme.set(mode);
    if (this.isBrowser) {
      localStorage.setItem(STORAGE_KEY, mode);
    }
  }

  /** Toggle between light and dark (skips system) */
  toggleTheme(): void {
    const current = this.effectiveTheme();
    this.setTheme(current === 'dark' ? 'light' : 'dark');
  }

  private loadTheme(): ThemeMode {
    if (!this.isBrowser) {
      return 'light';
    }
    const stored = localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
    if (stored && ['light', 'dark', 'system'].includes(stored)) {
      return stored;
    }
    return 'system'; // Default to system preference
  }

  /**
   * Detects the current OS theme preference.
   * @returns 'dark' or 'light'
   * @private
   */
  private getSystemPreference(): 'light' | 'dark' {
    if (!this.isBrowser) {
      return 'light';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  /**
   * Applies the theme to the DOM by adding/removing the 'dark' class on the document element.
   * @param theme The theme to apply ('light' or 'dark')
   * @private
   */
  private applyTheme(theme: 'light' | 'dark'): void {
    if (!this.isBrowser) {
      return;
    }
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add(DARK_CLASS);
    } else {
      root.classList.remove(DARK_CLASS);
    }
  }
}
