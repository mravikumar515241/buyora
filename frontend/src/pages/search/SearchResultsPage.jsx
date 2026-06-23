import { useMemo, useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { discoveryService } from '../../services/discoveryService';
import { categoryService } from '../../services/categoryService';
import { ProductFilters } from '../../components/search/ProductFilters';
import { ProductGrid } from '../../components/search/ProductGrid';
import { SortChips, DISCOVERY_SORT_OPTIONS } from '../../components/search/SortChips';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { addLocalSearchHistory, clearLocalSearchHistory, getLocalSearchHistory } from '../../utils/searchHistory';
import { Filter, X, SearchX } from 'lucide-react';

const PAGE_SIZE = 12;

function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
      <Button variant="secondary" disabled={page === 0} onClick={() => onPageChange(page - 1)} className="min-h-[44px]">Previous</Button>
      <span className="text-sm text-slate-600 dark:text-slate-400">Page {page + 1} of {totalPages}</span>
      <Button variant="secondary" disabled={page >= totalPages - 1} onClick={() => onPageChange(page + 1)} className="min-h-[44px]">Next</Button>
    </div>
  );
}

function parseFilters(searchParams) {
  const categories = searchParams.get('categories');
  return {
    q: searchParams.get('q') || '',
    categories: categories ? categories.split(',').map(Number).filter(Boolean) : [],
    minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : null,
    maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : null,
    minRating: searchParams.get('minRating') ? Number(searchParams.get('minRating')) : null,
    vendorId: searchParams.get('vendorId') ? Number(searchParams.get('vendorId')) : null,
    stockStatus: searchParams.get('stockStatus') || null,
    sort: searchParams.get('sort') || 'newest',
    page: searchParams.get('page') ? Number(searchParams.get('page')) : 0,
  };
}

function buildSearchParams(filters) {
  const params = new URLSearchParams();
  if (filters.q) params.set('q', filters.q);
  if (filters.categories?.length) params.set('categories', filters.categories.join(','));
  if (filters.minPrice != null) params.set('minPrice', String(filters.minPrice));
  if (filters.maxPrice != null) params.set('maxPrice', String(filters.maxPrice));
  if (filters.minRating != null) params.set('minRating', String(filters.minRating));
  if (filters.vendorId != null) params.set('vendorId', String(filters.vendorId));
  if (filters.stockStatus) params.set('stockStatus', filters.stockStatus);
  if (filters.sort && filters.sort !== 'newest') params.set('sort', filters.sort);
  if (filters.page > 0) params.set('page', String(filters.page));
  return params;
}

