import { SalesOrderStatus } from '../../types/api.types';

/** Backend SalesOrderStatus numeric order: Draft=0, Confirmed=1, Invoiced=2, Shipped=3, Cancelled=4 */
const STATUS_BY_INDEX: SalesOrderStatus[] = [
  SalesOrderStatus.Draft,
  SalesOrderStatus.Confirmed,
  SalesOrderStatus.Invoiced,
  SalesOrderStatus.Shipped,
  SalesOrderStatus.Cancelled,
];

export function resolveSalesOrderStatusLabel(status: string | number | undefined): string {
  if (status === undefined || status === null) {
    return 'Unknown';
  }
  if (typeof status === 'string') {
    return status;
  }
  return STATUS_BY_INDEX[status] ?? String(status);
}

export function getSalesOrderStatusColor(status: string | number | undefined): string {
  const label = resolveSalesOrderStatusLabel(status);
  switch (label) {
    case SalesOrderStatus.Draft:
      return 'default';
    case SalesOrderStatus.Confirmed:
      return 'blue';
    case SalesOrderStatus.Invoiced:
      return 'purple';
    case SalesOrderStatus.Shipped:
      return 'cyan';
    case SalesOrderStatus.Cancelled:
      return 'red';
    default:
      return 'default';
  }
}

export function canCreateSalesReturn(status: string | number | undefined): boolean {
  const label = resolveSalesOrderStatusLabel(status);
  return label === SalesOrderStatus.Shipped || label === SalesOrderStatus.Invoiced;
}
