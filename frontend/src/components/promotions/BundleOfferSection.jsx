import { Link } from 'react-router-dom';
import { Package } from 'lucide-react';
import { PremiumProductCard } from '../search/PremiumProductCard';

export function BundleOfferSection({ products = [], title = 'Frequently Bought Together' }) {
  if (products.length < 2) return null;

  const bundle = products.slice(0, 3);
  const total = bundle.reduce((sum, p) => sum + Number(p.price || 0), 0);
  const bundlePrice = Math.round(total * 0.85);

  return (
    <section className="mb-10 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 p-5 md:p-6">
      <div className="flex items-center gap-2 mb-4">
        <Package className="w-5 h-5 text-indigo-500" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h2>
        <span className="ml-auto text-sm font-bold text-emerald-600 dark:text-emerald-400">Buy 3 Save 15%</span>
      </div>
      <div className="grid sm:grid-cols-3 gap-4 mb-4">
        {bundle.map((p) => (
          <PremiumProductCard key={p.id} product={p} compact />
        ))}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
        <div>
          <p className="text-sm text-slate-500">Combo price</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">
            ₹{bundlePrice.toLocaleString('en-IN')}
            <span className="text-sm font-normal text-slate-400 line-through ml-2">₹{total.toLocaleString('en-IN')}</span>
          </p>
        </div>
        <Link to="/cart" className="inline-flex items-center justify-center min-h-[44px] px-6 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700">
          Add Combo to Cart
        </Link>
      </div>
    </section>
  );
}
