import { Chip } from '../ui/Chip';

const RATING_CHIPS = [
  { value: null, label: 'Any rating' },
  { value: 4, label: '4★+' },
  { value: 3, label: '3★+' },
  { value: 2, label: '2★+' },
  { value: 1, label: '1★+' },
];

const STOCK_CHIPS = [
  { value: null, label: 'All' },
  { value: 'IN_STOCK', label: 'In Stock' },
  { value: 'LOW_STOCK', label: 'Low Stock' },
  { value: 'OUT_OF_STOCK', label: 'Out of Stock' },
];

export function ProductFilters({
  categories = [],
  vendors = [],
  filters,
  onChange,
  onClear,
  hideVendor = false,
}) {
  const toggleCategory = (id) => {
    const current = filters.categories || [];
    const next = current.includes(id) ? current.filter((c) => c !== id) : [...current, id];
    onChange({ categories: next });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Filters</h2>
        <button type="button" onClick={onClear} className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline min-h-[44px] px-2">
          Clear all
        </button>
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 p-4 bg-slate-50/50 dark:bg-slate-800/30">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Category</h3>
        <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
          {categories.map((cat) => (
            <Chip
              key={cat.id}
              active={(filters.categories || []).includes(cat.id)}
              onClick={() => toggleCategory(cat.id)}
            >
              {cat.name}
            </Chip>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 p-4 bg-slate-50/50 dark:bg-slate-800/30">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Price range (₹)</h3>
        <div className="grid grid-cols-2 gap-2 mb-3">
          <input
            type="number"
            min="0"
            placeholder="Min"
            value={filters.minPrice ?? ''}
            onChange={(e) => onChange({ minPrice: e.target.value ? Number(e.target.value) : null })}
            className="rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm min-h-[44px]"
            aria-label="Minimum price"
          />
          <input
            type="number"
            min="0"
            placeholder="Max"
            value={filters.maxPrice ?? ''}
            onChange={(e) => onChange({ maxPrice: e.target.value ? Number(e.target.value) : null })}
            className="rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm min-h-[44px]"
            aria-label="Maximum price"
          />
        </div>
        <input
          type="range"
          min="0"
          max="50000"
          step="500"
          value={filters.maxPrice ?? 10000}
          onChange={(e) => onChange({ maxPrice: Number(e.target.value) })}
          className="w-full accent-indigo-600"
          aria-label="Maximum price slider"
        />
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
          Up to ₹{(filters.maxPrice ?? 10000).toLocaleString('en-IN')}
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 p-4 bg-slate-50/50 dark:bg-slate-800/30">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Rating</h3>
        <div className="flex flex-wrap gap-2">
          {RATING_CHIPS.map((o) => (
            <Chip
              key={o.label}
              active={(filters.minRating ?? null) === o.value}
              onClick={() => onChange({ minRating: o.value })}
            >
              {o.label}
            </Chip>
          ))}
        </div>
      </div>

      {!hideVendor && vendors.length > 0 && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 p-4 bg-slate-50/50 dark:bg-slate-800/30">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Vendor</h3>
          <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto">
            <Chip active={!filters.vendorId} onClick={() => onChange({ vendorId: null })}>
              All vendors
            </Chip>
            {vendors.map((v) => (
              <Chip
                key={v.id}
                active={filters.vendorId === v.id}
                onClick={() => onChange({ vendorId: v.id })}
              >
                {v.businessName}
              </Chip>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 p-4 bg-slate-50/50 dark:bg-slate-800/30">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Availability</h3>
        <div className="flex flex-wrap gap-2">
          {STOCK_CHIPS.map((o) => (
            <Chip
              key={o.label}
              active={(filters.stockStatus ?? null) === o.value}
              onClick={() => onChange({ stockStatus: o.value })}
            >
              {o.label}
            </Chip>
          ))}
        </div>
      </div>
    </div>
  );
}

export { RATING_CHIPS as RATING_OPTIONS, STOCK_CHIPS as STOCK_OPTIONS };
