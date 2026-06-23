import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Minus, Plus, ShoppingCart } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productService } from '../../services/productService';
import { cartService } from '../../services/cartService';
import { reviewService } from '../../services/reviewService';
import { discoveryService } from '../../services/discoveryService';
import { vendorService } from '../../services/vendorService';
import { getSessionId } from '../../utils/sessionId';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import { showToast } from '../../components/ui/Toast';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StarRating } from '../../components/ui/StarRating';
import { ImageCarousel } from '../../components/ui/ImageCarousel';
import { StockBadge } from '../../components/ui/StockBadge';
import { WishlistButton } from '../../components/ui/WishlistButton';
import { ReviewsPanel } from '../../components/reviews/ReviewsPanel';
import { VendorReputationCard } from '../../components/reviews/VendorReputationCard';
import { SectionCarousel } from '../../components/search/SectionCarousel';
import { ProductOffersPanel } from '../../components/promotions/ProductOffersPanel';
import { BundleOfferSection } from '../../components/promotions/BundleOfferSection';
import { PromoBadgeStack } from '../../components/promotions/PromoBadge';
import { FreeShippingBar } from '../../components/promotions/FreeShippingBar';
import { useActiveCoupons } from '../../hooks/usePromotions';
import { getPromoBadges } from '../../utils/promotionUtils';
import { getAvailabilityMessage, isPurchasable } from '../../utils/stockStatus';
import { inventoryService } from '../../services/inventoryService';
import { Bell, BellOff } from 'lucide-react';

