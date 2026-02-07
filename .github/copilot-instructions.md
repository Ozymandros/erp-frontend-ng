# Repository Custom Instructions

## Repository Overview
ERP Aspire Frontend - Angular-based admin portal for ERP operations. Type-safe, accessible, and tested.

**Repository Type:** Angular SPA (Single Page Application)  
**Primary Language:** TypeScript  
**Framework:** Angular 21 (Standalone Components)  
**UI Library:** NG-Zorro Ant Design  
**Package Manager:** pnpm 10.28.2  
**Node Version:** 20.x

## Skills Required
- Angular (standalone components, RxJS, signals)
- TypeScript (strict mode, generics, utility types)
- NG-Zorro (Ant Design for Angular)
- Accessibility (ARIA, keyboard navigation, WCAG AA)
- Testing (Jasmine/Karma, Playwright)
- CI/CD (GitHub Actions, CodeQL, SonarQube)

## Build & Validation

### Bootstrap
**ALWAYS run first:**
```bash
pnpm install --frozen-lockfile
```
- Precondition: Node 20.x, pnpm 10.28.2
- Time: 30-60 seconds
- Never use `pnpm install` without `--frozen-lockfile` flag

### Build
**Production build:**
```bash
pnpm build
```
- Output: `dist/erp-frontend-ng/`
- Time: 2-3 minutes
- Precondition: `pnpm install --frozen-lockfile` completed

**Development build:**
```bash
pnpm build:dev
```

### Validation Sequence
Run in this order (CI simulation):
```bash
pnpm install --frozen-lockfile
pnpm exec tsc --noEmit -p tsconfig.app.json  # Type check
pnpm lint                                    # ESLint
pnpm build                                   # Build verification
```
Total time: 3-5 minutes

### Testing
**Unit tests:**
```bash
pnpm test  # Runs lint + ng test
```

## PR Review Guidance
When reviewing changes, prioritize:
1. **Correctness & safety**: logic, edge cases, error handling, and regression risk.
2. **Type safety**: no `any`, strict typing preserved, no ignored TS errors.
3. **Angular best practices**: standalone components, `async` pipe usage, proper change detection, and RxJS cleanup.
4. **Accessibility**: labels, focus states, keyboard support, and WCAG AA compliance.
5. **NG-Zorro consistency**: proper `nz-*` usage and no forbidden styling overrides.
6. **Test coverage**: new features include unit tests and relevant e2e updates.

Review output format:
- Provide a concise summary.
- List blocking issues first (must-fix) and then non-blocking suggestions.
- Reference concrete files/lines for each issue.
- Avoid restating large diffs; focus on actionable feedback.
- Coverage target: 60-80% per file
- Coverage report: `pnpm run test:coverage`

**E2E tests:**
```bash
pnpm build                                  # Required first
pnpm run test:playwright                    # Playwright E2E
```
- Uses mocked API endpoints (backend not required)
- Install browsers: `pnpm exec playwright install --with-deps`

## Project Layout

### Directory Structure
```
src/app/
├── core/              # Singleton services, guards, interceptors
│   ├── guards/       # Auth and permission guards
│   ├── interceptors/ # HTTP interceptors (Auth, Error)
│   └── services/     # API services
├── features/          # Feature modules (lazy-loaded)
│   ├── auth/         # Login, Register
│   ├── inventory/    # Products, Warehouses, Stocks
│   ├── sales/        # Customers, Orders
│   └── users/        # Users, Roles, Permissions
├── layout/           # Main layout (Header, Sidebar)
└── shared/           # Reusable components, pipes
```

### Configuration Files
- `angular.json` - Angular CLI config
- `tsconfig.app.json` - Application TypeScript config (used by build)
- `eslint.config.js` - ESLint rules
- `playwright.config.ts` - E2E test config
- `karma.conf.js` - Unit test config

## Coding Standards

### Angular Patterns
- **Always** use standalone components: `@Component({ standalone: true })`
- **Always** use `async` pipe instead of manual subscriptions
- **Never** use `any` type; use `unknown` or generics
- **Never** mutate component inputs directly
- Use `OnPush` change detection for components with >5 inputs

### TypeScript
- Strict mode enabled; never bypass TypeScript errors
- Prefer `const` and `readonly` where possible
- Use descriptive names; avoid abbreviations
- Use `trackBy` in `*ngFor` for lists >10 items

### NG-Zorro
- Import from `ng-zorro-antd` module
- Use `nz-*` prefix consistently (`nz-button`, `nz-table`)
- Never override NG-Zorro CSS with `!important` unless documented

### Accessibility (Mandatory)
- **All inputs** must have `<label>` or `aria-label`
- **All icon-only buttons** must have `aria-label`
- **Always** include visible focus indicators (`:focus-visible`)
- **Always** respect `prefers-reduced-motion` for animations
- **Never** use `<div>` for buttons; use `<button>` or `<a>`

### Testing
- **Always** add unit tests for new components/services
- **Always** mock Router, ActivatedRoute, HTTP in tests
- **Never** test private methods; test public behavior
- **Never** skip tests without TODO comment

## Never Do
- **Never** bypass linting or TypeScript errors
- **Never** add dependencies without justification
- **Never** use `any` type
- **Never** subscribe to observables without cleanup
- **Never** remove focus indicators
- **Never** skip accessibility requirements
- **Never** modify `pnpm-lock.yaml` manually
- **Never** use `setTimeout`/`setInterval` without `ngZone.runOutsideAngular()`
- **Never** create components without `standalone: true`
- **Never** use `*ngFor` without `trackBy` for lists >10 items

## CI/CD Pipeline
The CI pipeline (`.github/workflows/ci.yml`) runs:
1. Lint workflows
2. Lint & Type Check
3. Build Verification
4. Dependency Audit
5. CodeQL Analysis
6. SonarQube Scan (optional)
7. Unit Tests with Coverage
8. Playwright E2E Tests

**Never skip steps** in this order.

## Common Errors

**"Lockfile is out of sync"**
→ Run `pnpm install --frozen-lockfile`

**"Cannot find module '@angular/core'"**
→ Verify Node 20.x, then `pnpm install --frozen-lockfile`

**"TypeScript compilation failed"**
→ Run `pnpm exec tsc --noEmit -p tsconfig.app.json` for details

**"Playwright browsers not installed"**
→ Run `pnpm exec playwright install --with-deps`

## Trust Instructions
These instructions are validated and current. Only search the codebase if:
1. Instructions are incomplete for your specific task
2. Instructions are found to be incorrect
3. You need domain-specific details not covered here
