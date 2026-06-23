import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { productService } from '../../services/productService';
import { categoryService } from '../../services/categoryService';
import { useAuthStore } from '../../store/authStore';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StockBadge } from '../../components/ui/StockBadge';
import { WishlistButton } from '../../components/ui/WishlistButton';

const PAGE_SIZE = 12;

function useCategories() {
  const { data } = useQuery({ queryKey: ['categories'], queryFn: () => categoryService.list() });
  return Array.isArray(data) ? data : [];
}

function Pagination({ page, totalPages, onPageChange }) {
  const pages = useMemo(() => {
    const arr = [];
    const show = 5;
    let start = Math.max(0, page - Math.floor(show / 2));
    let end = Math.min(totalPages, start + show);
    if (end - start < show) start = Math.max(0, end - show);
    for (let i = start; i < end; i++) arr.push(i);
    return arr;
  }, [page, totalPages]);

  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
      <Button
        variant="secondary"
        disabled={page === 0}
        onClick={() => onPageChange(0)}
      >
        Previous
      </Button>
      <div className="flex items-center gap-1">
        {pages.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onPageChange(p)}
            className={`min-w-[2.25rem] h-9 px-2 rounded-lg text-sm font-semibold transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105 ${
              p === page
                ? 'bg-gradient-to-br from-indigo-500 via-indigo-600 to-indigo-700 dark:from-indigo-400 dark:via-indigo-500 dark:to-indigo-600 text-white shadow-indigo-500/50 dark:shadow-indigo-400/30'
                : 'bg-gradient-to-br from-slate-100 via-slate-200 to-slate-300 dark:from-slate-700 dark:via-slate-800 dark:to-slate-900 text-slate-700 dark:text-slate-200 hover:from-slate-200 hover:via-slate-300 hover:to-slate-400 dark:hover:from-slate-600 dark:hover:via-slate-700 dark:hover:to-slate-800 shadow-slate-500/20 dark:shadow-slate-700/30'
            }`}
          >
            {p + 1}
          </button>
        ))}
      </div>
      <Button
        variant="secondary"
        disabled={page >= totalPages - 1}
        onClick={() => onPageChange(totalPages - 1)}
      >
        Next
      </Button>
      <span className="text-slate-500 dark:text-slate-400 text-sm ml-2">
        Page {page + 1} of {totalPages}
      </span>
    </div>
  );
}

