import { Link } from 'react-router-dom';
import { Tag, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { formatDiscountLabel, formatExpiry } from '../../utils/promotionUtils';
import { showToast } from '../ui/Toast';
import { Button } from '../ui/Button';

export function CouponCard({ coupon, onApply, showApply = true, compact = false }) {
  const [copied, setCopied] = useState(false);

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(coupon.code);
      setCopied(true);
      showToast.success('Coupon code copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast.error('Could not copy code');
    }
  };

  if (compact) {
    return (
      <div className="rounded-2xl border border-dashed border-indigo-300 dark:border-indigo-700 bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-950/40 dark:to-violet-950/40 p-4 flex items-center justify-between gap-3">
        <div>
          <p className="font-bold text-indigo-700 dark:text-indigo-300">{coupon.code}</p>
          <p className="text-sm text-slate-600 dark:text-slate-400">{formatDiscountLabel(coupon)}</p>
        </div>
        {showApply && onApply && (
          <Button size="sm" onClick={() => onApply(coupon)}>Apply</Button>
        )}
      </div>
    );
  }

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm hover:shadow-xl transition-all duration-300">
      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-indigo-500 to-violet-600" />
      <div className="p-5 pl-6">
        <div className="flex items-start justify-between gap-3 mb-3">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300">
            <Tag className="w-3 h-3" aria-hidden="true" />
            {coupon.badge || 'Offer'}
          </span>
          <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{formatDiscountLabel(coupon)}</span>
        </div>

        <h3 className="font-bold text-slate-900 dark:text-white mb-1">{coupon.title}</h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-3">{coupon.description}</p>

        <div className="flex items-center gap-2 mb-4">
          <code className="flex-1 rounded-xl bg-slate-100 dark:bg-slate-900 px-3 py-2 font-bold text-indigo-700 dark:text-indigo-300 tracking-wider">
            {coupon.code}
          </code>
          <button
            type="button"
            onClick={copyCode}
            className="min-h-[44px] min-w-[44px] rounded-xl border border-slate-200 dark:border-slate-600 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-700"
            aria-label="Copy coupon code"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Expires {formatExpiry(coupon.validTo)}
          {coupon.minOrderAmount ? ` · Min order ₹${Number(coupon.minOrderAmount).toLocaleString('en-IN')}` : ''}
        </p>

        <div className="flex gap-2">
          <Link to={`/offers/${coupon.code}`} className="flex-1">
            <Button variant="outline" className="w-full min-h-[44px]">View Details</Button>
          </Link>
          {showApply && onApply && (
            <Button className="flex-1 min-h-[44px]" onClick={() => onApply(coupon)}>Apply</Button>
          )}
        </div>
      </div>
    </article>
  );
}
