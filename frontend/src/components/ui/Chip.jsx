export function Chip({ active, onClick, children, className = '', type = 'button' }) {
  const base = `inline-flex items-center justify-center min-h-[40px] px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 whitespace-nowrap ${className}`;
  const styles = active
    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30'
    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 hover:border-indigo-300 dark:hover:border-indigo-500';

  if (type === 'button') {
    return (
      <button type="button" onClick={onClick} className={`${base} ${styles}`} aria-pressed={active}>
        {children}
      </button>
    );
  }

  return <span className={`${base} ${styles}`}>{children}</span>;
}