export function ProductListPage() {
  const { user } = useAuthStore();
  const [page, setPage] = useState(0);
  const [categoryId, setCategoryId] = useState(null);
  const [search, setSearch] = useState('');

  const categories = useCategories();
  const params = useMemo(
    () => ({ page, size: PAGE_SIZE, ...(search.trim() ? { search: search.trim() } : {}) }),
    [page, search]
  );

  const { data, isLoading } = useQuery({
    queryKey: ['products', page, categoryId, search.trim()],
    queryFn: () =>
      categoryId != null && categoryId !== ''
        ? productService.byCategory(categoryId, params)
        : productService.list(params),
  });

  const products = data?.content ?? [];
  const totalPages = data?.totalPages ?? 0;

  const handleCategoryClick = (id) => {
    setCategoryId(id ?? null);
    setPage(0);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6">Products</h1>

      {/* Search bar */}
      <form onSubmit={handleSearchSubmit} className="mb-6">
        <div className="flex gap-2 max-w-md">
          <input
            type="search"
            placeholder="Search products by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 rounded-xl border border-slate-200 dark:border-slate-600 
              bg-white dark:bg-slate-800 
              px-4 py-2.5 
              text-slate-900 dark:text-slate-100 
              placeholder-slate-400 dark:placeholder-slate-500 
              focus:outline-none focus:ring-2 focus:ring-indigo-500/50 dark:focus:ring-indigo-400/50 
              focus:border-indigo-500 dark:focus:border-indigo-400
              hover:bg-slate-50 dark:hover:bg-slate-700
              shadow-sm hover:shadow-md
              transition-all duration-300"
            aria-label="Search products"
          />
          <Button type="submit">Search</Button>
        </div>
      </form>

      {/* Category filter */}
      <div className="mb-6">
        <h2 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Category</h2>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => handleCategoryClick(null)}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105 ${
              categoryId == null || categoryId === '' 
                ? 'bg-gradient-to-br from-indigo-500 via-indigo-600 to-indigo-700 dark:from-indigo-400 dark:via-indigo-500 dark:to-indigo-600 text-white shadow-indigo-500/50 dark:shadow-indigo-400/30' 
                : 'bg-gradient-to-br from-slate-100 via-slate-200 to-slate-300 dark:from-slate-700 dark:via-slate-800 dark:to-slate-900 text-slate-700 dark:text-slate-200 hover:from-slate-200 hover:via-slate-300 hover:to-slate-400 dark:hover:from-slate-600 dark:hover:via-slate-700 dark:hover:to-slate-800 shadow-slate-500/20 dark:shadow-slate-700/30'
            }`}
          >
            All Products
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleCategoryClick(cat.id)}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105 ${
                categoryId === cat.id
                  ? 'bg-gradient-to-br from-indigo-500 via-indigo-600 to-indigo-700 dark:from-indigo-400 dark:via-indigo-500 dark:to-indigo-600 text-white shadow-indigo-500/50 dark:shadow-indigo-400/30'
                  : 'bg-gradient-to-br from-slate-100 via-slate-200 to-slate-300 dark:from-slate-700 dark:via-slate-800 dark:to-slate-900 text-slate-700 dark:text-slate-200 hover:from-slate-200 hover:via-slate-300 hover:to-slate-400 dark:hover:from-slate-600 dark:hover:via-slate-700 dark:hover:to-slate-800 shadow-slate-500/20 dark:shadow-slate-700/30'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Loading skeleton */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="h-80 animate-pulse bg-slate-100 dark:bg-slate-700" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && products.length === 0 && (
        <p className="text-slate-500 dark:text-slate-400 py-12 text-center text-lg">No products found.</p>
      )}

      {/* Product grid */}
      {!isLoading && products.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((p) => {
              const isOwnProduct = user && p.vendorUserId && 
                Number(user.id) === Number(p.vendorUserId);
              
              return (
                <div key={p.id} className="relative group h-full">
                  <Link
                    to={`/products/${p.id}`}
                    className="block h-full"
                  >
                    <Card hover className="h-full flex flex-col overflow-hidden transition-all duration-200 group-hover:shadow-lg group-hover:-translate-y-0.5">
                      <div className="aspect-square bg-slate-100 dark:bg-slate-700 overflow-hidden flex-shrink-0 relative">
                        {p.imageUrls?.[0] ? (
                          <img
                            src={p.imageUrls[0]}
                            alt={p.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400 dark:text-slate-500 text-sm">
                            No image
                          </div>
                        )}
                        {isOwnProduct && (
                          <div className="absolute top-2 right-2 bg-amber-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                            Your Product
                          </div>
                        )}
                        {!isOwnProduct && (
                          <div className="absolute top-2 left-2">
                            <WishlistButton productId={p.id} size="sm" />
                          </div>
                        )}
                      </div>
                    <div className="p-4 flex flex-col flex-1">
                      {p.categoryName && (
                        <span className="inline-block w-fit px-2 py-0.5 rounded text-xs font-medium bg-indigo-50 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 mb-2">
                          {p.categoryName}
                        </span>
                      )}
                      <h3 className="font-semibold text-slate-800 dark:text-slate-100 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {p.name}
                      </h3>
                      <p className="text-indigo-600 dark:text-indigo-400 font-bold mt-1 text-lg">
                        ₹{Number(p.price).toLocaleString()}
                      </p>
                      <div className="mt-2">
                        <StockBadge available={p.availableQuantity ?? p.stock} stockStatus={p.stockStatus} />
                      </div>
                      {p.vendorBusinessName && (
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                          Sold by {p.vendorBusinessName}
                        </p>
                      )}
                      {p.description && (
                        <p className="text-slate-600 dark:text-slate-400 text-sm mt-2 line-clamp-2 flex-1">
                          {p.description}
                        </p>
                      )}
                      <span className="inline-flex items-center justify-center w-full mt-4 rounded-xl px-4 py-2.5 font-semibold 
                        bg-gradient-to-br from-indigo-500 via-indigo-600 to-indigo-700
                        dark:from-indigo-400 dark:via-indigo-500 dark:to-indigo-600
                        text-white shadow-lg shadow-indigo-500/50 dark:shadow-indigo-400/30
                        group-hover:from-indigo-600 group-hover:via-indigo-700 group-hover:to-indigo-800
                        dark:group-hover:from-indigo-500 dark:group-hover:via-indigo-600 dark:group-hover:to-indigo-700
                        transition-all duration-300 transform group-hover:scale-[1.02]">
                        {isOwnProduct ? 'View Details' : 'View Product'}
                      </span>
                    </div>
                  </Card>
                  </Link>
                </div>
              );
            })}
          </div>
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}
