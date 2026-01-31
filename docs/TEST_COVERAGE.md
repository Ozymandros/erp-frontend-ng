# 📊 Test Coverage Guide

Maintaining high test coverage is essential for the stability of the ERP Aspire portal. We use **Karma-Coverage** (Istanbul) for unit tests and Playwright's built-in coverage tools for E2E tests.

## 📈 Generating Coverage Reports

### Unit Tests (Karma)

To run unit tests and generate a coverage report:

```bash
pnpm run test:coverage
```

Or with explicit flags:

```bash
pnpm test -- --code-coverage
```

The report will be generated in the `coverage/` directory. You can view it by opening `coverage/index.html` in your browser.

### E2E Tests (Playwright)
To run E2E tests with coverage:

```bash
pnpm run test:coverage:playwright
```

## 🎯 Coverage Goals

- **Overall Statement Coverage**: > 80%
- **Critical Services/Guards**: 100%
- **Core Feature Components**: > 70%

## 🔍 How to Improve Coverage

1.  **Identify Gaps**: Open `coverage/index.html` and look for files with low percentages.
2.  **Mock Dependencies**: Use `SpyObj` or mock services to isolate the component/service under test.
3.  **Test Edge Cases**: Ensure you test both success and error paths (e.g., API failures).
4.  **Avoid Logic in Templates**: Keep logic in `.ts` files to make it easily testable.

## 🤖 CI Integration

The CI pipeline (`.github/workflows/ci.yml`) runs unit tests with coverage (`pnpm test -- --code-coverage`), uploads the coverage artifact, and optionally uploads to Codecov when `CODECOV_TOKEN` is set. SonarQube quality gate (when configured) can also use the coverage report.
