import { STOCK_STATUS_MAP, getStockStatus } from '../../utils/stockStatus';

export function StockBadge({ available, stockStatus, lowStockThreshold, className = '' }) {
  const status = getStockStatus(available, stockStatus, lowStockThreshold);

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${status.className} ${className}`}
    >
      {status.label}
    </span>
  );
}

export { STOCK_STATUS_MAP };
