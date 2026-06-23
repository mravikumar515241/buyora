/**
 * Reusable star rating: display (including fractional e.g. 4.3) or interactive selector (1-5).
 * @param {number} rating - 1-5 or fractional for display
 * @param {function} onChange - (value: number) => void for interactive mode
 * @param {boolean} readonly - display only, no click
 * @param {string} className - optional wrapper class
 */
export function StarRating({ rating = 0, onChange, readonly = false, className = '' }) {
  const value = Number(rating) || 0;
  const fullStars = Math.floor(value);
  const hasHalf = value - fullStars >= 0.25 && value - fullStars < 0.75;
  const displayOnly = readonly || !onChange;

  if (displayOnly) {
    return (
      <div className={`flex items-center gap-0.5 ${className}`} role="img" aria-label={`${value} out of 5 stars`}>
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`text-xl ${star <= fullStars || (star === fullStars + 1 && hasHalf) ? 'text-yellow-400 dark:text-yellow-300' : 'text-slate-300 dark:text-slate-600'}`}
          >
            {star <= fullStars || (star === fullStars + 1 && hasHalf) ? '★' : '☆'}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className={`text-2xl transition-colors ${
            star <= value ? 'text-yellow-400 dark:text-yellow-300' : 'text-slate-300 dark:text-slate-600'
          } hover:text-yellow-300 dark:hover:text-yellow-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-1 dark:focus:ring-offset-slate-900 rounded`}
          aria-label={`${star} star${star !== 1 ? 's' : ''}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}
