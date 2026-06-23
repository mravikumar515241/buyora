export function RatingBreakdown({ breakdown = [], totalReviews = 0 }) {
  if (!breakdown.length) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">No ratings yet.</p>
    );
  }

  return (
    <div className="space-y-3">
      {breakdown.map((item) => (
        <div key={item.stars} className="flex items-center gap-3 group">
          <div className="flex items-center gap-1 w-14 shrink-0 text-amber-500 font-medium text-sm">
            {item.stars}★
          </div>
          <div className="flex-1 h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-700 ease-out group-hover:from-amber-300 group-hover:to-amber-400"
              style={{ width: `${item.percentage ?? 0}%` }}
              role="progressbar"
              aria-valuenow={item.percentage ?? 0}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${item.stars} star ratings`}
            />
          </div>
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 w-10 text-right">
            {item.percentage ?? 0}%
          </span>
        </div>
      ))}
      {totalReviews > 0 && (
        <p className="text-xs text-slate-500 dark:text-slate-400 pt-1">
          Based on {totalReviews.toLocaleString()} verified review{totalReviews !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
}
