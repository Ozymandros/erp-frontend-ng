# Project Instructions

## Project Description
ERP Aspire Frontend (Angular)

## Skills
- Angular (standalone components, RxJS, NgRx if applicable)
- TypeScript (strict typing, generics, utility types)
- NG-Zorro (Ant Design for Angular) components and theming
- Accessibility (ARIA, keyboard navigation, focus management)
- Testing (Jest/Karma, testing-library, mocking services)
- CI/CD (GitHub Actions, pnpm, CodeQL, SonarQube)
- Styling (SCSS, CSS variables, responsive layout)
- API integration (OpenAPI, REST clients)

## Tech Stack
- Angular (standalone components)
- TypeScript (strict)
- NG-Zorro (Ant Design for Angular)
- SCSS (CSS variables, theming)
- pnpm
- GitHub Actions (CI), CodeQL, SonarQube

## Key Principles
- Keep components small; extract logic to services/helpers.
- Prefer RxJS operators; always clean up subscriptions.
- Avoid `any`; use typed interfaces/generics.
- Accessibility is mandatory (labels, ARIA, focus-visible).
- Prefer explicit transitions over `transition: all`.

## Coding Conventions
- Descriptive naming; avoid abbreviations.
- `const`/`readonly` by default.
- `trackBy` for `*ngFor`/`@for`.
- Scoped styles; avoid `!important` unless overriding third‑party styles.

## Testing
- Add unit tests for new components/services.
- Test public behavior, not internals.
- Mock Router/ActivatedRoute/HTTP in tests.
- Include error and edge cases.

## Performance
- Use `OnPush` for heavy components.
- Prefer `async` pipe to manual subscriptions.
- Defer expensive computations where possible.

## Build & Run
1. Install: `pnpm install --frozen-lockfile`
2. Test: `pnpm test`
3. Lint: `pnpm lint` (if configured)
4. Build: `pnpm build` (if configured)
