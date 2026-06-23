import { Link } from 'react-router-dom';
import { StarRating } from '../ui/StarRating';
import { VendorTrustBadges } from './VendorTrustBadges';

function formatMemberSince(dateString) {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-IN', { year: 'numeric', month: 'long' });
}

export function VendorReputationCard({ vendorProfile, vendorId, businessName }) {
  if (!vendorProfile && !businessName) return null;

  const rating = vendorProfile?.vendorRating != null
    ? Number(vendorProfile.vendorRating).toFixed(1)
    : '0';

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 font-semibold">Sold by</p>
          <Link to={`/vendor/${vendorId}`} className="text-lg font-bold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400">
            {businessName}
          </Link>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{rating}</p>
          <StarRating rating={rating} readonly />
        </div>
      </div>

      {vendorProfile?.badges?.length > 0 && (
        <div className="mb-4">
          <VendorTrustBadges badges={vendorProfile.badges} />
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-xl bg-white/80 dark:bg-slate-800/80 p-3 border border-slate-100 dark:border-slate-700">
          <p className="text-slate-500 dark:text-slate-400 text-xs">Reviews</p>
          <p className="font-bold text-slate-900 dark:text-white">{vendorProfile?.reviewCount ?? 0}</p>
        </div>
        <div className="rounded-xl bg-white/80 dark:bg-slate-800/80 p-3 border border-slate-100 dark:border-slate-700">
          <p className="text-slate-500 dark:text-slate-400 text-xs">Products</p>
          <p className="font-bold text-slate-900 dark:text-white">{vendorProfile?.productCount ?? 0}</p>
        </div>
        <div className="rounded-xl bg-white/80 dark:bg-slate-800/80 p-3 border border-slate-100 dark:border-slate-700">
          <p className="text-slate-500 dark:text-slate-400 text-xs">Total Sales</p>
          <p className="font-bold text-slate-900 dark:text-white">{vendorProfile?.totalSales ?? 0}</p>
        </div>
        <div className="rounded-xl bg-white/80 dark:bg-slate-800/80 p-3 border border-slate-100 dark:border-slate-700">
          <p className="text-slate-500 dark:text-slate-400 text-xs">Member Since</p>
          <p className="font-bold text-slate-900 dark:text-white text-xs">{formatMemberSince(vendorProfile?.memberSince)}</p>
        </div>
      </div>

      <Link to={`/vendor/${vendorId}`} className="inline-block mt-4 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
        View vendor storefront →
      </Link>
    </div>
  );
}
