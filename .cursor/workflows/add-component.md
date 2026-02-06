# Workflow: Add Component

## Description
Creates a new Angular standalone component with proper structure, tests, and accessibility.

## Steps

### Step 1: Generate Component Structure
When user requests a new component:
1. Determine component name and location (feature module or shared)
2. Use Angular CLI: `ng generate component <name> --standalone --skip-tests=false`
3. Verify `standalone: true` in component decorator
4. Add necessary imports to `imports` array

### Step 2: Implement Component Logic
1. Extract business logic to a service if component exceeds 100 lines
2. Use `input()` signals for inputs (Angular 17+)
3. Use `OnPush` change detection if component has >5 inputs
4. Reference `@.cursor/rules/angular.mdc` for patterns

### Step 3: Add Template with Accessibility
1. Include `<label>` for all form inputs
2. Add `aria-label` for icon-only buttons
3. Use semantic HTML (`<button>`, not `<div>`)
4. Reference `@.cursor/rules/accessibility.mdc` for checklist

### Step 4: Add Styles
1. Use scoped styles (component stylesheet)
2. Avoid `!important` unless overriding third-party styles
3. Use CSS variables from `@src/styles/_variables.scss`
4. Respect `prefers-reduced-motion` for animations

### Step 5: Write Tests
1. Create unit test file: `<component-name>.component.spec.ts`
2. Mock Router, ActivatedRoute, HTTP services
3. Test public behavior, not private methods
4. Include error paths and edge cases
5. Reference `@.cursor/rules/testing.mdc` for patterns

### Step 6: Validate
1. Run `pnpm exec tsc --noEmit -p tsconfig.app.json`
2. Run `pnpm lint`
3. Run `pnpm test` (verify new component tests pass)
4. Check accessibility: verify labels, ARIA, focus indicators

### Step 7: Update Documentation
1. Add component to feature module documentation (if applicable)
2. Update component index exports if in shared module
3. Add JSDoc comments for public API

## Completion Criteria
- [ ] Component uses `standalone: true`
- [ ] All inputs have labels or `aria-label`
- [ ] Unit tests pass
- [ ] TypeScript compilation succeeds
- [ ] Linting passes
- [ ] Component follows OnPush pattern if applicable

## Example
```
User: "Add a product detail component in the inventory feature"
Agent: Executes workflow steps, creates `src/app/features/inventory/product-detail/product-detail.component.ts`
```
