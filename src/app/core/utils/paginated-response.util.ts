/**
 * Maps list API payloads to `{ items, total }` for `BaseListComponent`.
 *
 * **Canonical contract:** camelCase `PaginatedResponse` — see `docs/api-contract-paginated.md`.
 * **Legacy:** PascalCase / alternate keys are supported only until all backends emit the same camelCase JSON.
 */
export function normalizePaginatedResponse<T>(response: unknown): { items: T[]; total: number } {
  if (response == null) {
    return { items: [], total: 0 };
  }
  if (Array.isArray(response)) {
    const arr = response as T[];
    return { items: arr, total: arr.length };
  }
  if (typeof response !== 'object') {
    return { items: [], total: 0 };
  }

  let r = response as Record<string, unknown>;

  // Unwrap nested `{ data: { items, total } }` when top level has no array
  if (
    r['data'] &&
    typeof r['data'] === 'object' &&
    !Array.isArray(r['data']) &&
    !firstArrayKey(r)
  ) {
    r = r['data'] as Record<string, unknown>;
  }

  const items = extractItems<T>(r);
  const total = pickTotal(r) ?? (items.length > 0 ? items.length : 0);
  return { items, total };
}

/** Preferred: canonical `items` only. Legacy keys below are temporary. */
function firstArrayKey(r: Record<string, unknown>): boolean {
  return (
    Array.isArray(r['items']) ||
    Array.isArray(r['Items']) ||
    Array.isArray(r['results']) ||
    Array.isArray(r['Results']) ||
    Array.isArray(r['value'])
  );
}

function extractItems<T>(r: Record<string, unknown>): T[] {
  const raw =
    (Array.isArray(r['items']) ? r['items'] : null) ??
    /* legacy */ (Array.isArray(r['Items']) ? r['Items'] : null) ??
    (Array.isArray(r['results']) ? r['results'] : null) ??
    /* legacy */ (Array.isArray(r['Results']) ? r['Results'] : null) ??
    /* legacy OData */ (Array.isArray(r['value']) ? r['value'] : null) ??
    (Array.isArray(r['data']) ? r['data'] : null);
  return Array.isArray(raw) ? (raw as T[]) : [];
}

function pickTotal(r: Record<string, unknown>): number | undefined {
  const candidates = [
    r['total'],
    /* legacy */ r['Total'],
    r['totalCount'],
    /* legacy */ r['TotalCount'],
    r['totalRecords'],
    /* legacy */ r['TotalRecords'],
    r['count'],
    /* legacy */ r['Count'],
  ];
  for (const c of candidates) {
    if (typeof c === 'number' && !Number.isNaN(c)) {
      return c;
    }
  }
  return undefined;
}
