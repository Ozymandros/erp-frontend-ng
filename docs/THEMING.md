# Theming Documentation

This project uses a custom, reactive theming system based on **Angular Signals** and **Ng-Zorro CSS Variables**. It supports three modes: **Light**, **Dark**, and **System**.

## Architecture

The theming system is centralized in the `ThemeService`.

- **Source of Truth**: An Angular Signal (`theme`) stores the user's preference.
- **Persistence**: Preferences are saved in `localStorage` under the key `app-theme`.
- **System Synchronization**: A `systemPref` signal tracks OS preference via `window.matchMedia('(prefers-color-scheme: dark)')` and updates on change.
- **DOM Application**: An Angular `effect` applies or removes the `dark` class on `document.documentElement` (`<html class="dark">`) when `effectiveTheme` changes.
- **FOUC prevention**: An inline script in `src/index.html` reads `app-theme` and applies the `dark` class before the app boots.

### CSS Strategy

We use **Ng-Zorro's Variable Theme**.

- **Styles**: Defined in `src/styles.scss`.
- **Light Mode**: Default CSS variables on `:root`.
- **Dark Mode**: Overrides on `html.dark` (class on `document.documentElement`).

Components should use `var(--app-*)` and `var(--ant-*)` tokens instead of hardcoded colors.

### Global CSS tokens

| Token | Purpose |
|-------|---------|
| `--app-bg-color` | Page background |
| `--app-text-color` | Primary text |
| `--app-text-secondary` | Secondary text |
| `--app-muted-text` | De-emphasized text |
| `--app-border-color` | Borders |
| `--app-card-bg` | Cards and content panels |
| `--app-header-bg` | Header background |
| `--app-hover-bg` | Hover surfaces (buttons, icon actions) |
| `--app-focus-ring` | Focus ring tint |
| `--app-success-bg`, `--app-success-border`, `--app-success-text` | Success states |
| `--app-error-bg`, `--app-error-border`, `--app-error-text` | Error states |

Ant Design tokens (`--ant-primary-color`, etc.) are also overridden in light and dark modes.

## Usage

### ThemeService

Inject the `ThemeService` to interact with the theme state.

```typescript
import { ThemeService } from './core/services/theme.service';

// Set theme manually
this.themeService.setTheme('dark');

// Toggle between light and dark (skips system)
this.themeService.toggleTheme();

// Reactive signals
const preference = this.themeService.theme(); // 'light' | 'dark' | 'system'
const applied = this.themeService.effectiveTheme(); // 'light' | 'dark'
```

### ThemeToggleComponent

A standalone component in `HeaderComponent` provides a dropdown for Light / Dark / System selection.

## Testing

- **Unit Tests**: `theme.service.spec.ts`, `theme-toggle.component.spec.ts`
- **Karma thresholds**: Configured in `karma.conf.js`

## SSR Considerations

`ThemeService` uses `PLATFORM_ID` to avoid accessing `window`, `document`, or `localStorage` on the server. The FOUC script runs only in the browser.
