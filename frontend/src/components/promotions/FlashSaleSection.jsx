import { Link } from 'react-router-dom';
import { Zap } from 'lucide-react';
import { getFlashSaleEnd } from '../../config/marketingCampaigns';
import { getFlashSalePricing } from '../../utils/promotionUtils';
import { CountdownTimer } from './CountdownTimer';
import { ProductGridSkeleton } from '../ui/Skeleton';

export function FlashSaleCard({ product, discountPercent = 20 }) {
  const pricing = getFlashSalePricing(product, discountPercent);
  const stock = product.availableQuantity ?? product.stock ?? 0;
  const soldPercent = Math.min(95, Math.max(5, 100 - stock * 4));

  return (
    <Link
      to={`/products/${product.id}`}
      className="block shrink-0 w-[72%] sm:w-[45%] md:w-[30%] lg:w-[22%] snap-start rounded-2xl border border-rose-200 dark:border-rose-900/50 bg-white dark:bg-slate-800 overflow-hidden shadow-lg hover:shadow-xl transition-all group"
    >
      <div className="relative aspect-square bg-slate-100 dark:bg-slate-700 overflow-hidden">
        {product.imageUrls?.[0] ? (
          <img src={product.imageUrls[0]} alt={product.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : null}
        <span className="absolute top-2 left-2 px-2 py-1 rounded-lg bg-rose-600 text-white text-xs font-bold">
          -{pricing.discountPercent}%
        </span>
        {stock <= 12 && (
          <span className="absolute top-2 right-2 px-2 py-1 rounded-lg bg-black/70 text-white text-[11px] font-semibold">
            Only {stock} left
          </span>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-slate-900 dark:text-white line-clamp-2 min-h-[2.5rem] mb-2">{product.name}</h3>
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-xl font-bold text-rose-600 dark:text-rose-400">₹{pricing.salePrice.toLocaleString('en-IN')}</span>
          <span className="text-sm text-slate-400 line-through">₹{pricing.originalPrice.toLocaleString('en-IN')}</span>
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-[11px] text-slate-500">
            <span>Selling fast</span>
            <span>{soldPercent}% claimed</span>
          </div>
          <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-rose-500 to-orange-500 transition-all duration-500" style={{ width: `${soldPercent}%` }} />
          </div>
        </div>
      </div>
    </Link>
  );
}

export function FlashSaleSection({
  products = [],
  loading = false,
  endDate: endDateProp,
  title = 'Flash Sale',
  subtitle = 'Lightning deals — limited stock',
  discountPercent = 20,
}) {
  const endDate = endDateProp ? new Date(endDateProp) : getFlashSaleEnd();

  return (
    <section className="mb-10 rounded-3xl overflow-hidden border border-rose-200/60 dark:border-rose-900/40 bg-gradient-to-br from-rose-50 via-orange-50 to-amber-50 dark:from-rose-950/30 dark:via-orange-950/20 dark:to-amber-950/20">
      <div className="p-5 md:p-6 flex flex-wrap items-center justify-between gap-4 border-b border-rose-200/50 dark:border-rose-900/30">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center text-white shadow-lg">
            <Zap className="w-6 h-6" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">{title}</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">{subtitle}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs uppercase tracking-wide text-rose-600 dark:text-rose-400 font-semibold mb-1">Ends in</p>
          <CountdownTimer endDate={endDate} compact />
        </div>
      </div>

      <div className="p-5 md:p-6">
        {loading ? (
          <ProductGridSkeleton count={4} />
        ) : products.length > 0 ? (
          <div className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-2">
            {products.map((p) => (
              <FlashSaleCard key={p.id} product={p} discountPercent={discountPercent} />
            ))}
          </div>
        ) : (
          <p className="text-center text-slate-500 py-8">Flash sale starting soon. Check back shortly!</p>
        )}
        <div className="mt-4 text-center">
          <Link to="/offers?type=flash" className="text-sm font-semibold text-rose-600 dark:text-rose-400 hover:underline">
            View all flash deals →
          </Link>
        </div>
      </div>
    </section>
  );
}
