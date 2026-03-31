# CRM module — detailed implementation plan

This document expands the high-level CRM integration plan with file-level scope, API contracts, routing, UI behavior, testing, and phased exit criteria. It is the canonical planning artifact for the Angular app; backend truth lives in `erp-backend` (see references below).

---

## 1. References (read before coding)


| Resource           | Path                                                                               |
| ------------------ | ---------------------------------------------------------------------------------- |
| Gateway CRM routes | `erp-backend/src/ErpApiGateway/ocelot.json` — upstream `/crm/api/crm/{everything}` |
| Service overview   | `erp-backend/docs/microservices/CRM.md`                                            |
| Controllers        | `erp-backend/src/MyApp.Crm/MyApp.Crm.API/Controllers/*.cs`                         |
| DTOs               | `erp-backend/src/MyApp.Crm/MyApp.Crm.Application.Contracts/DTOs/*.cs`              |
| OpenAPI (if used)  | Gateway: `/crm/openapi/v1.json` (per ocelot)                                       |


Frontend patterns to mirror:

- Routes: `[src/app/app.routes.ts](../src/app/app.routes.ts)`
- Route constants: `[src/app/core/constants/routes.constants.ts](../src/app/core/constants/routes.constants.ts)`
- Nav + route permissions: `[src/app/core/config/routes.config.ts](../src/app/core/config/routes.config.ts)`
- List + pagination: `[src/app/core/base/base-list.component.ts](../src/app/core/base/base-list.component.ts)`
- HTTP: `[src/app/core/api/http-client.service.ts](../src/app/core/api/http-client.service.ts)`, `[src/app/core/base/base-api.service.ts](../src/app/core/base/base-api.service.ts)`
- Example feature: `[src/app/features/sales/customers-list/](../src/app/features/sales/customers-list/)`

---

## 2. Base URL and environment

- **Relative paths** in code follow existing style: e.g. `SALES_SERVICE_BASE = '/sales/api/sales'`.
- **CRM base:** `CRM_SERVICE_BASE = '/crm/api/crm'` (matches gateway upstream before `/crm/api/crm/leads` → downstream `/api/crm/leads`).
- `[environment.ts](../src/environments/environment.ts)`: confirm `apiBaseUrl` is the gateway root (same as today). **No new variable** unless a deployment uses a different host for CRM only (document in README if added).

Full URL resolution: `getFullUrl` in `ApiClientService` = `environment.apiBaseUrl + CRM_SERVICE_BASE + '/leads'`.

---

## 3. Permissions (backend vs frontend)

Backend uses `[HasPermission("CRM", "Read|Create|Update|Delete")]` on controllers.

Frontend must align:

1. `**permissionGuard` `route.data`:** Same pattern as `[app.routes.ts](../src/app/app.routes.ts)` (e.g. `module` + `action`). Add `PERMISSION_MODULES.CRM` in `[permissions.ts](../src/app/core/constants/permissions.ts)` as `CRM` (string must match backend `HasPermission` module name).
2. `**route.data` values:** Use `module: 'CRM'` and `action: 'read' | 'create' | ...` — **verify** against `/permissions/check` and JWT permission seed (case sensitivity). If the backend stores `"CRM"` and the check is case-sensitive, use exact match.
3. `**BaseListComponent.getModulePermissions(moduleName)`:** Each CRM list component returns a string (e.g. `'crm'` or `'CRM'`) — must match how user permissions are stored in `user.permissions[].module`. **Action:** grep `erp-backend` auth seed / permission definitions for CRM module string before implementation.

---

## 4. API endpoint matrix (gateway-relative)

Base: `CRM_SERVICE_BASE = '/crm/api/crm'`.

### 4.1 Leads (`/leads`)


