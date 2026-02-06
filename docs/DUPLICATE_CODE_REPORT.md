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

### 4. Dead load wrappers in list components
- **Removed** `loadSuppliers()` from `suppliers-list.component.ts` and `loadCustomers()` from `customers-list.component.ts`.
- **Reason:** Both only called `this.loadData()` and were never referenced in templates; base class already provides `loadData()` and templates use `onSearch()` / `onPageChange()` / `onPageSizeChange()`.

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

### 5. Unused endpoint constants (dead code)
- **`core/api/endpoints.constants.ts`:** The following are never referenced by any service: `USERS_ENDPOINTS.PAGINATED`, `ROLES_ENDPOINTS.PAGINATED`, `PERMISSIONS_ENDPOINTS.PAGINATED`, `INVENTORY_ENDPOINTS.PRODUCT_PAGINATED`, `INVENTORY_ENDPOINTS.WAREHOUSE_PAGINATED`, `INVENTORY_ENDPOINTS.TRANSACTION_PAGINATED`. All CRUD services use `BASE` (or equivalent) and rely on `BaseApiService.getAll()`. **Suggestion:** Remove the unused `PAGINATED` constants if the API does not require a separate paginated path, or keep for future use and add a comment.

### 6. Redundant constructor in BaseApiService subclasses
- Several services that only override `getEndpoint()` still declare an explicit constructor; some use `protected override apiClient` (unnecessary; base already has `protected apiClient`): e.g. `WarehouseStocksService`, `InventoryTransactionsService`, `SalesOrdersService`, `PurchaseOrdersService`. **Suggestion:** Omit the constructor when the subclass only implements `getEndpoint()`; drop redundant `constructor(apiClient) { super(apiClient); }` and `protected override apiClient` where they add no value.

### 7. Detail components – repeated CRUD form pattern
- **Customer, Supplier, Product, Warehouse** detail components share nearly identical structure: same fields (`entityId`, `isEditMode`, `loading`, `saving`, form group), same `ngOnInit` (read `id` from route, set `isEditMode`, call `loadEntity(id)` when editing), same load flow (`loading = true` → `service.getById(id)` → `patchValue` / error message), same save flow (validate → create/update observable → success navigate + message). **Suggestion:** Introduce a `BaseDetailComponent<T>` (or a reusable detail facade) that handles route param, isEditMode, load/save orchestration, and error toasts; subclasses supply form definition, service, and success route.

### 8. Repeated error message strings
- Many components use ad-hoc strings: `'Failed to load customer: ' + err.message`, `'Failed to load product: ' + err.message`, `'Failed to load warehouse'`, etc. **Suggestion:** Centralize in a small helper or constants (e.g. `MessageHelper.loadFailed('customer', err)`) for consistency and easier i18n later.

### 9. List page template structure (repeated HTML)
- List views share the same layout: `page-header` + `header-actions` (Export XLSX/PDF, Add), `list-search` with `onSearch()`, then `nz-table` with pagination and row actions (~60 structure matches across 21 files). **Future option:** A shared presentational component (e.g. `app-list-page` with projected header, search, table) or a single template driven by column/config could reduce duplication. Larger refactor.

---

## Summary

- **Fixed:** Unused imports in 6 list components and in `CustomersService`, users-list pagination and dead `loadUsers()`. **Also removed:** dead `loadSuppliers()` and `loadCustomers()` (they only called `loadData()` and were never used in templates).
- **Documented:** Two `Permission` types, route file roles, list template pattern, repeated service spec pattern, unused PAGINATED endpoint constants, redundant service constructors, detail component CRUD duplication, repeated error strings, and list page HTML structure for future refactors.
