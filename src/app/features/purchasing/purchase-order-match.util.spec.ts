import {
  getPurchaseOrderMatchStatusColor,
  resolvePurchaseOrderMatchStatusLabel,
} from './purchase-order-match.util';
import { PurchaseOrderMatchStatus } from '../../types/api.types';

describe('purchase-order-match.util', () => {
  it('should resolve numeric match status to labels', () => {
    expect(resolvePurchaseOrderMatchStatusLabel(0)).toBe(PurchaseOrderMatchStatus.Unmatched);
    expect(resolvePurchaseOrderMatchStatusLabel(1)).toBe(PurchaseOrderMatchStatus.Partial);
    expect(resolvePurchaseOrderMatchStatusLabel(2)).toBe(PurchaseOrderMatchStatus.Matched);
    expect(resolvePurchaseOrderMatchStatusLabel(3)).toBe(PurchaseOrderMatchStatus.Overbilled);
  });

  it('should resolve numeric strings and pass through labels', () => {
    expect(resolvePurchaseOrderMatchStatusLabel('2')).toBe(PurchaseOrderMatchStatus.Matched);
    expect(resolvePurchaseOrderMatchStatusLabel(PurchaseOrderMatchStatus.Partial)).toBe(
      PurchaseOrderMatchStatus.Partial,
    );
    expect(resolvePurchaseOrderMatchStatusLabel(undefined)).toBe(PurchaseOrderMatchStatus.Unmatched);
  });

  it('should color match statuses from numbers or labels', () => {
    expect(getPurchaseOrderMatchStatusColor(2)).toBe('green');
    expect(getPurchaseOrderMatchStatusColor(PurchaseOrderMatchStatus.Overbilled)).toBe('red');
    expect(getPurchaseOrderMatchStatusColor(1)).toBe('orange');
    expect(getPurchaseOrderMatchStatusColor(0)).toBe('default');
  });
});