| Method | Path                     | Permission | Request body                                                                      | Response                                    |
| ------ | ------------------------ | ---------- | --------------------------------------------------------------------------------- | ------------------------------------------- |
| GET    | `.../leads`              | Read       | Query: `QuerySpec` (page, pageSize, filters, search — see `BindFiltersFromQuery`) | `PaginatedResponse<LeadDto>` or `LeadDto[]` |
| GET    | `.../leads/{id}`         | Read       | —                                                                                 | `LeadDto`                                   |
| POST   | `.../leads`              | Create     | `CreateLeadDto`                                                                   | `LeadDto` (201)                             |
| PUT    | `.../leads/{id}`         | Update     | `UpdateLeadDto`                                                                   | `LeadDto`                                   |
| POST   | `.../leads/{id}/qualify` | Update     | `QualifyLeadDto` `{ customerId }`                                                 | 204                                         |
| DELETE | `.../leads/{id}`         | Delete     | —                                                                                 | 204                                         |


**LeadDto (TypeScript)** — mirror C#:

- `id: string` (Guid)
- `title`, `source?`, `contactName?`, `contactEmail?`, `contactPhone?`, `customerId?`, `status`, `ownerUsername`, `createdAt`, `updatedAt?`

**No export endpoints** — do not call `exportToXlsx` / `exportToPdf` from `BaseApiService` for CRM leads.

### 4.2 Opportunities (`/opportunities`)


| Method | Path                                    | Permission | Notes                                                                                            |
| ------ | --------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------ |
| GET    | `.../opportunities/forecast`            | Read       | Query: `ownerUsername?`, `fromExpectedCloseDate?`, `toExpectedCloseDate?` → `ForecastSummaryDto` |
| GET    | `.../opportunities`                     | Read       | Paginated list                                                                                   |
| GET    | `.../opportunities/{id}`                | Read       | Detail                                                                                           |
| POST   | `.../opportunities`                     | Create     | `CreateOpportunityDto`                                                                           |
| PUT    | `.../opportunities/{id}/forecast`       | Update     | `UpdateOpportunityForecastDto`                                                                   |
| POST   | `.../opportunities/{id}/move-stage`     | Update     | `MoveOpportunityStageDto`                                                                        |
| POST   | `.../opportunities/{id}/mark-won`       | Update     | `MarkOpportunityWonRequest` (see below)                                                          |
| POST   | `.../opportunities/{id}/mark-lost`      | Update     | `MarkOpportunityLostDto`                                                                         |
| POST   | `.../opportunities/{id}/lines`          | Create     | `CreateOpportunityLineDto`                                                                       |
| PUT    | `.../opportunities/{id}/lines/{lineId}` | Update     | `UpdateOpportunityLineDto`                                                                       |
| DELETE | `.../opportunities/{id}/lines/{lineId}` | Update     | 204                                                                                              |


**MarkOpportunityWonRequest** (nested):

- `note?`, `convertToQuote: boolean`, `quote?`: `{ validityDays, lines: CreateUpdateSalesOrderLineDto[], orderDate? }`
- Reuse existing types from `[api.types.ts](../src/app/types/api.types.ts)` for `CreateUpdateSalesOrderLineDto` and align field names with JSON camelCase from ASP.NET.

### 4.3 Activities (`/activities`)


| Method | Path                           | Permission |
| ------ | ------------------------------ | ---------- |
| GET    | `.../activities`               | Read       |
| GET    | `.../activities/{id}`          | Read       |
| POST   | `.../activities`               | Create     |
| POST   | `.../activities/{id}/complete` | Update     |


### 4.4 Accounts (`/accounts`)


| Method | Path                      | Permission |
| ------ | ------------------------- | ---------- |
| GET    | `.../accounts`            | Read       |
| GET    | `.../accounts/{id}`       | Read       |
| PUT    | `.../accounts/{id}/owner` | Update     |


No POST create in API — accounts are system/synced; UI is **read-heavy**, owner change only.

### 4.5 Contacts (`/contacts` + nested)


