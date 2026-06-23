export function Card({ children, className = '', hover = false }) {
  return (
    <div
      className={`rounded-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/60 dark:border-slate-600/60 shadow-glass p-6 transition-colors duration-300 ${hover ? 'hover:shadow-glass-dark hover:border-slate-300/80 dark:hover:border-slate-500/80 transition-all duration-200' : ''} ${className}`}
    >
      {children}
    </div>
  );
}
