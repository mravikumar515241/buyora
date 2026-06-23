import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Heart, Search, Plus, Share2, Trash2, FolderHeart } from 'lucide-react';
import { wishlistService } from '../../services/wishlistService';
import { cartService } from '../../services/cartService';
import { useCartStore } from '../../store/cartStore';
import { useWishlistStore } from '../../store/wishlistStore';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { StockBadge } from '../../components/ui/StockBadge';
import { showToast } from '../../components/ui/Toast';

export function WishlistPage() {
  const queryClient = useQueryClient();
  const incrementCart = useCartStore((s) => s.incrementCart);
  const toggleLocal = useWishlistStore((s) => s.toggleLocal);

  const [selectedListId, setSelectedListId] = useState(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [newListName, setNewListName] = useState('');
  const [showCreateList, setShowCreateList] = useState(false);
  const size = 12;

  const { data: lists = [] } = useQuery({
    queryKey: ['wishlist-lists'],
    queryFn: () => wishlistService.getLists(),
  });

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['wishlist', selectedListId, search, page],
    queryFn: () => wishlistService.get({ collectionId: selectedListId || undefined, search: search || undefined, page, size }),
    placeholderData: (prev) => prev,
  });

  const items = data?.items ?? [];
  const totalCount = data?.totalCount ?? 0;
  const totalPages = Math.ceil(totalCount / size) || 1;

  const createListMutation = useMutation({
    mutationFn: (name) => wishlistService.createList({ name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist-lists'] });
      setNewListName('');
      setShowCreateList(false);
      showToast.success('Wishlist created');
    },
  });

  const deleteListMutation = useMutation({
    mutationFn: (id) => wishlistService.deleteList(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist-lists'] });
      if (selectedListId) setSelectedListId(null);
      showToast.success('Wishlist deleted');
    },
  });

  const shareMutation = useMutation({
    mutationFn: (id) => wishlistService.regenerateShareLink(id),
    onSuccess: (data) => {
      const url = `${window.location.origin}/wishlist/shared/${data.shareToken}`;
      navigator.clipboard?.writeText(url);
      showToast.success('Share link copied to clipboard');
    },
  });

  const removeMutation = useMutation({
    mutationFn: (productId) => wishlistService.remove(productId),
    onSuccess: (_, productId) => {
      toggleLocal(productId, false);
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      queryClient.invalidateQueries({ queryKey: ['wishlist-lists'] });
      showToast.success('Removed from wishlist');
    },
  });

  const moveToCartMutation = useMutation({
    mutationFn: async (item) => {
      if ((item.availableQuantity ?? 0) <= 0) throw new Error('OUT_OF_STOCK');
      await cartService.addItem(item.productId, 1);
      await wishlistService.remove(item.productId);
    },
    onSuccess: (_, item) => {
      incrementCart();
      toggleLocal(item.productId, false);
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      showToast.success('Moved to cart');
    },
    onError: (error) => {
      if (error.message === 'OUT_OF_STOCK') {
        showToast.error('Out of Stock — this item is currently unavailable');
      } else {
        showToast.error(error.response?.data?.message || 'Could not move to cart');
      }
    },
  });

  const moveItemMutation = useMutation({
    mutationFn: ({ productId, targetCollectionId }) => wishlistService.moveItem(productId, targetCollectionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      queryClient.invalidateQueries({ queryKey: ['wishlist-lists'] });
      showToast.success('Moved to another wishlist');
    },
  });

  if (isLoading && !data) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 animate-pulse space-y-4">
        <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded w-48" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-36 bg-slate-200 dark:bg-slate-700 rounded-xl" />
        ))}
      </div>
    );
  }

  const allItemsEmpty = totalCount === 0 && !search && !selectedListId;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 pb-24 md:pb-10">
      <div className="flex flex-col lg:flex-row lg:items-start gap-6">
        <aside className="lg:w-64 flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FolderHeart className="w-5 h-5 text-indigo-600" />
              My Lists
            </h2>
            <button type="button" onClick={() => setShowCreateList((v) => !v)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
              <Plus className="w-5 h-5" />
            </button>
          </div>
          {showCreateList && (
            <form
              className="mb-3 flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                if (newListName.trim()) createListMutation.mutate(newListName.trim());
              }}
            >
              <Input value={newListName} onChange={(e) => setNewListName(e.target.value)} placeholder="List name" className="text-sm" />
              <Button size="sm" type="submit">Add</Button>
            </form>
          )}
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => { setSelectedListId(null); setPage(0); }}
              className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                !selectedListId ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              All Items
            </button>
            {lists.map((list) => (
              <div key={list.id} className="group flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => { setSelectedListId(list.id); setPage(0); }}
                  className={`flex-1 text-left px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                    selectedListId === list.id ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {list.name}
                  <span className="text-slate-500 ml-1">({list.itemCount})</span>
                </button>
                {!list.defaultList && (
                  <button type="button" onClick={() => deleteListMutation.mutate(list.id)} className="opacity-0 group-hover:opacity-100 p-1 text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </aside>

        <div className="flex-1 min-w-0">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Heart className="w-8 h-8 text-red-500" />
              My Wishlist
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">{totalCount} saved item{totalCount !== 1 ? 's' : ''}</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                placeholder="Search wishlist..."
                className="pl-10"
              />
            </div>
            {selectedListId && (
              <Button variant="secondary" onClick={() => shareMutation.mutate(selectedListId)} disabled={shareMutation.isPending}>
                <Share2 className="w-4 h-4 mr-2" />
                Share List
              </Button>
            )}
          </div>

          {allItemsEmpty ? (
            <Card className="text-center py-20">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-pink-100 to-red-100 dark:from-pink-900/30 dark:to-red-900/30 flex items-center justify-center text-5xl">
                ♡
              </div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">Your Wishlist is Empty</h2>
              <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto">
                Save products you love and buy them later. Tap ♡ on any product to get started.
              </p>
              <Link to="/products">
                <Button size="lg">Browse Products</Button>
              </Link>
            </Card>
          ) : (
            <div className={`space-y-4 ${isFetching ? 'opacity-70' : ''}`}>
              {items.map((item) => {
                const outOfStock = (item.availableQuantity ?? 0) <= 0;
                const priceDropped = item.priceChanged && item.currentPrice < item.priceAtAdd;
                const otherLists = lists.filter((l) => l.id !== item.collectionId);

                return (
                  <Card key={item.id} className="p-4 sm:p-6 hover:shadow-lg transition-shadow">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <Link to={`/products/${item.productId}`} className="w-full sm:w-32 h-32 flex-shrink-0 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-700">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover hover:scale-105 transition-transform" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400">No image</div>
                        )}
                      </Link>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <Link to={`/products/${item.productId}`} className="font-semibold text-lg text-slate-800 dark:text-slate-100 hover:text-indigo-600">
                              {item.productName}
                            </Link>
                            {item.vendorName && <p className="text-sm text-slate-500 mt-0.5">Sold by {item.vendorName}</p>}
                            {item.collectionName && <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1">{item.collectionName}</p>}
                          </div>
                          <StockBadge available={item.availableQuantity} stockStatus={item.stockStatus} />
                        </div>

                        {item.averageRating > 0 && (
                          <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">
                            ★ {item.averageRating} ({item.reviewCount} reviews)
                          </p>
                        )}

                        <div className="mt-3 flex flex-wrap items-baseline gap-2">
                          <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                            ₹{Number(item.currentPrice).toLocaleString('en-IN')}
                          </span>
                          {priceDropped && (
                            <>
                              <span className="text-sm text-slate-500 line-through">₹{Number(item.priceAtAdd).toLocaleString('en-IN')}</span>
                              <span className="text-sm font-semibold text-green-600 bg-green-50 dark:bg-green-900/30 px-2 py-0.5 rounded-full">
                                {item.discountPercent > 0 ? `${item.discountPercent}% off` : 'Price dropped!'}
                              </span>
                            </>
                          )}
                        </div>

                        {item.addedAt && (
                          <p className="text-xs text-slate-500 mt-2">Added {new Date(item.addedAt).toLocaleDateString()}</p>
                        )}

                        <div className="mt-4 flex flex-wrap gap-2">
                          <Button size="sm" onClick={() => moveToCartMutation.mutate(item)} disabled={outOfStock || moveToCartMutation.isPending}>
                            {outOfStock ? 'Out of Stock' : 'Move to Cart'}
                          </Button>
                          <Link to={`/products/${item.productId}`}>
                            <Button size="sm" variant="secondary">View Product</Button>
                          </Link>
                          {otherLists.length > 0 && (
                            <select
                              className="text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-2 py-1.5"
                              defaultValue=""
                              onChange={(e) => {
                                if (e.target.value) {
                                  moveItemMutation.mutate({ productId: item.productId, targetCollectionId: Number(e.target.value) });
                                  e.target.value = '';
                                }
                              }}
                            >
                              <option value="">Move to list...</option>
                              {otherLists.map((l) => (
                                <option key={l.id} value={l.id}>{l.name}</option>
                              ))}
                            </select>
                          )}
                          <Button size="sm" variant="outline" onClick={() => removeMutation.mutate(item.productId)} className="text-red-600">
                            Remove
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex justify-center gap-3 mt-8">
              <Button variant="secondary" size="sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>Previous</Button>
              <span className="text-sm text-slate-600 self-center">Page {page + 1} of {totalPages}</span>
              <Button variant="secondary" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}>Next</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
