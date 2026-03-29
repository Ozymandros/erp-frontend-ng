# 📊 Test Coverage Guide

Maintaining high test coverage is essential for the stability of the ERP Aspire portal. We use **Karma-Coverage** (Istanbul) for unit tests. For E2E, Playwright does not provide a `--coverage` CLI flag; this repo uses **Chromium V8 coverage** plus **monocart-reporter** (see `e2e/fixtures/` and `playwright.config.ts`).

## 📈 Generating Coverage Reports

### Unit Tests (Karma)

To run unit tests and generate a coverage report:

```bash
pnpm run test:coverage
```

Or with explicit flags:

```bash
ng test --code-coverage && node scripts/check-coverage-warning.js
```

The report will be generated in the `coverage/` directory. You can view it by opening `coverage/index.html` in your browser.

### E2E Tests (Playwright)
To run E2E tests with V8 coverage (Chromium only; requires a production build so `dist/temp-ng-project/browser` exists for the static server):

```bash
pnpm build
pnpm run test:coverage:playwright
```

Reports are written under `playwright-report/` (for example `playwright-report/code-coverage/` and `playwright-report/monocart-report.html`). View the combined report with `pnpm exec monocart show-report playwright-report/monocart-report.html` when needed.

## 🎯 Coverage Goals and Enforcement

- **Sonar target**: 80% for statements, lines, branches, and functions. Sonar quality gate requires at least 80% coverage.
- **Current enforcement**: Karma thresholds in `karma.conf.js` are set to **80% statements, 80% lines, 60% branches, and 80% functions**. These were raised after the Dark Mode implementation which introduced highly-tested reactive logic.
- **Coverage warning**: After tests, `scripts/check-coverage-warning.js` runs and prints a reminder when any metric is below 80% (Sonar target). It does not fail the build.
- **Critical Services/Guards**: Aim for 100% where possible.
- **Core Feature Components**: Aim for ≥ 80%.

## 🔍 How to Improve Coverage

1.  **Identify Gaps**: Open `coverage/index.html` and look for files with low percentages.
2.  **Mock Dependencies**: Use `SpyObj` or mock services to isolate the component/service under test.
3.  **Test Edge Cases**: Ensure you test both success and error paths (e.g., API failures).
4.  **Avoid Logic in Templates**: Keep logic in `.ts` files to make it easily testable.

## 🤖 CI Integration

The CI pipeline (`.github/workflows/ci.yml`) runs unit tests with coverage (`ng test --code-coverage && node scripts/check-coverage-warning.js`). If coverage drops below the Karma thresholds in `karma.conf.js`, the build fails. Coverage is uploaded as an artifact and optionally to Codecov when `CODECOV_TOKEN` is set. Sonar reads `coverage/lcov.info`; raise Karma thresholds to 80% once coverage reaches that level to align with Sonar.