export function ProductDetailPage() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const { token, user } = useAuthStore();
  const incrementCart = useCartStore((s) => s.incrementCart);
  
  const [quantity, setQuantity] = useState(1);

  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productService.getById(id),
    enabled: !!id,
  });

  const { data: reviewSummary } = useQuery({
    queryKey: ['reviewSummary', id],
    queryFn: () => reviewService.getSummary(id),
    enabled: !!id,
  });

  const { data: vendorProfile } = useQuery({
    queryKey: ['vendor-profile', product?.vendorId],
    queryFn: () => vendorService.getProfile(product.vendorId),
    enabled: !!product?.vendorId,
  });

  const { data: similarProducts = [] } = useQuery({
    queryKey: ['similar-products', id],
    queryFn: () => discoveryService.similar(id, 8),
    enabled: !!id,
  });

  const { data: coupons = [] } = useActiveCoupons(20);

  const { data: restockStatus } = useQuery({
    queryKey: ['restock-status', id, product?.availableQuantity, product?.stockStatus],
    queryFn: () => inventoryService.getRestockStatus(id),
    enabled:
      !!id &&
      !!token &&
      !!product &&
      !isPurchasable(product.availableQuantity ?? product.stock ?? 0, product.stockStatus) &&
      product.stockStatus !== 'PRE_ORDER',
  });

  const restockMutation = useMutation({
    mutationFn: (subscribe) =>
      subscribe
        ? inventoryService.subscribeRestock(id)
        : inventoryService.unsubscribeRestock(id),
    onSuccess: (_, subscribe) => {
      showToast.success(subscribe ? 'You will be notified when back in stock' : 'Restock alert removed');
      queryClient.invalidateQueries({ queryKey: ['restock-status', id] });
    },
    onError: (e) => showToast.error(e.response?.data?.message || 'Could not update alert'),
  });

  const sessionId = getSessionId();
  const { data: recentlyViewed = [] } = useQuery({
    queryKey: ['recently-viewed', sessionId],
    queryFn: () => discoveryService.recentlyViewed(sessionId, 8),
    enabled: !!sessionId,
  });

  useEffect(() => {
    if (id) {
      discoveryService.recordView(id, sessionId).catch(() => {});
    }
  }, [id, sessionId]);

  const averageRating = reviewSummary?.averageRating != null
    ? Number(reviewSummary.averageRating).toFixed(1)
    : (product?.averageRating != null ? Number(product.averageRating).toFixed(1) : '0');
  const reviewCount = reviewSummary?.totalReviews ?? product?.reviewCount ?? 0;

  // Check if current user is the vendor of this product
  // Compare user's ID with the vendor's user ID (not vendor entity ID)
  const isOwnProduct = user && product?.vendorUserId && 
    Number(user.id) === Number(product.vendorUserId);

  const addToCartMutation = useMutation({
    mutationFn: () => cartService.addItem(id, quantity),
    onSuccess: () => {
      incrementCart();
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      showToast(` ${product.name} added to cart!`, 'success');
    },
    onError: (error) => {
      showToast.error(error.response?.data?.message || 'Requested quantity exceeds available stock');
    },
  });

  const handleQuantityChange = (delta) => {
    const newQty = quantity + delta;
    const maxStock = product?.stock || 99;
    if (newQty >= 1 && newQty <= maxStock) {
      setQuantity(newQty);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="aspect-square bg-slate-200 rounded-xl" />
            <div className="space-y-4">
              <div className="h-8 bg-slate-200 rounded w-3/4" />
              <div className="h-6 bg-slate-200 rounded w-1/2" />
              <div className="h-20 bg-slate-200 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <Card className="text-center py-16 backdrop-blur-xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/50 dark:border-slate-700/50">
            {/* 404 Icon */}
            <div className="w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            
            {/* Message */}
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              Product Not Found
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto">
              The product you're looking for might have been removed, is no longer available, or you may have followed an incorrect link.
            </p>
            
            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <Link to="/products" className="block">
                <Button className="glass-button">
                  <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Browse All Products
                </Button>
              </Link>
              <Link to="/" className="block">
                <Button variant="outline" className="glass-button">
                  <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Back to Home
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  const availableQty = product.availableQuantity ?? product.stock ?? 0;
  const lowStockThreshold = product.lowStockThreshold ?? 10;
  const canPurchase = isPurchasable(availableQty, product.stockStatus);
  const isOutOfStock = !canPurchase && product.stockStatus !== 'PRE_ORDER';
  const maxStock = product.stockStatus === 'PRE_ORDER' ? 99 : (availableQty || 1);
  const availabilityMessage = getAvailabilityMessage(availableQty, product.stockStatus, lowStockThreshold);
  const promoBadges = getPromoBadges(product);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-slate-500 dark:text-slate-400 mb-6">
        <Link to="/" className="hover:text-indigo-600 dark:hover:text-indigo-400">Home</Link>
        <span className="mx-2">/</span>
        <Link to="/products" className="hover:text-indigo-600 dark:hover:text-indigo-400">Products</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-700 dark:text-slate-300">{product.name}</span>
      </nav>

      <div className="grid lg:grid-cols-2 gap-8 mb-12">
        {/* Left side - Product Images with Carousel */}
        <div>
          <ImageCarousel 
            images={product.imageUrls && product.imageUrls.length > 0 ? product.imageUrls : []} 
            alt={product.name} 
          />
        </div>

        {/* Right side - Product Details */}
        <div>
          {/* Category Badge */}
          {product.categoryName && (
            <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-indigo-50 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 mb-3">
              {product.categoryName}
            </span>
          )}

          {/* Product Name */}
          <div className="flex items-start justify-between gap-4 mb-2">
            <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 flex-1">
              {product.name}
            </h1>
            {!isOwnProduct && (
              <WishlistButton productId={product.id} size="lg" />
            )}
          </div>

          {/* Rating summary near title */}
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <StarRating rating={averageRating} readonly />
            <span className="text-slate-700 dark:text-slate-300 font-medium">
              {averageRating} / 5
            </span>
            <span className="text-slate-500 dark:text-slate-400 text-sm">
              ({reviewCount.toLocaleString()} review{reviewCount !== 1 ? 's' : ''})
            </span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
              {'\u20B9'}{Number(product.price).toLocaleString('en-IN')}
            </span>
          </div>

          {/* Stock Status */}
          <div className="mb-4 flex items-center gap-3 flex-wrap">
            <StockBadge available={availableQty} stockStatus={product.stockStatus} lowStockThreshold={lowStockThreshold} />
            <PromoBadgeStack badges={promoBadges} />
          </div>
          <div className="mb-6">
            <span className={`font-medium ${
              isOutOfStock
                ? 'text-red-600 dark:text-red-400'
                : availableQty <= lowStockThreshold
                  ? 'text-orange-600 dark:text-orange-400'
                  : 'text-green-600 dark:text-green-400'
            }`}>
              {availabilityMessage}
            </span>
            {product.expectedRestockDate && isOutOfStock && (
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Expected restock: {new Date(product.expectedRestockDate).toLocaleDateString()}
              </p>
            )}
          </div>

          {isOutOfStock && !isOwnProduct && (
            <div className="mb-6">
              {token ? (
                <Button
                  variant="outline"
                  className="w-full sm:w-auto"
                  onClick={() => restockMutation.mutate(!restockStatus?.subscribed)}
                  disabled={restockMutation.isPending}
                >
                  {restockStatus?.subscribed ? (
                    <>
                      <BellOff className="w-4 h-4 mr-2" />
                      Cancel Back-in-Stock Alert
                    </>
                  ) : (
                    <>
                      <Bell className="w-4 h-4 mr-2" />
                      Notify Me When Available
                    </>
                  )}
                </Button>
              ) : (
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  <Link to="/login" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
                    Log in
                  </Link>
                  {' '}to get notified when this item is back in stock
                </p>
              )}
            </div>
          )}

          {/* Description */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">Description</h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              {product.description || 'No description available.'}
            </p>
          </div>

          {/* Vendor Reputation */}
          <div className="mb-6">
            <VendorReputationCard
              vendorProfile={vendorProfile}
              vendorId={product.vendorId}
              businessName={product.vendorBusinessName}
            />
          </div>

          <FreeShippingBar subtotal={product.price} className="mb-6" />

          <ProductOffersPanel
            coupons={coupons}
            productPrice={product.price}
            vendorName={product.vendorBusinessName}
          />

          {/* Quantity Selector and Add to Cart */}
          {token && canPurchase && !isOwnProduct && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Quantity
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    className="w-10 h-10 rounded-xl border-2 border-slate-200 dark:border-slate-600 
                      bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 
                      dark:from-slate-700 dark:via-slate-800 dark:to-slate-900
                      flex items-center justify-center text-xl font-semibold 
                      text-slate-700 dark:text-slate-200 
                      hover:from-slate-100 hover:via-slate-200 hover:to-slate-300
                      dark:hover:from-slate-600 dark:hover:via-slate-700 dark:hover:to-slate-800
                      disabled:opacity-40 disabled:cursor-not-allowed 
                      transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-5 h-5" aria-hidden="true" />
                  </button>
                  <input
                    type="number"
                    min="1"
                    max={maxStock}
                    value={quantity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 1;
                      setQuantity(Math.max(1, Math.min(maxStock, val)));
                    }}
                    className="w-20 text-center rounded-xl border-2 border-slate-200 dark:border-slate-600 
                      bg-white dark:bg-slate-800 
                      text-slate-900 dark:text-slate-100 
                      px-3 py-2 text-lg font-semibold 
                      focus:outline-none focus:ring-2 focus:ring-indigo-500/50 dark:focus:ring-indigo-400/50 
                      focus:border-indigo-500 dark:focus:border-indigo-400
                      shadow-sm hover:shadow-md transition-all duration-300"
                  />
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= maxStock}
                    className="w-10 h-10 rounded-xl border-2 border-slate-200 dark:border-slate-600 
                      bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 
                      dark:from-slate-700 dark:via-slate-800 dark:to-slate-900
                      flex items-center justify-center text-xl font-semibold 
                      text-slate-700 dark:text-slate-200 
                      hover:from-slate-100 hover:via-slate-200 hover:to-slate-300
                      dark:hover:from-slate-600 dark:hover:via-slate-700 dark:hover:to-slate-800
                      disabled:opacity-40 disabled:cursor-not-allowed 
                      transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-5 h-5" aria-hidden="true" />
                  </button>
                </div>
              </div>

              <Button
                onClick={() => addToCartMutation.mutate()}
                disabled={addToCartMutation.isPending}
                className="w-full py-3 text-lg inline-flex items-center justify-center"
              >
                {addToCartMutation.isPending ? (
                  'Adding...'
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5 mr-2" aria-hidden="true" />
                    Add to Cart
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Message for vendor viewing their own product */}
          {token && canPurchase && isOwnProduct && (
            <div className="p-4 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-lg">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="text-amber-800 dark:text-amber-200 font-medium text-sm mb-1">
                    This is your product
                  </p>
                  <p className="text-amber-700 dark:text-amber-300 text-sm">
                    You cannot purchase your own products. You can{' '}
                    <Link to={`/dashboard/products/edit/${product.id}`} className="font-semibold hover:underline">
                      edit this product
                    </Link>
                    {' '}from your vendor dashboard.
                  </p>
                </div>
              </div>
            </div>
          )}

          {!token && canPurchase && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-blue-800 dark:text-blue-200 text-sm">
                <Link to="/login" className="font-semibold hover:underline">
                  Log in
                </Link>
                {' '}to add this product to your cart
              </p>
            </div>
          )}
        </div>
      </div>

      {similarProducts.length > 0 && (
        <>
          <BundleOfferSection products={[product, ...similarProducts]} />
          <SectionCarousel
          title="Customers Also Viewed"
          products={similarProducts}
          viewAllLink={product.categoryId ? `/search?categories=${product.categoryId}` : '/search'}
        />
        </>
      )}

      {recentlyViewed.filter((p) => String(p.id) !== String(id)).length > 0 && (
        <SectionCarousel
          title="Recently Viewed"
          products={recentlyViewed.filter((p) => String(p.id) !== String(id)).slice(0, 8)}
        />
      )}

      <ReviewsPanel
        productId={id}
        averageRating={averageRating}
        reviewCount={reviewCount}
        reviewSummary={reviewSummary}
      />
    </div>
  );
}
