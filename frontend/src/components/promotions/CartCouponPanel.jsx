import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Tag, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react';
import { couponService } from '../../services/couponService';
import { findBestCoupon, formatDiscountLabel } from '../../utils/promotionUtils';
import { useCouponStore } from '../../store/couponStore';
import { showToast } from '../ui/Toast';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Chip } from '../ui/Chip';

export function CartCouponPanel({ subtotal, coupons = [], loading = false }) {
  const navigate = useNavigate();
  const { appliedCoupon, setAppliedCoupon, clearCoupon, pendingCode, setPendingCode } = useCouponStore();
  const [manualCode, setManualCode] = useState(pendingCode || '');
  const [error, setError] = useState('');
  const [applying, setApplying] = useState(false);
  const [expanded, setExpanded] = useState(true);

  const best = findBestCoupon(coupons, subtotal);
  const showBestSuggestion = best && (!appliedCoupon || appliedCoupon.couponCode !== best.coupon.code);

  const applyCoupon = async (code) => {
    setApplying(true);
    setError('');
    try {
      const response = await couponService.validateCoupon({
        couponCode: code,
        orderAmount: subtotal,
      });
      if (response.valid) {
        setAppliedCoupon(response);
        setPendingCode(code);
        showToast.success(`Coupon applied! You save ₹${Number(response.discountAmount).toLocaleString('en-IN')}`);
      } else {
        setError(response.message);
        showToast.error(response.message);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to apply coupon';
      setError(msg);
      showToast.error(msg);
    } finally {
      setApplying(false);
    }
  };

  const handleApplyBest = () => {
    if (best) applyCoupon(best.coupon.code);
  };

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 min-h-[56px] hover:bg-slate-50 dark:hover:bg-slate-700/50"
      >
        <span className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
          <Tag className="w-5 h-5 text-indigo-500" />
          Coupons & Offers
        </span>
        {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-slate-100 dark:border-slate-700">
          {appliedCoupon?.couponCode && (
            <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 p-4 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-bold text-emerald-800 dark:text-emerald-200">Best Coupon Applied</p>
                <p className="text-sm text-emerald-700 dark:text-emerald-300">
                  {appliedCoupon.couponCode} — You save ₹{Number(appliedCoupon.discountAmount).toLocaleString('en-IN')}
                </p>
              </div>
              <button type="button" onClick={clearCoupon} className="text-sm text-red-600 hover:underline min-h-[44px] px-2">
                Remove
              </button>
            </div>
          )}

          {showBestSuggestion && (
            <div className="rounded-xl bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-950/40 dark:to-violet-950/40 border border-indigo-200 dark:border-indigo-800 p-4">
              <div className="flex items-start gap-2 mb-3">
                <Sparkles className="w-5 h-5 text-indigo-500 shrink-0" />
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">Best Savings Available</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Save ₹{best.discountAmount.toLocaleString('en-IN')} using <strong>{best.coupon.code}</strong>
                  </p>
                </div>
              </div>
              <Button className="w-full min-h-[44px]" onClick={handleApplyBest} disabled={applying}>
                Apply {best.coupon.code} — Save ₹{best.discountAmount.toLocaleString('en-IN')}
              </Button>
            </div>
          )}

          <div className="flex gap-2">
            <Input
              value={manualCode}
              onChange={(e) => { setManualCode(e.target.value.toUpperCase()); setError(''); }}
              placeholder="Enter coupon code"
              className="flex-1"
            />
            <Button onClick={() => applyCoupon(manualCode.trim())} disabled={applying || !manualCode.trim()} className="min-h-[44px] shrink-0">
              {applying ? '...' : 'Apply'}
            </Button>
          </div>
          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

          {!loading && coupons.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500 mb-2">Available Coupons</p>
              <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                {coupons.slice(0, 6).map((c) => (
                  <Chip
                    key={c.id}
                    active={appliedCoupon?.couponCode === c.code}
                    onClick={() => applyCoupon(c.code)}
                  >
                    {c.code} · {formatDiscountLabel(c)}
                  </Chip>
                ))}
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={() => navigate('/offers')}
            className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline min-h-[44px]"
          >
            View all offers →
          </button>
        </div>
      )}
    </div>
  );
}
