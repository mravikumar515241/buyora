import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Clock, TrendingUp, X } from 'lucide-react';
import { discoveryService } from '../../services/discoveryService';
import { addLocalSearchHistory, clearLocalSearchHistory, getLocalSearchHistory } from '../../utils/searchHistory';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { StarRating } from '../ui/StarRating';
import { Chip } from '../ui/Chip';

export function GlobalSearchBar({ className = '', mobile = false, onNavigate }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [history, setHistory] = useState([]);
  const wrapperRef = useRef(null);
  const debouncedQuery = useDebouncedValue(query, 280);

  const { data: suggestionsData, isFetching } = useQuery({
    queryKey: ['search-suggestions', debouncedQuery],
    queryFn: () => discoveryService.suggestions(debouncedQuery),
    enabled: debouncedQuery.trim().length >= 2,
    staleTime: 30_000,
  });

  const { data: trending = [] } = useQuery({
    queryKey: ['trending-searches'],
    queryFn: () => discoveryService.trending(),
    staleTime: 5 * 60_000,
  });

  useEffect(() => {
    setHistory(getLocalSearchHistory());
  }, [open, debouncedQuery]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const suggestions = suggestionsData?.suggestions ?? [];
  const products = suggestionsData?.products ?? [];
  const hasQuery = query.trim().length >= 2;

  const goSearch = (term) => {
    const q = (term ?? query).trim();
    if (!q) return;
    addLocalSearchHistory(q);
    setOpen(false);
    setQuery('');
    onNavigate?.();
    navigate(`/search?q=${encodeURIComponent(q)}`);
  };

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          goSearch();
        }}
        className="relative flex items-center"
      >
        <Search className="absolute left-3 w-4 h-4 text-slate-400 pointer-events-none" aria-hidden="true" />
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search products, categories, vendors..."
          className={`w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white/90 dark:bg-slate-800/90 pl-10 pr-10 py-2.5 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${mobile ? 'text-base min-h-[48px]' : 'text-sm'}`}
          aria-label="Search products"
          aria-expanded={open}
          aria-controls="search-suggestions-panel"
          role="combobox"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            className="absolute right-3 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
            aria-label="Clear search"
          >
            <X className="w-4 h-4 text-slate-500" />
          </button>
        )}
      </form>

      {open && (
        <div
          id="search-suggestions-panel"
          role="listbox"
          className="absolute left-0 right-0 top-full mt-2 z-50 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden max-h-[70vh] overflow-y-auto animate-slide-up"
        >
          {hasQuery && isFetching && (
            <div className="p-4 text-sm text-slate-500 dark:text-slate-400">Searching...</div>
          )}

          {hasQuery && suggestions.length > 0 && (
            <div className="p-3 border-b border-slate-100 dark:border-slate-800">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase flex items-center gap-1">
                <Search className="w-3 h-3" /> Suggestions
              </p>
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  role="option"
                  onClick={() => goSearch(s)}
                  className="block w-full text-left px-3 py-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-sm text-slate-700 dark:text-slate-200 min-h-[44px]"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {hasQuery && products.length > 0 && (
            <div className="p-3 border-b border-slate-100 dark:border-slate-800">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase">Products</p>
              {products.map((p) => (
                <Link
                  key={p.id}
                  to={`/products/${p.id}`}
                  role="option"
                  onClick={() => { setOpen(false); onNavigate?.(); }}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 min-h-[56px]"
                >
                  <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0">
                    {p.imageUrls?.[0] ? (
                      <img src={p.imageUrls[0]} alt="" loading="lazy" className="w-full h-full object-cover" />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">{p.name}</p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                        ₹{Number(p.price).toLocaleString('en-IN')}
                      </span>
                      {(p.averageRating > 0 || p.reviewCount > 0) && (
                        <span className="flex items-center gap-1">
                          <StarRating rating={p.averageRating || 0} readonly />
                          <span className="text-[11px] text-slate-500">({p.reviewCount ?? 0})</span>
                        </span>
                      )}
                    </div>
                    {p.vendorBusinessName && (
                      <p className="text-[11px] text-slate-500 truncate">{p.vendorBusinessName}</p>
                    )}
                  </div>
                </Link>
              ))}
              <button
                type="button"
                onClick={() => goSearch()}
                className="w-full mt-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400 py-2 hover:underline min-h-[44px]"
              >
                See all results for &quot;{query.trim()}&quot;
              </button>
            </div>
          )}

          {!hasQuery && history.length > 0 && (
            <div className="p-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Recent searches
                </p>
                <button
                  type="button"
                  onClick={() => { clearLocalSearchHistory(); setHistory([]); }}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline min-h-[44px] px-2"
                >
                  Clear
                </button>
              </div>
              {history.slice(0, 10).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => goSearch(s)}
                  className="block w-full text-left px-3 py-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-sm text-slate-700 dark:text-slate-200 min-h-[44px]"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {!hasQuery && trending.length > 0 && (
            <div className="p-3">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> Trending
              </p>
              <div className="flex flex-wrap gap-2">
                {trending.slice(0, 8).map((t) => (
                  <Chip key={t} onClick={() => goSearch(t)}>{t}</Chip>
                ))}
              </div>
            </div>
          )}

          {hasQuery && !isFetching && suggestions.length === 0 && products.length === 0 && (
            <div className="p-6 text-center text-sm text-slate-500 dark:text-slate-400">
              No matches yet. Press Enter to search for &quot;{query.trim()}&quot;
            </div>
          )}
        </div>
      )}
    </div>
  );
}
