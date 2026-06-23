const BADGE_STYLES = {
  'Top Seller': 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  'Highly Rated': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
  'Fast Shipping': 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  'Trusted Vendor': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300',
};

export function VendorTrustBadges({ badges = [] }) {
  if (!badges.length) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {badges.map((badge) => (
        <span
          key={badge}
          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
            BADGE_STYLES[badge] || 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
          }`}
        >
          {badge}
        </span>
      ))}
    </div>
  );
}
