# Duplicate Code & Cleanup Report

This document summarizes duplicate-code findings and applied fixes.

**Note:** API types live in a single file: `src/app/types/api.types.ts`. The previous duplicate at `src/app/core/types/api.types.ts` was removed; all imports from core now use `../../types/api.types`.

## Applied Fixes (this session)

### 1. Unused imports in list components
- **Removed** `OnInit` and `finalize` from:
  - `users-list.component.ts`
  - `products-list.component.ts`
  - `customers-list.component.ts`
  - `roles-list.component.ts`
  - `permissions-list.component.ts`
  - `warehouses-list.component.ts`
- **Reason:** `BaseListComponent` already implements `OnInit`; `finalize` is used in the base class, not in these children.

### 2. Unused imports in CustomersService
- **Removed** `PaginatedResponse` and `SearchParams` from `customers.service.ts`.
- **Reason:** Only `BaseApiService` uses them; the concrete service does not reference them.

### 3. Users list pagination
- **Updated** `users-list.component.html`: `(nzPageIndexChange)="loadUsers()"` and `(nzPageSizeChange)="loadUsers()"` → `onPageChange($event)` and `onPageSizeChange($event)`.
- **Removed** unused `loadUsers()` from `users-list.component.ts`.
- **Reason:** Aligns with other list components and correctly passes page/size to the base class.

---

## Findings (no code change / future refactors)

### 1. Two `Permission` types
- **`app/types/api.types.ts`:** `Permission` extends `IAuditableDto<string>` (full API DTO: id, module, action, description, createdAt, etc.).
- **`app/core/constants/permissions.ts`:** `Permission` has `id`, `module`, `action`, `description?` (minimal shape for route/permission config).
- **Usage:** API and features use `api.types.Permission`; route config and guards use `permissions.ts` (RoutePermission, PERMISSION_MODULES, etc.).
- **Suggestion:** Consider renaming the one in `permissions.ts` to e.g. `PermissionConfig` or `UiPermission` to avoid confusion. Optional.

### 2. Routes in two files
- **`core/constants/routes.constants.ts`:** `APP_ROUTES` (path segments) and `APP_PATHS` (full paths).
- **`core/config/routes.config.ts`:** `ROUTE_PERMISSIONS`, `NAV_ITEMS_CONFIG`, uses `APP_ROUTES`/`APP_PATHS`.
- **Conclusion:** Not duplicate; config builds on constants. Structure is fine.

### 3. List component templates
- List views (users, products, customers, roles, etc.) share the same structure: header with export/create, search, `nz-table` with pagination and actions.
- **Current approach:** Each list has its own template and columns; `BaseListComponent` centralizes data loading, search, pagination, delete, export.
- **Future option:** A generic list wrapper (e.g. configurable columns and actions) could reduce template duplication; would require a larger refactor.

### 4. Service spec files
- Specs for `UsersService`, `ProductsService`, `CustomersService`, `PurchaseOrdersService`, etc. repeat the same pattern: `apiClientSpy`, `TestBed`, “should be created”, “should fetch list”, “should export XLSX/PDF”.
- **Suggestion:** A shared test helper (e.g. `createBaseApiServiceSpec(ServiceClass, endpoint, mockItem)`) could reduce duplication. Optional.

---

## Summary

- **Fixed:** Unused imports in 6 list components and in `CustomersService`, users-list pagination and dead `loadUsers()`.
- **Documented:** Two `Permission` types, route file roles, list template pattern, and repeated service spec pattern for future refactors.
