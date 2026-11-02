import { PurchaseOrderMatchStatus } from '../../types/api.types';

/** Backend PurchaseOrderMatchStatus numeric order: Unmatched=0, Partial=1, Matched=2, Overbilled=3 */
const MATCH_STATUS_BY_INDEX: PurchaseOrderMatchStatus[] = [
  PurchaseOrderMatchStatus.Unmatched,
  PurchaseOrderMatchStatus.Partial,
  PurchaseOrderMatchStatus.Matched,
  PurchaseOrderMatchStatus.Overbilled,
];

export function resolvePurchaseOrderMatchStatusLabel(
  status: PurchaseOrderMatchStatus | string | number | undefined | null,
): string {
  if (status === undefined || status === null || status === '') {
    return PurchaseOrderMatchStatus.Unmatched;
  }
  if (typeof status === 'number') {
    return MATCH_STATUS_BY_INDEX[status] ?? String(status);
  }
  if (typeof status === 'string' && /^\d+$/.test(status)) {
    return resolvePurchaseOrderMatchStatusLabel(Number.parseInt(status, 10));
  }
  return String(status);
}

export function getPurchaseOrderMatchStatusColor(
  status: PurchaseOrderMatchStatus | string | number | undefined | null,
): string {
  switch (resolvePurchaseOrderMatchStatusLabel(status)) {
    case PurchaseOrderMatchStatus.Matched:
      return 'green';
    case PurchaseOrderMatchStatus.Partial:
      return 'orange';
    case PurchaseOrderMatchStatus.Overbilled:
      return 'red';
    case PurchaseOrderMatchStatus.Unmatched:
    default:
      return 'default';
  }
}
