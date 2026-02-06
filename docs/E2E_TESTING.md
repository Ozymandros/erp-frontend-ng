# 🧪 E2E Testing Guide

This project uses **Playwright** for End-to-End (E2E) testing. To ensure consistency and speed, we use **MockServer** (via Testcontainers) to mock backend API responses.

## 🚀 Running E2E Tests

### Installation

Before running E2E tests for the first time, you must install the Playwright browsers:

```bash
pnpm exec playwright install --with-deps
```

### Execution Commands

```bash
# Run all E2E tests (Headless)
pnpm run test:playwright

# Run a specific test file
pnpm run test:playwright e2e/auth.spec.ts

# Run tests in UI mode (Interactive)
pnpm run test:playwright -- --ui

# Debug tests
pnpm run test:playwright -- --debug
```

## 🏗️ Test Structure

- `e2e/*.spec.ts`: Test files.
- `e2e/mocks/api-mocks.ts`: Definitions for MockServer expectations.
- `e2e/mocks/fixtures.ts`: Mock data used across tests.
- `e2e/global-setup.ts`: Sets up the MockServer container.

## 🛠️ Adding New Tests

1.  **Define Mock Data**: Add your mock objects to `e2e/mocks/fixtures.ts`.
2.  **Add API Mock**: Update `e2e/mocks/api-mocks.ts` to include the new endpoint mock.
3.  **Create Spec**: Create a new `.spec.ts` file in the `e2e/` directory.

Example test:

```typescript
import { test, expect } from '@playwright/test';
import { setupMocks } from './mocks/api-mocks';

test.describe('My Feature', () => {
  test.beforeEach(async ({ page }) => {
    await setupMocks();
    await page.goto('/');
  });

  test('should do something amazing', async ({ page }) => {
    // Your test logic here
  });
});
```

## 🔍 Best Practices

- Always use `setupMocks()` in `beforeEach`.
- Use `data-testid` or unique IDs for stable selectors.
- Keep tests independent and focused.
- Avoid hardcoded wait times (`waitForTimeout`); use locator-based assertions instead.
