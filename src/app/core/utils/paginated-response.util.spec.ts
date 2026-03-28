import { normalizePaginatedResponse } from './paginated-response.util';

describe('normalizePaginatedResponse', () => {
  it('maps camelCase items and total', () => {
    const r = normalizePaginatedResponse<{ id: string }>({
      items: [{ id: '1' }],
      total: 42,
    });
    expect(r.items.length).toBe(1);
    expect(r.total).toBe(42);
  });

  it('maps PascalCase Items and TotalCount', () => {
    const r = normalizePaginatedResponse<{ id: string }>({
      Items: [{ id: 'a' }],
      TotalCount: 7,
    } as unknown);
    expect(r.items.length).toBe(1);
    expect(r.total).toBe(7);
  });

  it('unwraps nested data object', () => {
    const r = normalizePaginatedResponse<{ x: number }>({
      data: { Items: [{ x: 1 }], TotalCount: 3 },
    } as unknown);
    expect(r.items.length).toBe(1);
    expect(r.total).toBe(3);
  });

  it('handles raw array', () => {
    const r = normalizePaginatedResponse<number>([1, 2, 3]);
    expect(r.items).toEqual([1, 2, 3]);
    expect(r.total).toBe(3);
  });
});
