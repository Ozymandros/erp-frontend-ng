# CRM backend API reference (frontend)

Gateway base path: **`/crm/api/crm`** (Ocelot upstream → CRM service `/api/crm`).

Permissions: backend `[HasPermission("CRM", "Read|Create|Update|Delete")]`. OpenAPI (if enabled): `/crm/openapi/v1.json`.

Full backend docs: `erp-backend/docs/microservices/CRM.md`.

See also: [CRM_IMPLEMENTATION_PLAN.md](./CRM_IMPLEMENTATION_PLAN.md).

## Endpoints summary

| Area | Base suffix | Notes |
|------|-------------|--------|
| Leads | `/leads` | CRUD + `POST /{id}/qualify` |
| Opportunities | `/opportunities` | CRUD-ish + forecast, move-stage, mark-won/lost, lines |
| Activities | `/activities` | List/get/create + `POST /{id}/complete` |
| Accounts | `/accounts` | List/get + `PUT /{id}/owner` |
| Contacts | `/contacts` | CRUD + nested under accounts |

**No** `/export-xlsx` or `/export-pdf` on CRM resources.

### Paginated list responses

CRM list endpoints **must** follow the **single** canonical paginated JSON contract (camelCase): **`docs/api-contract-paginated.md`**.

The frontend may still accept legacy shapes temporarily; new and updated APIs should emit only that contract.
