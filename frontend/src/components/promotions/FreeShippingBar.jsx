import { Truck } from 'lucide-react';
import { getFreeShippingProgress } from '../../utils/promotionUtils';

export function FreeShippingBar({ subtotal, className = '' }) {
  const { remaining, progress, eligible, threshold } = getFreeShippingProgress(subtotal);

  return (
    <div className={`rounded-2xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/80 dark:bg-emerald-950/30 p-4 ${className}`}>
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
          <Truck className="w-5 h-5" aria-hidden="true" />
        </div>
        <div>
          {eligible ? (
            <p className="font-semibold text-emerald-800 dark:text-emerald-200">🎉 Free Shipping Eligible!</p>
          ) : (
            <p className="font-semibold text-emerald-800 dark:text-emerald-200">
              Spend ₹{remaining.toLocaleString('en-IN')} more for free delivery
            </p>
          )}
          <p className="text-xs text-emerald-700/80 dark:text-emerald-300/80 mt-0.5">
            Free shipping on orders above ₹{threshold.toLocaleString('en-IN')}
          </p>
        </div>
      </div>
      <div className="h-2.5 rounded-full bg-emerald-200/60 dark:bg-emerald-900/40 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
          style={{ width: `${progress}%` }}
          role="progressbar"
          aria-valuenow={Math.round(progress)}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
}
