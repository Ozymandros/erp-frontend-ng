# Paginated list API contract (canonical)

**All** gateway and microservice endpoints that return a paged list **must** use **one JSON shape** and **camelCase** property names (never PascalCase in the wire format).

This matches the frontend type `PaginatedResponse<T>` in `src/app/types/api.types.ts` and what list screens consume.

## Required JSON shape

```json
{
  "items": [],
  "page": 1,
  "pageSize": 10,
  "total": 123,
  "totalPages": 13,
  "hasPreviousPage": false,
  "hasNextPage": true
}
```

| Field | Type | Notes |
|-------|------|--------|
| `items` | array | Page of entities |
| `page` | number | Current page (1-based unless your API documents otherwise) |
| `pageSize` | number | Page size |
| `total` | number | Total rows across all pages |
| `totalPages` | number | Total number of pages |
| `hasPreviousPage` | boolean | |
| `hasNextPage` | boolean | |

## Optional wrapper

If the gateway uses `{ "success": true, "data": { ... } }`, the **inner** `data` object must still follow the table above (camelCase).

## Backend (ASP.NET)

Configure JSON serialization globally so responses use **camelCase**, e.g.:

- `PropertyNamingPolicy = JsonNamingPolicy.CamelCase` (System.Text.Json), or  
- Newtonsoft: `ContractResolver` with camelCase.

Do **not** rely on PascalCase (`Items`, `TotalCount`) in production JSON.

## Frontend

The app maps list responses to `items` + `total` for the table. Temporary compatibility for legacy PascalCase may exist in code only until all services emit the contract above; new code must follow this document.
