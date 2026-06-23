const STYLES = {
  urgency: 'bg-rose-500 text-white',
  trust: 'bg-amber-500 text-white',
  trend: 'bg-violet-500 text-white',
  deal: 'bg-orange-500 text-white',
  default: 'bg-indigo-500 text-white',
};

export function PromoBadge({ label, type = 'default', className = '' }) {
  if (!label) return null;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide shadow-sm ${STYLES[type] || STYLES.default} ${className}`}>
      {label}
    </span>
  );
}

export function PromoBadgeStack({ badges = [], className = '' }) {
  if (!badges.length) return null;
  return (
    <div className={`flex flex-wrap gap-1 ${className}`}>
      {badges.map((b) => (
        <PromoBadge key={b.label} label={b.label} type={b.type} />
      ))}
    </div>
  );
}
