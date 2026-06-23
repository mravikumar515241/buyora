import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { discoveryService } from '../../services/discoveryService';
import { StarRating } from '../ui/StarRating';
import { Store } from 'lucide-react';

export function VendorSpotlights({ vendors: vendorsProp, title = 'Vendor Spotlights', subtitle, limit = 8 }) {
  const { data: fetchedVendors = [], isLoading } = useQuery({
    queryKey: ['discovery-vendors-spotlight'],
    queryFn: () => discoveryService.vendors(),
    enabled: !vendorsProp,
  });

  const vendors = vendorsProp ?? fetchedVendors;

  if (!vendorsProp && isLoading) {
    return (
      <section className="mb-10">
        <div className="mb-4">
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">{title}</h2>
          {subtitle && <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{subtitle}</p>}
        </div>
        <div className="flex gap-4 overflow-x-auto scrollbar-hide">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="w-64 h-36 shrink-0 rounded-2xl bg-slate-200 dark:bg-slate-700 animate-pulse" />
          ))}
        </div>
      </section>
    );
  }

  if (!vendors.length) return null;

  return (
    <section className="mb-10">
      <div className="flex items-end justify-between mb-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">{title}</h2>
          {subtitle && <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{subtitle}</p>}
        </div>
        <Link to="/search" className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">View all</Link>
      </div>
      <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 snap-x">
        {vendors.slice(0, limit).map((v) => (
          <Link
            key={v.id}
            to={`/vendor/${v.id}`}
            className="snap-start shrink-0 w-64 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 hover:shadow-lg transition-all"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center font-bold text-lg">
                {v.businessName?.charAt(0) || <Store className="w-5 h-5" />}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-slate-900 dark:text-white truncate">{v.businessName}</p>
                {v.averageRating > 0 && (
                  <StarRating rating={v.averageRating} readonly />
                )}
              </div>
            </div>
            <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">Store offers available →</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
