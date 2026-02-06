# Agent Instructions

> **Note:** This file provides high-level guidance. For detailed rules, see `.cursor/rules/*.mdc` files.

## Quick Reference

**For Angular patterns:** See `@.cursor/rules/angular.mdc`  
**For testing:** See `@.cursor/rules/testing.mdc`  
**For accessibility:** See `@.cursor/rules/accessibility.mdc`  
**For guardrails:** See `@.cursor/rules/guardrails.mdc`  
**For build/validation:** See `@.cursor/rules/build.mdc`  
**For GitHub Copilot:** See `.github/copilot-instructions.md`  
**For Antigravity:** See `.agent/rules/guardrails.md`

## Core Principles

1. **Always** use standalone Angular components
2. **Always** clean up RxJS subscriptions (use `async` pipe or `takeUntilDestroyed()`)
3. **Never** use `any` type
4. **Never** bypass linting or TypeScript errors
5. **Always** include accessibility attributes (labels, ARIA, focus indicators)
6. **Always** add tests for new components/services

## Skills
- Angular (standalone components, RxJS, signals)
- TypeScript (strict typing, generics)
- NG-Zorro (Ant Design for Angular)
- Accessibility (ARIA, keyboard navigation)
- Testing (Jasmine/Karma, Playwright)
- CI/CD (GitHub Actions, pnpm)

## Build Commands
```bash
pnpm install --frozen-lockfile  # Always first
pnpm build                       # Production build
pnpm test                        # Unit tests
pnpm run test:playwright         # E2E tests (requires build first)
```

See `@.cursor/rules/build.mdc` for detailed build/validation instructions.

## Project Structure
- `src/app/core/` - Singleton services, guards, interceptors
- `src/app/features/` - Feature modules (lazy-loaded)
- `src/app/shared/` - Reusable components
- `e2e/` - Playwright E2E tests

## Critical Constraints
- **Never** bypass TypeScript strict mode errors
- **Never** add dependencies without justification
- **Never** remove accessibility requirements
- **Never** skip tests when behavior changes
- **Never** mutate component inputs directly

For comprehensive rules, reference the modular `.cursor/rules/*.mdc` files.
