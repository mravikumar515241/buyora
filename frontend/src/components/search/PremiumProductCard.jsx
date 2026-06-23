import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ShoppingCart } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import { cartService } from '../../services/cartService';
import { showToast } from '../ui/Toast';
import { StockBadge } from '../ui/StockBadge';
import { WishlistButton } from '../ui/WishlistButton';
import { StarRating } from '../ui/StarRating';
import { Button } from '../ui/Button';
import { PromoBadgeStack } from '../promotions/PromoBadge';
import { getPromoBadges } from '../../utils/promotionUtils';

export function PremiumProductCard({ product, compact = false }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { token, user } = useAuthStore();
  const incrementCart = useCartStore((s) => s.incrementCart);
  const isOwnProduct = user && product?.vendorUserId && Number(user.id) === Number(product.vendorUserId);
  const available = product?.availableQuantity ?? product?.stock ?? 0;
  const inStock = available > 0;
  const promoBadges = getPromoBadges(product);

  const addToCartMutation = useMutation({
    mutationFn: () => cartService.addItem(product.id, 1),
    onSuccess: () => {
      incrementCart();
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      showToast.success('Added to cart');
    },
    onError: (err) => showToast.error(err.response?.data?.message || 'Could not add to cart'),
  });

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!token) {
      navigate('/login');
      return;
    }
    if (isOwnProduct || !inStock) return;
    addToCartMutation.mutate();
  };

  return (
    <article className="group relative h-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      <Link to={`/products/${product.id}`} className="block">
        <div className="relative aspect-square bg-slate-100 dark:bg-slate-700 overflow-hidden">
          {product.imageUrls?.[0] ? (
            <img
              src={product.imageUrls[0]}
              alt={product.name}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">No image</div>
          )}
          {!isOwnProduct && (
            <div className="absolute top-2 left-2 z-10">
              <WishlistButton productId={product.id} size="sm" />
            </div>
          )}
          <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
            <StockBadge available={available} stockStatus={product.stockStatus} />
          </div>
          <div className="absolute bottom-2 left-2 right-2">
            <PromoBadgeStack badges={promoBadges} />
          </div>
        </div>

        <div className={`p-3 md:p-4 flex flex-col ${compact ? 'gap-1' : 'gap-2'}`}>
          {product.categoryName && (
            <span className="text-[11px] font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-400">
              {product.categoryName}
            </span>
          )}
          <h3 className="font-semibold text-slate-900 dark:text-white line-clamp-2 min-h-[2.5rem] group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
            {product.name}
          </h3>
          {product.vendorBusinessName && (
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{product.vendorBusinessName}</p>
          )}
          {(product.averageRating > 0 || product.reviewCount > 0) && (
            <div className="flex items-center gap-2">
              <StarRating rating={product.averageRating || 0} readonly />
              <span className="text-xs text-slate-500">({product.reviewCount ?? 0})</span>
            </div>
          )}
          <p className="text-lg font-bold text-slate-900 dark:text-white">
            ₹{Number(product.price).toLocaleString('en-IN')}
          </p>
        </div>
      </Link>

      {!isOwnProduct && inStock && (
        <div className="px-3 pb-3 md:px-4 md:pb-4">
          <Button
            size="sm"
            className="w-full min-h-[44px]"
            onClick={handleAddToCart}
            disabled={addToCartMutation.isPending}
          >
            <ShoppingCart className="w-4 h-4 mr-2" aria-hidden="true" />
            Add to Cart
          </Button>
        </div>
      )}
    </article>
  );
}