| Method | Path                                                        | Permission                          |
| ------ | ----------------------------------------------------------- | ----------------------------------- |
| GET    | `.../contacts`                                              | Read (query paginated)              |
| GET    | `.../contacts/{id}`                                         | Read                                |
| GET    | `.../accounts/{accountId}/contacts`                         | Read (absolute route on controller) |
| POST   | `.../contacts`                                              | Create                              |
| PUT    | `.../contacts/{id}`                                         | Update                              |
| POST   | `.../accounts/{accountId}/contacts/{contactId}/set-primary` | Update                              |
| DELETE | `.../contacts/{id}`                                         | Delete                              |


**Note:** `GET contacts` without query returns empty array in backend — list must always send query params for pagination/search when implementing list.

---

## 5. Pagination and list loading

- **Shared shape:** `[PaginatedResponse<T>](../src/app/types/api.types.ts)` — `items`, `page`, `pageSize`, `total`, etc.
- `BaseListComponent.loadData()` sends `page`, `pageSize`, `SearchTerm` (capital S). CRM backend uses `QuerySpec`; confirm `BindFiltersFromQuery` expects PascalCase query keys matching `HttpParams` from Angular. If CRM fails in QA, add a thin adapter in the CRM service `getAll` or override `loadData` in CRM list components only.
- **Do not** add export buttons for CRM resources unless backend adds endpoints.

---

## 6. Files to create (new)

### 6.1 Documentation


| File                            | Purpose                                                    |
| ------------------------------- | ---------------------------------------------------------- |
| `docs/crm-backend-reference.md` | Short API summary + link to `erp-backend` docs + this plan |


### 6.2 Types


| File                         | Contents                                                                                                                                                                       |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `src/app/types/crm.types.ts` | All CRM DTOs/interfaces; string unions or `as const` for `LeadStatus`, `OpportunityStage`, `ActivityType`, `ActivityStatus` (values from domain or documented allowed strings) |


Optional: barrel `src/app/types/index.ts` re-export only if project already uses one.

### 6.3 Constants


| File                                         | Change                                                                      |
| -------------------------------------------- | --------------------------------------------------------------------------- |
| `src/app/core/api/endpoints.constants.ts`    | Add `CRM_ENDPOINTS` object with all paths from section 4                    |
| `src/app/core/constants/routes.constants.ts` | Add `CRM: { LEADS, LEAD_DETAIL, OPPORTUNITIES, ... }` and `APP_PATHS.CRM.`* |
| `src/app/core/constants/permissions.ts`      | Add `PERMISSION_MODULES.CRM`                                                |


### 6.4 Services (one file per aggregate, or split if >300 lines)


| File                                                 | Responsibility                                                                        |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `src/app/core/services/crm-leads.service.ts`         | CRUD + `qualify(id, dto)`                                                             |
| `src/app/core/services/crm-opportunities.service.ts` | CRUD + forecast + moveStage + markWon + markLost + line CRUD + `getForecastSummary()` |
| `src/app/core/services/crm-activities.service.ts`    | List/get/create + `complete(id, dto)`                                                 |
| `src/app/core/services/crm-accounts.service.ts`      | List/get + `updateOwner` — **do not** extend `exportToXlsx` usage                     |
| `src/app/core/services/crm-contacts.service.ts`      | List/get/create/update/deactivate + `listByAccount` + `setPrimary`                    |


**Pattern:** `BaseApiService` for leads only if `getEndpoint()` + standard CRUD matches; **qualify** is a separate `post`. Opportunities **cannot** extend `BaseApiService` alone — use a facade class or `Injectable` with `ApiClientService` only.

### 6.5 Feature components (standalone, each folder: `*.component.ts`)

Minimum set:


