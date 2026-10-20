import { PurchaseOrderMatchStatus } from '../../types/api.types';

export function getPurchaseOrderMatchStatusColor(
  status: PurchaseOrderMatchStatus | string | undefined,
): string {
  switch (status) {
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
