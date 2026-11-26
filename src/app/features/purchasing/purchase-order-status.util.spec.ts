import {
  getPurchaseOrderStatusColor,
  resolvePurchaseOrderStatusLabel,
} from './purchase-order-status.util';
import { PurchaseOrderStatus } from '../../types/api.types';

describe('purchase-order-status.util', () => {
  it('should resolve numeric status to labels', () => {
    expect(resolvePurchaseOrderStatusLabel(0)).toBe(PurchaseOrderStatus.Draft);
    expect(resolvePurchaseOrderStatusLabel(2)).toBe(PurchaseOrderStatus.Approved);
    expect(resolvePurchaseOrderStatusLabel(3)).toBe(PurchaseOrderStatus.PartiallyReceived);
    expect(resolvePurchaseOrderStatusLabel(4)).toBe(PurchaseOrderStatus.Received);
    expect(resolvePurchaseOrderStatusLabel(5)).toBe(PurchaseOrderStatus.Cancelled);
  });

  it('should color statuses from numbers or labels', () => {
    expect(getPurchaseOrderStatusColor(0)).toBe('default');
    expect(getPurchaseOrderStatusColor(PurchaseOrderStatus.Approved)).toBe('blue');
    expect(getPurchaseOrderStatusColor(4)).toBe('green');
    expect(getPurchaseOrderStatusColor(5)).toBe('red');
  });
});