| Route segment                           | Components             | Notes                                                                             |
| --------------------------------------- | ---------------------- | --------------------------------------------------------------------------------- |
| `crm/leads`                             | `leads-list`           | Extends `BaseListComponent<LeadDto>`, no export                                   |
| `crm/leads/new`                         | `lead-detail`          | Create mode                                                                       |
| `crm/leads/:id`                         | `lead-detail`          | Edit + Qualify button → modal → `CustomersService` or customer picker + `qualify` |
| `crm/opportunities`                     | `opportunities-list`   | Table + link to detail                                                            |
| `crm/opportunities/:id`                 | `opportunity-detail`   | Forecast, stage, lines table, actions Won/Lost, modal for quote conversion        |
| `crm/opportunities/forecast` (optional) | `opportunity-forecast` | Or embed forecast in list — **decide in Phase 2**                                 |
| `crm/activities`                        | `activities-list`      |                                                                                   |
| `crm/activities/:id`                    | `activity-detail`      | View + Complete                                                                   |
| `crm/activities/new`                    | `activity-detail`      | Create                                                                            |
| `crm/accounts`                          | `accounts-list`        |                                                                                   |
| `crm/accounts/:id`                      | `account-detail`       | Owner edit + contacts list / link                                                 |
| `crm/contacts`                          | `contacts-list`        |                                                                                   |
| `crm/contacts/:id`                      | `contact-detail`       | Edit + deactivate                                                                 |


Each folder: `.html`, `.css` or `.scss`, `.spec.ts` (see section 9).

### 6.6 Shared CRM-only (optional)


| File                                                       | When                                                        |
| ---------------------------------------------------------- | ----------------------------------------------------------- |
| `src/app/features/crm/components/opportunity-lines-table/` | If lines UI duplicated                                      |
| `src/app/features/crm/components/customer-picker-modal/`   | If qualify + won-quote both need customer/product selection |


Prefer **inline** in first iteration; extract when second use appears.

---

## 7. Files to modify (existing)


| File                                         | Modification                                                            |
| -------------------------------------------- | ----------------------------------------------------------------------- |
| `src/app/app.routes.ts`                      | Register all CRM `loadComponent` routes with `permissionGuard` + `data` |
| `src/app/core/config/routes.config.ts`       | `NAV_ITEMS_CONFIG` CRM group; `ROUTE_PERMISSIONS` entries for each path |
| `src/app/core/constants/routes.constants.ts` | CRM keys (see 6.3)                                                      |


---

## 8. Routing table (concrete paths)

Use constants from `APP_ROUTES.CRM` — example shape:


| Path                        | Component                  | Guard data (example)                  |
| --------------------------- | -------------------------- | ------------------------------------- |
| `crm/leads`                 | LeadsListComponent         | `{ module: 'CRM', action: 'read' }`   |
| `crm/leads/new`             | LeadDetailComponent        | `{ module: 'CRM', action: 'create' }` |
| `crm/leads/:id`             | LeadDetailComponent        | `{ module: 'CRM', action: 'read' }`   |
| `crm/opportunities`         | OpportunitiesListComponent | read                                  |
| `crm/opportunities/:id`     | OpportunityDetailComponent | read                                  |
| `crm/activities`            | ActivitiesListComponent    | read                                  |
| `crm/activities/new`        | ActivityDetailComponent    | create                                |
| `crm/activities/:id`        | ActivityDetailComponent    | read                                  |
| `crm/accounts`              | AccountsListComponent      | read                                  |
| `crm/accounts/:id`          | AccountDetailComponent     | read                                  |
| `crm/contacts`              | ContactsListComponent      | read                                  |
| `crm/contacts` child routes | same pattern               |                                       |


**Note:** Stricter routes (create vs read) require `permissionGuard` with `create` on `/new` routes. If that causes UX issues (users with update but not create), align with existing `users`/`sales` pattern (often `read` on all and hide buttons via `permissions$`).

---

## 9. UI / UX / A11y checklist (per screen)

- **Page title:** `h1` with `nz-typography`; one `h1` per route.
- **Tables:** `nz-table` with `nzLoading`, empty template, `th` with `scope="col"` and stable `id` where list pages already do (see inventory).
- **Forms:** `nz-form`, `nz-form-label` with `nzRequired` where required; validation messages.
- **Modals:** `nz-modal` for qualify, mark-won (quote), mark-lost reason; focus return on close.
- **Icon buttons:** `aria-label` / `tooltip` on `app-button` as in sales lists.
- **Keyboard:** interactive elements are real `button`/`a` (NG-Zorro / `app-button`); no `div` click handlers for primary actions.
- **Errors:** `NzMessageService` + optional `nz-alert` on detail when load fails.

