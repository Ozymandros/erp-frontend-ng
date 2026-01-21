# ERP Aspire Frontend (Angular)

This is the Angular implementation of the ERP Aspire Frontend, migrated from the original Vite/React codebase. It uses **Angular 17**, **NG-Zorro**, and **Playwright** for E2E testing.

## Prerequisites

- **Node.js**: v20+ (v25+ used in development)
- **pnpm**: v9+ (package manager)

## Getting Started

1.  **Install dependencies**:
    ```bash
    pnpm install
    ```

2.  **Start development server**:
    ```bash
    pnpm start
    ```
    Navigate to `http://localhost:4200`.

## Testing

### Unit Tests (Jasmine/Karma)

Run unit tests via Karma:
```bash
pnpm exec ng test
```
- **Code Coverage**:
  ```bash
  pnpm exec ng test --code-coverage --watch=false --browsers=ChromeHeadless
  ```

### E2E Tests (Playwright)

Run end-to-end tests:
```bash
# Install browsers first
pnpm exec playwright install

# Run tests
pnpm exec playwright test
```
Configuration is in `playwright.config.ts`. Backend mocking is handled via `e2e/mocks/api-mocks.ts`.

## CI/CD Service

The project uses GitHub Actions for CI/CD (`.github/workflows/ci.yml`).

### Pipeline Stages
- **Lint**: Checks GitHub workflow syntax.
- **Build**: Verifies production build (`ng build`).
- **Audit**: Checks for security vulnerabilities (`pnpm audit`).
- **CodeQL**: Static code analysis for security.
- **SonarQube**: Code quality and coverage analysis (optional).
- **Unit Tests**: Runs `ng test` and uploads coverage/results.
- **Playwright**: Runs E2E tests in headless mode.

### Dependabot
Automated dependency updates are configured in `.github/dependabot.yml` for both `npm` and `github-actions`.
