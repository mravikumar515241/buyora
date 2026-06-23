export const STOCK_STATUS_MAP = {
  IN_STOCK: {
    label: 'In Stock',
    className: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  },
  LOW_STOCK: {
    label: 'Low Stock',
    className: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  },
  OUT_OF_STOCK: {
    label: 'Out of Stock',
    className: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  },
  DISCONTINUED: {
    label: 'Discontinued',
    className: 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
  },
  COMING_SOON: {
    label: 'Coming Soon',
    className: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  },
  PRE_ORDER: {
    label: 'Pre-Order',
    className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  },
};

export function getStockStatus(available, stockStatus, lowStockThreshold = 10) {
  if (stockStatus && STOCK_STATUS_MAP[stockStatus]) {
    return { ...STOCK_STATUS_MAP[stockStatus], key: stockStatus };
  }
  const qty = available ?? 0;
  if (qty <= 0) return { ...STOCK_STATUS_MAP.OUT_OF_STOCK, key: 'OUT_OF_STOCK' };
  if (qty <= lowStockThreshold) return { ...STOCK_STATUS_MAP.LOW_STOCK, key: 'LOW_STOCK' };
  return { ...STOCK_STATUS_MAP.IN_STOCK, key: 'IN_STOCK' };
}

export function isPurchasable(available, stockStatus) {
  if (stockStatus === 'PRE_ORDER') return true;
  if (['OUT_OF_STOCK', 'DISCONTINUED', 'COMING_SOON'].includes(stockStatus)) return false;
  return (available ?? 0) > 0;
}

export function getAvailabilityMessage(available, stockStatus, lowStockThreshold = 10) {
  if (stockStatus === 'DISCONTINUED') return 'This product has been discontinued';
  if (stockStatus === 'COMING_SOON') return 'Coming soon — stay tuned';
  if (stockStatus === 'PRE_ORDER') return 'Available for pre-order';
  const qty = available ?? 0;
  if (qty <= 0) return 'Out of Stock';
  if (qty <= 3) return `Only ${qty} left`;
  if (qty <= lowStockThreshold) return 'Low Stock — order soon';
  if (qty <= lowStockThreshold * 2) return 'Fast selling';
  return `In Stock (${qty} available)`;
}