---

## 10. Testing plan

### 10.1 Services (unit)


| Service                   | Tests                                                                 |
| ------------------------- | --------------------------------------------------------------------- |
| `CrmLeadsService`         | `getAll` builds correct URL; `qualify` POST body; `update`/`delete`   |
| `CrmOpportunitiesService` | `markWon` payload includes `Quote` lines; `moveStage`; line CRUD URLs |
| `CrmActivitiesService`    | `complete`                                                            |
| `CrmAccountsService`      | `updateOwner`                                                         |
| `CrmContactsService`      | `setPrimary` URL; `deactivate` = DELETE                               |


Use `HttpClientTestingModule` + `expectOne` pattern consistent with existing tests.

### 10.2 Components


| Component                    | Minimum tests                                                     |
| ---------------------------- | ----------------------------------------------------------------- |
| `LeadsListComponent`         | Renders table; `loading` true/false; delete confirm calls service |
| `LeadDetailComponent`        | Create vs edit mode; qualify submits                              |
| `OpportunitiesListComponent` | Renders                                                           |
| `OpportunityDetailComponent` | Mark won opens modal or submits with mock                         |
| `ActivitiesListComponent`    | Renders                                                           |
| `AccountsListComponent`      | No export buttons (snapshot or query)                             |


Match or exceed coverage of `[customers-list.component.spec.ts](../src/app/features/sales/customers-list/customers-list.component.spec.ts)`.

### 10.3 Guards

No new guard if reusing `permissionGuard`. If CRM-specific guard added → unit test with `RouterTestingModule`.

---

## 11. Phased delivery and exit criteria

### Phase A — Foundation (merge-ready)

- `CRM_ENDPOINTS`, `CRM` permission module, `crm.types.ts` stub with Lead + Activity
- `app.routes.ts` + nav: CRM group with **Leads** only (link works)
- `docs/crm-backend-reference.md` + this file linked from README or `docs/README` if exists
- CI: `pnpm lint`, `pnpm typecheck`, tests green

### Phase B — Leads + Activities

- Full leads CRUD + qualify
- Activities list + create + complete
- Service + component tests for Phase B

### Phase C — Accounts + Contacts

- Accounts list/detail + owner update
- Contacts CRUD + account-scoped list + set primary + deactivate

### Phase D — Opportunities

- List + detail + forecast + move stage + lines + mark won/lost + optional quote conversion UI
- Tests for opportunity service + critical component flows

---

## 12. Risks and mitigations


| Risk                                                         | Mitigation                                                                    |
| ------------------------------------------------------------ | ----------------------------------------------------------------------------- |
| Permission module mismatch                                   | Verify seed + `/permissions/check` before merging Phase A                     |
| Query param mismatch for CRM                                 | Integration test or manual curl against gateway; adapter in service if needed |
| `MarkOpportunityWonRequest` payload size / line DTO mismatch | Align with `CreateUpdateSalesOrderLineDto` and backend JSON names             |
| Scope creep                                                  | Ship Phase A/B before C/D                                                     |


---

## 13. Questions resolved by this plan

- **Backend doc in repo:** `docs/crm-backend-reference.md` will be created in the frontend; full backend reference remains in `erp-backend`.
- **Export:** Explicitly omitted for CRM until API exists.
- **Customers for qualify:** Use existing `[CustomersService](../src/app/core/services/customers.service.ts)` + picker or `nz-select` with search.

---

## 14. Optional follow-ups (out of scope unless requested)

- Kanban view for opportunity stages
- Real-time updates (SignalR) — not in backend CRM doc
- i18n keys for all new strings

