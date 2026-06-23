import { Chip } from '../ui/Chip';

export function SortChips({ options, value, onChange }) {
  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1" role="tablist" aria-label="Sort products">
      {options.map((opt) => (
        <Chip
          key={opt.value || 'default'}
          active={(value || options[0]?.value) === opt.value}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </Chip>
      ))}
    </div>
  );
}

export const DISCOVERY_SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'best_selling', label: 'Popular' },
  { value: 'rating', label: 'Best Rated' },
  { value: 'most_reviewed', label: 'Most Reviewed' },
  { value: 'most_wishlisted', label: 'Most Wishlisted' },
  { value: 'price_asc', label: 'Price ↑' },
  { value: 'price_desc', label: 'Price ↓' },
];
