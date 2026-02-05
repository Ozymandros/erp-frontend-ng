# Quality Guardrails

> Workspace rules for [Google Antigravity](https://antigravity.google/docs/rules-workflows). Non-negotiable constraints for AI-assisted changes.

## Non-Negotiable Constraints

### Code Quality
**Never do:**
- Never bypass linting errors (fix or document exception)
- Never bypass TypeScript strict mode errors (use proper types)
- Never add `@ts-ignore` without justification comment
- Never use `// eslint-disable` without specific rule name and reason
- Never suppress accessibility warnings

### Dependencies
**When adding a dependency:**
- Justify why existing dependencies cannot solve the problem
- Check for security vulnerabilities: `pnpm audit`
- Verify compatibility with Angular 21 and Node 20
- Never add duplicate functionality (check existing packages first)

### API Changes
**When modifying public APIs:**
- Update TypeScript interfaces/types immediately
- Update unit tests for changed behavior
- Update API documentation if applicable
- Never break backward compatibility without migration guide

### Testing
**When behavior changes:**
- Update corresponding unit tests
- Add tests for new error paths
- Verify E2E tests still pass (if applicable)
- Never skip tests with `xit()` without TODO comment

### Accessibility
**Never suppress:**
- Never remove `aria-label` attributes
- Never remove focus indicators
- Never use `<div>` for interactive elements
- Never skip heading levels (h1 → h3 without h2)

## Safety Rules

### Breaking Changes
**When introducing breaking changes:**
- Document migration steps in PR description
- Provide deprecation warnings if possible
- Update version numbers if semantic versioning applies
- Never break existing functionality without notice

### UI Semantics
**When modifying UI:**
- Preserve existing ARIA attributes
- Maintain keyboard navigation patterns
- Keep focus management consistent
- Never remove accessibility features

### Performance
**When optimizing:**
- Measure before and after (use Angular DevTools)
- Prefer `OnPush` change detection over manual optimization
- Use `async` pipe instead of manual subscriptions
- Never optimize prematurely (measure first)

## Quality Bars

### Code Review Checklist
Before submitting changes:
- [ ] TypeScript compilation succeeds (`pnpm exec tsc --noEmit`)
- [ ] Linting passes (`pnpm lint`)
- [ ] Unit tests pass (`pnpm test`)
- [ ] Build succeeds (`pnpm build`)
- [ ] No `any` types introduced
- [ ] Accessibility requirements met
- [ ] Tests updated for behavior changes

### Pre-commit Validation
**Always run:**
```bash
pnpm install --frozen-lockfile
pnpm exec tsc --noEmit -p tsconfig.app.json
pnpm lint
pnpm build
```

If any step fails, fix before committing.

## Error Handling
**When encountering errors:**
- Document error message and context
- Check Node/pnpm versions first (Node 20.x, pnpm 10.28.1)
- Verify `--frozen-lockfile` flag is used
- Reference README.md and `.github/copilot-instructions.md` for build commands and common errors
- Never bypass errors without understanding root cause
