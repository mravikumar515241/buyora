import { Link } from 'react-router-dom';
import { Ticket, ArrowRight } from 'lucide-react';
import { CouponCard } from './CouponCard';
import { ProductGridSkeleton } from '../ui/Skeleton';

export function CouponsOffersSection({
  coupons = [],
  loading = false,
  onApply,
  title = 'Coupons & Offers',
  subtitle = 'Save more with exclusive codes',
  limit = 3,
}) {
  return (
    <section className="mb-10">
      <div className="flex items-end justify-between gap-4 mb-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Ticket className="w-6 h-6 text-indigo-500" />
            {title}
          </h2>
          {subtitle && <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{subtitle}</p>}
        </div>
        <Link to="/offers" className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline shrink-0">
          View all <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 rounded-2xl bg-slate-200 dark:bg-slate-700 animate-pulse" />
          ))}
        </div>
      ) : coupons.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {coupons.slice(0, limit).map((c) => (
            <CouponCard key={c.id} coupon={c} onApply={onApply} showApply={!!onApply} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-600 p-8 text-center">
          <p className="text-slate-600 dark:text-slate-400">New offers coming soon!</p>
          <Link to="/products" className="text-indigo-600 font-semibold hover:underline mt-2 inline-block">Browse Products</Link>
        </div>
      )}
    </section>
  );
}