export function SearchResultsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const filters = useMemo(() => parseFilters(searchParams), [searchParams]);

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.list(),
  });

  const { data: vendors = [] } = useQuery({
    queryKey: ['discovery-vendors'],
    queryFn: () => discoveryService.vendors(),
  });

  const queryParams = useMemo(() => ({
    q: filters.q || undefined,
    categoryIds: filters.categories?.length ? filters.categories.join(',') : undefined,
    minPrice: filters.minPrice ?? undefined,
    maxPrice: filters.maxPrice ?? undefined,
    minRating: filters.minRating ?? undefined,
    vendorId: filters.vendorId ?? undefined,
    stockStatus: filters.stockStatus || undefined,
    sort: filters.sort,
    page: filters.page,
    size: PAGE_SIZE,
  }), [filters]);

  const { data, isLoading } = useQuery({
    queryKey: ['discovery-search', queryParams],
    queryFn: () => discoveryService.search(queryParams),
  });

  const { data: popular = [] } = useQuery({
    queryKey: ['discovery-popular'],
    queryFn: () => discoveryService.popular(8),
    enabled: !isLoading && (data?.content?.length ?? 0) === 0,
  });

  const { data: trending = [] } = useQuery({
    queryKey: ['trending-searches'],
    queryFn: () => discoveryService.trending(),
  });

  useEffect(() => {
    if (filters.q) addLocalSearchHistory(filters.q);
  }, [filters.q]);

  const products = data?.content ?? [];
  const totalElements = data?.totalElements ?? 0;
  const totalPages = data?.totalPages ?? 0;
  const localHistory = getLocalSearchHistory();
  const categoryList = Array.isArray(categories) ? categories : [];

  const updateFilters = (patch) => {
    const next = { ...filters, ...patch, page: patch.page ?? 0 };
    setSearchParams(buildSearchParams(next));
  };

  const clearFilters = () => {
    const q = filters.q;
    setSearchParams(q ? buildSearchParams({ q, page: 0 }) : new URLSearchParams());
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 md:py-8 pb-24 md:pb-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-100">
            {filters.q ? `Results for "${filters.q}"` : 'Browse Products'}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            {isLoading ? 'Searching...' : `${totalElements.toLocaleString()} product${totalElements !== 1 ? 's' : ''}`}
          </p>
        </div>
      </div>

      <div className="mb-4">
        <SortChips
          options={DISCOVERY_SORT_OPTIONS}
          value={filters.sort}
          onChange={(sort) => updateFilters({ sort })}
        />
      </div>

      <div className="grid lg:grid-cols-[280px_1fr] gap-8">
        <aside className="hidden lg:block">
          <Card className="p-5 sticky top-24">
            <ProductFilters
              categories={categoryList}
              vendors={vendors}
              filters={filters}
              onChange={updateFilters}
              onClear={clearFilters}
            />
          </Card>
        </aside>

        <div>
          {localHistory.length > 0 && (
            <Card className="p-4 mb-6">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Recent searches</h2>
                <button type="button" onClick={clearLocalSearchHistory} className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline min-h-[44px] px-2">
                  Clear
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {localHistory.slice(0, 10).map((term) => (
                  <Link
                    key={term}
                    to={`/search?q=${encodeURIComponent(term)}`}
                    className="px-3 py-1.5 rounded-full text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 min-h-[32px] inline-flex items-center"
                  >
                    {term}
                  </Link>
                ))}
              </div>
            </Card>
          )}

          <ProductGrid products={products} loading={isLoading} />

          {!isLoading && products.length > 0 && (
            <Pagination page={filters.page} totalPages={totalPages} onPageChange={(p) => updateFilters({ page: p })} />
          )}

          {!isLoading && products.length === 0 && (
            <Card className="p-10 text-center">
              <SearchX className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" aria-hidden="true" />
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">No Products Found</h2>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Try adjusting filters or search for something else.
              </p>

              {trending.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Trending searches</h3>
                  <div className="flex flex-wrap justify-center gap-2">
                    {trending.map((t) => (
                      <Link key={t} to={`/search?q=${encodeURIComponent(t)}`} className="px-3 py-1.5 rounded-full text-sm bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 min-h-[36px] inline-flex items-center">
                        {t}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {categoryList.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Popular categories</h3>
                  <div className="flex flex-wrap justify-center gap-2">
                    {categoryList.slice(0, 8).map((c) => (
                      <Link
                        key={c.id}
                        to={`/search?categories=${c.id}`}
                        className="px-3 py-1.5 rounded-full text-sm bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 min-h-[36px] inline-flex items-center"
                      >
                        {c.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {popular.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4 text-left">Recommended products</h3>
                  <ProductGrid products={popular} />
                </div>
              )}
            </Card>
          )}
        </div>
      </div>

      <div className="fixed bottom-20 left-0 right-0 z-40 px-4 lg:hidden">
        <Button
          className="w-full shadow-xl min-h-[48px] flex items-center justify-center gap-2"
          onClick={() => setMobileFiltersOpen(true)}
        >
          <Filter className="w-4 h-4" /> Filters & Sort
        </Button>
      </div>

      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileFiltersOpen(false)} aria-hidden="true" />
          <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] bg-white dark:bg-slate-900 rounded-t-3xl shadow-2xl overflow-y-auto animate-slide-up">
            <div className="sticky top-0 flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
              <h2 className="font-bold text-slate-800 dark:text-slate-100">Filters</h2>
              <button type="button" onClick={() => setMobileFiltersOpen(false)} aria-label="Close filters" className="min-h-[44px] min-w-[44px] flex items-center justify-center">
                <X className="w-6 h-6 text-slate-600 dark:text-slate-300" />
              </button>
            </div>
            <div className="p-4 pb-28">
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Sort by</h3>
                <SortChips
                  options={DISCOVERY_SORT_OPTIONS}
                  value={filters.sort}
                  onChange={(sort) => updateFilters({ sort })}
                />
              </div>
              <ProductFilters
                categories={categoryList}
                vendors={vendors}
                filters={filters}
                onChange={updateFilters}
                onClear={clearFilters}
              />
            </div>
            <div className="fixed bottom-0 left-0 right-0 p-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
              <Button className="w-full min-h-[48px]" onClick={() => setMobileFiltersOpen(false)}>Show {totalElements} products</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
