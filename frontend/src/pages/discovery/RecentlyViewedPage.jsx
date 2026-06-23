import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { discoveryService } from '../../services/discoveryService';
import { getSessionId } from '../../utils/sessionId';
import { PremiumProductCard } from '../../components/search/PremiumProductCard';
import { Input } from '../../components/ui/Input';

export function RecentlyViewedPage() {
  const sessionId = getSessionId();
  const [search, setSearch] = useState('');

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['recently-viewed-page', sessionId],
    queryFn: () => discoveryService.recentlyViewed(sessionId, 50),
  });

  const filtered = products.filter((p) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return p.name?.toLowerCase().includes(q) || p.vendorName?.toLowerCase().includes(q);
  });

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 animate-pulse">
        <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded w-64 mb-6" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-72 bg-slate-200 dark:bg-slate-700 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 pb-24 md:pb-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Recently Viewed</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Pick up where you left off — up to 50 products, newest first.
        </p>
      </div>

      {products.length > 0 && (
        <div className="mb-6 max-w-md">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search recently viewed..."
          />
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="text-center py-20 rounded-2xl border border-dashed border-slate-300 dark:border-slate-600">
          <div className="text-6xl mb-4">👀</div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">
            {products.length === 0 ? 'No recently viewed products' : 'No matches found'}
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Browse products and they will appear here automatically.
          </p>
          <Link to="/products" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filtered.map((product) => (
            <PremiumProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
