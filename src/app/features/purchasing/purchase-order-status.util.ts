import { PurchaseOrderStatus } from '../../types/api.types';

/**
 * Backend PurchaseOrderStatus numeric order used by the API:
 * Draft=0, Pending=1, Approved=2, PartiallyReceived=3, Received=4, Cancelled=5
 * (string "Ordered" is supported when returned as a label)
 */
const STATUS_BY_INDEX: PurchaseOrderStatus[] = [
  PurchaseOrderStatus.Draft,
  PurchaseOrderStatus.Pending,
  PurchaseOrderStatus.Approved,
  PurchaseOrderStatus.PartiallyReceived,
  PurchaseOrderStatus.Received,
  PurchaseOrderStatus.Cancelled,
];

export function resolvePurchaseOrderStatusLabel(
  status: PurchaseOrderStatus | string | number | undefined | null,
): string {
  if (status === undefined || status === null || status === '') {
    return 'Unknown';
  }
  if (typeof status === 'number') {
    return STATUS_BY_INDEX[status] ?? String(status);
  }
  if (typeof status === 'string' && /^\d+$/.test(status)) {
    return resolvePurchaseOrderStatusLabel(Number.parseInt(status, 10));
  }
  return String(status);
}

export function getPurchaseOrderStatusColor(
  status: PurchaseOrderStatus | string | number | undefined | null,
): string {
  switch (resolvePurchaseOrderStatusLabel(status)) {
    case PurchaseOrderStatus.Draft:
      return 'default';
    case PurchaseOrderStatus.Pending:
      return 'orange';
    case PurchaseOrderStatus.Approved:
      return 'blue';
    case PurchaseOrderStatus.Ordered:
      return 'geekblue';
    case PurchaseOrderStatus.PartiallyReceived:
      return 'cyan';
    case PurchaseOrderStatus.Received:
      return 'green';
    case PurchaseOrderStatus.Cancelled:
      return 'red';
    default:
      return 'default';
  }
}
