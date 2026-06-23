import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Tag, Calendar, Shield, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { couponService } from '../../services/couponService';
import { enrichCoupon, formatDiscountLabel, formatExpiry, isCouponActive } from '../../utils/promotionUtils';
import { useCouponStore } from '../../store/couponStore';
import { showToast } from '../../components/ui/Toast';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { CountdownTimer } from '../../components/promotions/CountdownTimer';

export function OfferDetailPage() {
  const { code } = useParams();
  const navigate = useNavigate();
  const setPendingCode = useCouponStore((s) => s.setPendingCode);
  const [copied, setCopied] = useState(false);
  const [applying, setApplying] = useState(false);

  const { data: couponsPage, isLoading } = useQuery({
    queryKey: ['active-coupons-detail'],
    queryFn: () => couponService.getActiveCoupons({ page: 0, size: 100 }),
  });

  const raw = (couponsPage?.content ?? []).find(
    (c) => c.code?.toUpperCase() === code?.toUpperCase()
  );
  const coupon = raw ? enrichCoupon(raw) : null;
  const active = coupon && isCouponActive(coupon);

  const copyCode = async () => {
    await navigator.clipboard.writeText(coupon.code);
    setCopied(true);
    showToast.success('Code copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApply = async () => {
    setApplying(true);
    setPendingCode(coupon.code);
    showToast.success(`${coupon.code} ready to apply at checkout`);
    navigate('/cart');
    setApplying(false);
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10 animate-pulse">
        <div className="h-8 w-48 bg-slate-200 dark:bg-slate-700 rounded mb-6" />
        <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded-2xl" />
      </div>
    );
  }

  if (!coupon) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Offer Not Found</h1>
        <p className="text-slate-600 dark:text-slate-400 mb-6">This coupon may have expired or doesn&apos;t exist.</p>
        <Link to="/offers"><Button>Browse Offers</Button></Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 md:py-10 pb-24">
      <Link to="/offers" className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline mb-6 min-h-[44px]">
        <ArrowLeft className="w-4 h-4" /> Back to offers
      </Link>

      <Card className="overflow-hidden mb-6">
        <div className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-700 p-6 md:p-8 text-white">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/20 text-xs font-bold mb-3">
            <Tag className="w-3 h-3" /> {coupon.badge}
          </span>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">{coupon.title}</h1>
          <p className="text-indigo-100 mb-4">{coupon.description}</p>
          <div className="text-4xl font-bold">{formatDiscountLabel(coupon)}</div>
          {active && coupon.validTo && (
            <div className="mt-4">
              <p className="text-xs uppercase tracking-wide text-indigo-200 mb-2">Offer ends in</p>
              <CountdownTimer endDate={new Date(coupon.validTo)} />
            </div>
          )}
        </div>

        <div className="p-6 space-y-6">
          <div>
            <p className="text-sm font-semibold text-slate-500 mb-2">Coupon Code</p>
            <div className="flex gap-2">
              <code className="flex-1 rounded-xl border-2 border-dashed border-indigo-300 dark:border-indigo-700 bg-indigo-50 dark:bg-indigo-950/40 px-4 py-3 text-xl font-bold text-indigo-700 dark:text-indigo-300 tracking-widest text-center">
                {coupon.code}
              </code>
              <button type="button" onClick={copyCode} className="min-h-[52px] min-w-[52px] rounded-xl border border-slate-200 dark:border-slate-600 flex items-center justify-center">
                {copied ? <Check className="text-emerald-500" /> : <Copy />}
              </button>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <Calendar className="w-5 h-5 text-indigo-500 shrink-0" />
              <div>
                <p className="text-xs text-slate-500">Valid Until</p>
                <p className="font-semibold text-slate-900 dark:text-white">{formatExpiry(coupon.validTo)}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <Shield className="w-5 h-5 text-indigo-500 shrink-0" />
              <div>
                <p className="text-xs text-slate-500">Category</p>
                <p className="font-semibold text-slate-900 dark:text-white">{coupon.category}</p>
              </div>
            </div>
          </div>

          {coupon.minOrderAmount && (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Minimum order: ₹{Number(coupon.minOrderAmount).toLocaleString('en-IN')}
            </p>
          )}

          <div>
            <h2 className="font-bold text-slate-900 dark:text-white mb-2">Terms & Conditions</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{coupon.terms}</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button className="flex-1 min-h-[48px]" onClick={handleApply} disabled={!active || applying}>
              {active ? 'Apply & Go to Cart' : 'Offer Expired'}
            </Button>
            <Link to="/products" className="flex-1">
              <Button variant="outline" className="w-full min-h-[48px]">Shop Eligible Products</Button>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
