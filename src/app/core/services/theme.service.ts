import { Injectable, signal, effect, computed, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type ThemeMode = 'light' | 'dark' | 'system';
export type EffectiveTheme = 'light' | 'dark';

const STORAGE_KEY = 'app-theme';
const DARK_CLASS = 'dark';
const THEME_COLOR_LIGHT = '#f0f2f5';
const THEME_COLOR_DARK = '#141414';

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

  /** OS color-scheme preference (updated via matchMedia listener) */
  private readonly systemPref = signal<EffectiveTheme>(
    this.readSystemPreference()
  );

  /** User's selected theme preference */
  readonly theme = signal<ThemeMode>(this.loadTheme());

  /** The actual applied theme (resolves 'system' to 'light' or 'dark') */
  readonly effectiveTheme = computed<EffectiveTheme>(() => {
    const mode = this.theme();
    if (mode === 'system') {
      return this.systemPref();
    }
    return mode;
  });

  constructor() {
    effect(() => {
      this.applyTheme(this.effectiveTheme());
    });

    if (this.isBrowser) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const onSystemChange = (event: MediaQueryListEvent): void => {
        this.systemPref.set(event.matches ? 'dark' : 'light');
      };
      mediaQuery.addEventListener('change', onSystemChange);
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
    return 'system';
  }

  private readSystemPreference(): EffectiveTheme {
    if (!this.isBrowser) {
      return 'light';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }

  private applyTheme(theme: EffectiveTheme): void {
    if (!this.isBrowser) {
      return;
    }
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add(DARK_CLASS);
    } else {
      root.classList.remove(DARK_CLASS);
    }
    this.updateThemeColorMeta(theme);
  }

  private updateThemeColorMeta(theme: EffectiveTheme): void {
    const meta = document.querySelector<HTMLMetaElement>(
      'meta[name="theme-color"][data-app-theme]'
    );
    if (meta) {
      meta.content =
        theme === 'dark' ? THEME_COLOR_DARK : THEME_COLOR_LIGHT;
    }
  }
}
