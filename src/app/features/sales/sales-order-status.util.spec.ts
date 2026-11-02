import {
  canCreateSalesReturn,
  getSalesOrderStatusColor,
  resolveSalesOrderStatusLabel,
} from './sales-order-status.util';
import { SalesOrderStatus } from '../../types/api.types';

describe('sales-order-status.util', () => {
  it('should resolve numeric status to backend labels', () => {
    expect(resolveSalesOrderStatusLabel(2)).toBe(SalesOrderStatus.Invoiced);
    expect(resolveSalesOrderStatusLabel(3)).toBe(SalesOrderStatus.Shipped);
  });

  it('should color Invoiced status', () => {
    expect(getSalesOrderStatusColor(SalesOrderStatus.Invoiced)).toBe('purple');
    expect(getSalesOrderStatusColor(2)).toBe('purple');
  });

  it('should allow return only for Shipped or Invoiced without existing return', () => {
    expect(canCreateSalesReturn(SalesOrderStatus.Shipped)).toBeTrue();
    expect(canCreateSalesReturn(SalesOrderStatus.Invoiced)).toBeTrue();
    expect(canCreateSalesReturn(SalesOrderStatus.Confirmed)).toBeFalse();
  });
});
