import { useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cartService } from '../../services/cartService';
import { wishlistService } from '../../services/wishlistService';
import { useActiveCoupons } from '../../hooks/usePromotions';
import { useCouponStore } from '../../store/couponStore';
import { useCartStore } from '../../store/cartStore';
import { showToast } from '../../components/ui/Toast';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { CartCouponPanel } from '../../components/promotions/CartCouponPanel';
import { FreeShippingBar } from '../../components/promotions/FreeShippingBar';

export function CartPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const syncFromResponse = useCartStore((s) => s.syncFromResponse);

  const { data: savedItems = [] } = useQuery({
    queryKey: ['saved-items'],
    queryFn: () => wishlistService.getSaved(),
  });

  const { data, isLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: () => cartService.get(),
  });

  const { data: coupons = [], isLoading: couponsLoading } = useActiveCoupons(20);
  const appliedCoupon = useCouponStore((s) => s.appliedCoupon);
  const discount = Number(appliedCoupon?.discountAmount) || 0;

  const updateMutation = useMutation({
    mutationFn: ({ productId, quantity }) => cartService.updateQuantity(productId, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
    onError: (error) => {
      showToast.error(error.response?.data?.message || 'Requested quantity exceeds available stock');
    },
  });

  const removeMutation = useMutation({
    mutationFn: (productId) => cartService.removeItem(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  const saveForLaterMutation = useMutation({
    mutationFn: (productId) => wishlistService.saveForLater(productId),
    onSuccess: (_, productId) => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['saved-items'] });
      showToast.success('Saved for later');
    },
    onError: (error) => {
      showToast.error(error.response?.data?.message || 'Could not save for later');
    },
  });

  const moveSavedToCartMutation = useMutation({
    mutationFn: (productId) => wishlistService.moveSavedToCart(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['saved-items'] });
      showToast.success('Moved to cart');
    },
  });

  const removeSavedMutation = useMutation({
    mutationFn: (productId) => wishlistService.removeSaved(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-items'] });
      showToast.success('Removed saved item');
    },
  });

  const cart = data;
  const items = cart?.items || [];
  const total = cart?.totalAmount ?? 0;

  // Sync cart count with store
  if (cart) syncFromResponse(cart);

  const handleQuantityChange = (item, delta) => {
    const newQty = item.quantity + delta;
    if (newQty >= 1) {
      updateMutation.mutate({ productId: item.productId, quantity: newQty });
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-200 dark:bg-slate-600 rounded w-32" />
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-slate-200 dark:bg-slate-600 rounded" />
              ))}
            </div>
            <div className="h-64 bg-slate-200 dark:bg-slate-600 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <Card className="text-center py-16">
          <div className="max-w-md mx-auto">
            <svg
              className="mx-auto h-24 w-24 text-slate-300 dark:text-slate-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            <h3 className="mt-6 text-2xl font-semibold text-slate-800 dark:text-slate-100">
              Your cart is empty
            </h3>
            <p className="mt-2 text-slate-600 dark:text-slate-400">
              Start shopping to add items to your cart
            </p>
            <div className="mt-8">
              <Link to="/products">
                <Button size="lg">Browse Products</Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
  const finalTotal = Math.max(0, Number(total) - discount);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 pb-24 md:pb-8">
      {/* Page Title */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Shopping Cart</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">{totalItems} item{totalItems !== 1 ? 's' : ''} in your cart</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Cart Items - Left Side */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <Card key={item.cartItemId} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Product Image */}
                <Link to={`/products/${item.productId}`} className="w-24 h-24 flex-shrink-0 bg-slate-100 dark:bg-slate-700 rounded-lg overflow-hidden mx-auto sm:mx-0">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.productName}
                      className="w-full h-full object-cover hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg
                        className="w-12 h-12 text-slate-400 dark:text-slate-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  )}
                </Link>

                {/* Product Details */}
                <div className="flex-1 min-w-0">
                  <Link to={`/products/${item.productId}`}>
                    <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-lg mb-1 truncate hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                      {item.productName}
                    </h3>
                  </Link>
                  <p className="text-slate-600 dark:text-slate-400 text-sm mb-3">
                    ₹{Number(item.unitPrice).toLocaleString('en-IN')} per unit
                  </p>

                  <div className="flex flex-wrap items-center gap-4">
                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-slate-600 dark:text-slate-400 mr-2">Quantity:</span>
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(item, -1)}
                        disabled={item.quantity <= 1 || updateMutation.isPending}
                        className="w-8 h-8 rounded-lg border-2 border-slate-200 dark:border-slate-600 
                          bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 
                          dark:from-slate-700 dark:via-slate-800 dark:to-slate-900
                          flex items-center justify-center text-lg font-semibold 
                          text-slate-700 dark:text-slate-200 
                          hover:from-slate-100 hover:via-slate-200 hover:to-slate-300
                          dark:hover:from-slate-600 dark:hover:via-slate-700 dark:hover:to-slate-800
                          disabled:opacity-40 disabled:cursor-not-allowed 
                          transition-all duration-300 shadow-sm hover:shadow-md transform hover:scale-105"
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>
                      <span className="w-12 text-center font-semibold text-slate-800 dark:text-slate-200">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(item, 1)}
                        disabled={updateMutation.isPending}
                        className="w-8 h-8 rounded-lg border-2 border-slate-200 dark:border-slate-600 
                          bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 
                          dark:from-slate-700 dark:via-slate-800 dark:to-slate-900
                          flex items-center justify-center text-lg font-semibold 
                          text-slate-700 dark:text-slate-200 
                          hover:from-slate-100 hover:via-slate-200 hover:to-slate-300
                          dark:hover:from-slate-600 dark:hover:via-slate-700 dark:hover:to-slate-800
                          disabled:opacity-40 disabled:cursor-not-allowed 
                          transition-all duration-300 shadow-sm hover:shadow-md transform hover:scale-105"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>

                    {/* Save For Later */}
                    <button
                      type="button"
                      onClick={() => saveForLaterMutation.mutate(item.productId)}
                      disabled={saveForLaterMutation.isPending}
                      className="px-3 py-1.5 rounded-lg text-sm font-semibold
                        bg-gradient-to-br from-pink-50 via-pink-100 to-pink-200
                        dark:from-pink-900/30 dark:via-pink-900/40 dark:to-pink-900/50
                        text-pink-700 dark:text-pink-300
                        hover:from-pink-100 hover:via-pink-200 hover:to-pink-300
                        dark:hover:from-pink-900/40 dark:hover:via-pink-900/50 dark:hover:to-pink-900/60
                        transition-all duration-300 shadow-sm hover:shadow-md"
                    >
                      ♡ Save For Later
                    </button>

                    {/* Remove Button */}
                    <button
                      type="button"
                      onClick={() => removeMutation.mutate(item.productId)}
                      disabled={removeMutation.isPending}
                      className="px-3 py-1.5 rounded-lg text-sm font-semibold
                        bg-gradient-to-br from-red-50 via-red-100 to-red-200
                        dark:from-red-900/30 dark:via-red-900/40 dark:to-red-900/50
                        text-red-600 dark:text-red-400 
                        hover:from-red-100 hover:via-red-200 hover:to-red-300
                        dark:hover:from-red-900/40 dark:hover:via-red-900/50 dark:hover:to-red-900/60
                        disabled:opacity-50
                        transition-all duration-300 shadow-sm hover:shadow-md transform hover:scale-105"
                    >
                      Remove
                    </button>
                  </div>
                </div>

                {/* Subtotal */}
                <div className="text-center sm:text-right sm:self-start">
                  <p className="text-lg font-bold text-slate-800 dark:text-slate-100">
                    ₹{Number(item.subtotal).toLocaleString('en-IN')}
                  </p>
                  {item.quantity > 1 && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {item.quantity} × ₹{Number(item.unitPrice).toLocaleString('en-IN')}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Cart Summary - Right Side */}
        <div className="lg:col-span-1 space-y-4">
          <FreeShippingBar subtotal={total} />

          <CartCouponPanel subtotal={total} coupons={coupons} loading={couponsLoading} />

          <Card className="p-6 sticky top-20">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">Cart Summary</h2>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Total Items:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{totalItems}</span>
              </div>
              
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Subtotal:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">₹{Number(total).toLocaleString('en-IN')}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                  <span>Coupon savings:</span>
                  <span className="font-semibold">−₹{discount.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="border-t border-slate-200 dark:border-slate-700 pt-3">
                <div className="flex justify-between text-lg font-bold text-slate-800 dark:text-slate-100">
                  <span>Total:</span>
                  <span className="text-indigo-600 dark:text-indigo-400">₹{finalTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {discount > 0 && (
              <p className="text-sm text-emerald-600 dark:text-emerald-400 font-semibold mb-4">
                You save ₹{discount.toLocaleString('en-IN')} with {appliedCoupon.couponCode}!
              </p>
            )}

            <Button
              onClick={() => navigate('/checkout')}
              className="w-full py-3 text-lg"
              size="lg"
            >
              Proceed to Checkout
            </Button>

            <Link to="/products">
              <Button variant="secondary" className="w-full mt-3">
                Continue Shopping
              </Button>
            </Link>

            {/* Trust Badges */}
            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Secure Checkout</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Easy Returns</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Fast Delivery</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {savedItems.length > 0 && (
        <section className="mt-12">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">Saved for Later</h2>
          <div className="space-y-4">
            {savedItems.map((item) => (
              <Card key={item.id} className="p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link to={`/products/${item.productId}`} className="w-24 h-24 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-700 flex-shrink-0">
                    {item.imageUrl ? <img src={item.imageUrl} alt="" className="w-full h-full object-cover" /> : null}
                  </Link>
                  <div className="flex-1">
                    <Link to={`/products/${item.productId}`} className="font-semibold text-slate-800 dark:text-slate-100 hover:text-indigo-600">
                      {item.productName}
                    </Link>
                    <p className="text-indigo-600 font-bold mt-1">₹{Number(item.currentPrice).toLocaleString('en-IN')}</p>
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" onClick={() => moveSavedToCartMutation.mutate(item.productId)} disabled={(item.availableQuantity ?? 0) <= 0}>
                        Move to Cart
                      </Button>
                      <Button size="sm" variant="outline" className="text-red-600" onClick={() => removeSavedMutation.mutate(item.productId)}>
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
