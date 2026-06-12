import { EntityChangeDto } from '../../types/api.types';
import {
  normalizePropertyChanges,
  resolvePropertyChanges,
  shouldShowPropertyChangesSection,
} from './audit-property-changes.util';

describe('audit-property-changes.util', () => {
  const baseChange: EntityChangeDto = {
    id: '1',
    entityName: 'Product',
    entityId: '550e8400-e29b-41d4-a716-446655440000',
    changeType: 'Updated',
    originalValue: null,
    newValue: null,
    createdAt: '2025-01-01T00:00:00Z',
    createdBy: 'admin',
    updatedAt: '2025-01-01T00:00:00Z',
    updatedBy: null,
    propertyChanges: [],
  };

  it('normalizes PascalCase propertyChanges from API', () => {
    const rows = normalizePropertyChanges([
      {
        Id: 'p1',
        PropertyName: 'Name',
        OriginalValue: 'Old',
        NewValue: 'New',
      },
    ]);
    expect(rows.length).toBe(1);
    expect(rows[0].propertyName).toBe('Name');
    expect(rows[0].originalValue).toBe('Old');
    expect(rows[0].newValue).toBe('New');
  });

  it('derives Updated property rows from JSON snapshots when API list is empty', () => {
    const rows = resolvePropertyChanges({
      ...baseChange,
      changeType: 'Updated',
      originalValue: JSON.stringify({ name: 'Widget', price: 10, sku: 'A' }),
      newValue: JSON.stringify({ name: 'Widget Pro', price: 12, sku: 'A' }),
      propertyChanges: [],
    });
    expect(rows.map((r) => r.propertyName).sort()).toEqual(['name', 'price']);
    expect(rows.find((r) => r.propertyName === 'name')?.originalValue).toBe('Widget');
    expect(rows.find((r) => r.propertyName === 'name')?.newValue).toBe('Widget Pro');
  });

  it('derives Created rows from new snapshot only', () => {
    const rows = resolvePropertyChanges({
      ...baseChange,
      changeType: 'Created',
      originalValue: null,
      newValue: JSON.stringify({ name: 'New item', active: true }),
    });
    expect(rows.length).toBe(2);
    expect(rows.every((r) => r.originalValue === null)).toBeTrue();
  });

  it('derives Deleted rows from original snapshot only', () => {
    const rows = resolvePropertyChanges({
      ...baseChange,
      changeType: 'Deleted',
      originalValue: JSON.stringify({ name: 'Removed item' }),
      newValue: null,
    });
    expect(rows.length).toBe(1);
    expect(rows[0].newValue).toBeNull();
  });

  it('shows property section for Updated even when rows must be derived', () => {
    const change = {
      ...baseChange,
      changeType: 'Updated',
      originalValue: '{"a":1}',
      newValue: '{"a":2}',
    };
    const rows = resolvePropertyChanges(change);
    expect(shouldShowPropertyChangesSection(change, rows)).toBeTrue();
  });
});
