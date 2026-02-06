# 🎨 Theming Documentation

This project uses a custom, reactive theming system based on **Angular Signals** and **Ng-Zorro CSS Variables**. It supports three modes: **Light**, **Dark**, and **System**.

## 🏗️ Architecture

The theming system is centralized in the `ThemeService`.

- **Source of Truth**: An Angular Signal (`theme`) stores the user's preference.
- **Persistence**: Preferences are saved in `localStorage` under the key `app-theme`.
- **System Synchronization**: When in "System" mode, the app listens to OS theme changes using `window.matchMedia('(prefers-color-scheme: dark)')`.
- **DOM Application**: An Angular `effect` automatically applies or removes the `.dark` class on the `document.documentElement` whenever the `effectiveTheme` changes.

### CSS Strategy

We use **Ng-Zorro's Variable Theme**.
- **Styles**: Defined in `src/styles.scss`.
- **Light Mode**: Default CSS variables in `:root`.
- **Dark Mode**: Overrides in `:root.dark`.

## 🛠️ Usage

### ThemeService

Inject the `ThemeService` to interact with the theme state.

```typescript
import { ThemeService } from './core/services/theme.service';

// ...
constructor(private themeService: ThemeService) {}

// Set theme manually
this.themeService.setTheme('dark');

// Toggle between light and dark
this.themeService.toggleTheme();

// Get reactive theme signals
const current = this.themeService.theme(); // 'light' | 'dark' | 'system'
const applied = this.themeService.effectiveTheme(); // 'light' | 'dark'
```

### ThemeToggleComponent

A standalone component used in the `HeaderComponent` to provide a user interface for theme switching. It uses a dropdown menu with icons.

## 🧪 Testing

- **Unit Tests**: Coverage is maintained above 90% for the logic in `ThemeService`.
- **Karma Thresholds**: Enforcement is configured in `karma.conf.js`.

## 🚀 SSR Considerations

The `ThemeService` is designed to be safe for Server-Side Rendering (SSR). It uses the `PLATFORM_ID` to check if it's running in the browser before accessing `window`, `document`, or `localStorage`.
