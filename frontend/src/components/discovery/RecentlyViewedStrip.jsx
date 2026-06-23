import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { discoveryService } from '../../services/discoveryService';
import { getSessionId } from '../../utils/sessionId';
import { PremiumProductCard } from '../search/PremiumProductCard';

export function RecentlyViewedStrip({ title = 'Recently Viewed', limit = 8, viewAllLink = '/recently-viewed' }) {
  const sessionId = getSessionId();

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['recently-viewed', limit, sessionId],
    queryFn: () => discoveryService.recentlyViewed(sessionId, limit),
  });

  if (isLoading) {
    return (
      <section className="py-6">
        <div className="h-8 w-48 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-4" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-64 bg-slate-200 dark:bg-slate-700 rounded-2xl animate-pulse" />
          ))}
        </div>
      </section>
    );
  }

  if (!products.length) return null;

  return (
    <section className="py-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">{title}</h2>
        {viewAllLink && (
          <Link to={viewAllLink} className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
            View all
          </Link>
        )}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {products.map((product) => (
          <PremiumProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
