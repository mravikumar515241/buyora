import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { orderService } from '../../services/orderService';
import { cartService } from '../../services/cartService';
import { paymentService } from '../../services/paymentService';
import { couponService } from '../../services/couponService';
import { addressService } from '../../services/addressService';
import { useCartStore } from '../../store/cartStore';
import { useCouponStore } from '../../store/couponStore';
import { useActiveCoupons } from '../../hooks/usePromotions';
import { findBestCoupon } from '../../utils/promotionUtils';
import { useAutofillFix } from '../../hooks/useAutofillFix';
import { openRazorpayCheckout } from '../../utils/razorpay';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Confetti } from '../../components/ui/Confetti';

const schema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  phone: z.string().min(10, 'Valid 10-digit phone number required'),
  addressLine: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  postalCode: z.string().min(4, 'Valid postal code required'),
  country: z.string().min(2, 'Country is required'),
});

export function CheckoutPage() {
  useAutofillFix();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const setItemCount = useCartStore((s) => s.setItemCount);
  
  const [useNewAddress, setUseNewAddress] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  
  const { data: cart, isLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: () => cartService.get(),
  });
  
  // Fetch saved addresses
  const { data: addresses, isLoading: addressesLoading } = useQuery({
    queryKey: ['addresses'],
    queryFn: async () => {
      const response = await addressService.getAddresses();
      return response.data.data;
    },
  });
  
  // Auto-select default address
  useEffect(() => {
    if (addresses && addresses.length > 0 && !selectedAddressId) {
      const defaultAddr = addresses.find(a => a.isDefault);
      if (defaultAddr) {
        setSelectedAddressId(defaultAddr.id);
      } else {
        setSelectedAddressId(addresses[0].id);
      }
    }
  }, [addresses, selectedAddressId]);
  
  // Fetch available coupons
  const { data: availableCoupons = [] } = useActiveCoupons(20);
  const storedCoupon = useCouponStore((s) => s.appliedCoupon);
  const pendingCode = useCouponStore((s) => s.pendingCode);
  const setStoredCoupon = useCouponStore((s) => s.setAppliedCoupon);
  const clearStoredCoupon = useCouponStore((s) => s.clearCoupon);
  
  const items = cart?.items || [];
  const subtotal = cart?.totalAmount || 0;
  const shippingCost = subtotal > 0 ? (subtotal >= 499 ? 0 : 40) : 0;
  
  // Coupon state
  const [couponCode, setCouponCode] = useState(pendingCode || '');
  const [appliedCoupon, setAppliedCoupon] = useState(storedCoupon);
  const [offersExpanded, setOffersExpanded] = useState(true);
  const [couponError, setCouponError] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [confettiTrigger, setConfettiTrigger] = useState(0);

  useEffect(() => {
    if (storedCoupon?.couponCode && subtotal > 0) {
      setAppliedCoupon(storedCoupon);
      setCouponCode(storedCoupon.couponCode);
    }
  }, [storedCoupon, subtotal]);
  
  // Calculate totals with coupon
  const discount = appliedCoupon?.discountAmount || 0;
  const total = subtotal + shippingCost - discount;

  const [paymentPending, setPaymentPending] = useState(false);
  const [isMockMode, setIsMockMode] = useState(false);

  // Mutation for updating item quantity
  const updateQuantityMutation = useMutation({
    mutationFn: ({ productId, quantity }) => cartService.updateQuantity(productId, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  // Mutation for removing item
  const removeItemMutation = useMutation({
    mutationFn: (productId) => cartService.removeItem(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  const handleQuantityChange = (productId, currentQuantity, delta) => {
    const newQuantity = currentQuantity + delta;
    if (newQuantity > 0) {
      updateQuantityMutation.mutate({ productId, quantity: newQuantity });
    }
  };

  const handleRemoveItem = (productId) => {
    removeItemMutation.mutate(productId);
  };
  
  // Coupon handlers
  const handleApplyCoupon = async (codeOverride) => {
    const code = (codeOverride ?? couponCode).trim();
    if (!code) {
      setCouponError('Please enter a coupon code');
      return;
    }
    
    setIsApplyingCoupon(true);
    setCouponError('');
    
    try {
      const response = await couponService.validateCoupon({
        couponCode: code,
        orderAmount: subtotal + shippingCost,
      });
      
      if (response.valid) {
        setAppliedCoupon(response);
        setStoredCoupon(response);
        setCouponError('');
        setConfettiTrigger(prev => prev + 1);
      } else {
        setCouponError(response.message);
        setAppliedCoupon(null);
        clearStoredCoupon();
      }
    } catch (error) {
      setCouponError(error.response?.data?.message || 'Failed to validate coupon');
      setAppliedCoupon(null);
      clearStoredCoupon();
    } finally {
      setIsApplyingCoupon(false);
    }
  };
  
  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
    clearStoredCoupon();
  };

  const bestCoupon = findBestCoupon(availableCoupons, subtotal + shippingCost);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: '',
      phone: '',
      addressLine: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'India',
    },
  });

  const checkoutMutation = useMutation({
    mutationFn: (data = {}) => {
      let shippingAddress;
      let phone;

      // Use selected address or new address
      if (!useNewAddress && selectedAddressId) {
        const selectedAddr = addresses.find(a => a.id === selectedAddressId);
        if (!selectedAddr) {
          throw new Error('Please select a shipping address');
        }
        shippingAddress = `${selectedAddr.fullName}, ${selectedAddr.phoneNumber}, ${selectedAddr.streetAddress}, ${selectedAddr.city}, ${selectedAddr.state} - ${selectedAddr.pincode}, ${selectedAddr.country}`;
        phone = selectedAddr.phoneNumber;
      } else {
        shippingAddress = `${data.fullName}, ${data.phone}, ${data.addressLine}, ${data.city}, ${data.state} - ${data.postalCode}, ${data.country}`;
        phone = data.phone;
      }

      if (!phone?.trim()) {
        throw new Error('Phone number is required');
      }
      if (!shippingAddress?.trim()) {
        throw new Error('Shipping address is required');
      }

      return orderService.checkout({
        shippingAddress,
        phone: phone.trim(),
        couponCode: appliedCoupon?.couponCode || null,
      });
    },
    onSuccess: async (order) => {
      if (!order?.id) {
        console.error('Order creation failed: No order ID returned');
        return;
      }

      console.log('✅ Order created successfully:', order.id);
      
      // Clear cart immediately
      setItemCount(0);
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      
      // Start payment process
      setPaymentPending(true);
      
      try {
        const paymentData = await paymentService.createOrder(order.id);
        console.log('💳 Payment order created:', paymentData.razorpayOrderId);
        
        // Detect mock mode
        const mockMode = paymentData.keyId === 'mock_key_id' || 
                        paymentData.razorpayOrderId?.startsWith('order_mock_');
        setIsMockMode(mockMode);
        
        if (mockMode) {
          console.log('🔄 Mock payment mode activated');
        }
        
        // Open payment gateway (real or mock)
        await openRazorpayCheckout(paymentData, order, async (payload) => {
          console.log('✅ Payment completed, verifying...');
          try {
            await paymentService.verify({
              razorpayOrderId: payload.razorpayOrderId,
              razorpayPaymentId: payload.razorpayPaymentId,
              razorpaySignature: payload.razorpaySignature,
              orderId: order.id,
            });
            console.log('✅ Payment verified successfully');
            
            // Success! Navigate to order detail page
            navigate(`/orders/${order.id}`, {
              state: { message: 'Your order has been placed successfully!' },
            });
          } catch (e) {
            console.error('❌ Payment verification failed:', e);
            // Even if verification fails, show the order
            navigate(`/orders/${order.id}`, {
              state: { message: 'Order placed. Payment verification pending.' },
            });
          } finally {
            setPaymentPending(false);
          }
        });
      } catch (e) {
        console.error('❌ Payment initiation failed:', e);
        setPaymentPending(false);
        
        // Order is created, just payment failed - still show the order
        navigate(`/orders/${order.id}`, {
          state: { message: 'Order placed successfully. You can complete payment from your orders page.' },
        });
      }
    },
    onError: (error) => {
      console.error('❌ Order creation failed:', error);
    },
  });

  const isPending = checkoutMutation.isPending || paymentPending;

  // Loading state
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-48 mb-6" />
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded" />
              <div className="h-96 bg-slate-200 dark:bg-slate-700 rounded" />
            </div>
            <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded" />
          </div>
        </div>
      </div>
    );
  }

  // Empty cart state
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
              Add items to your cart before checkout
            </p>
            <div className="mt-8 flex gap-4 justify-center">
              <Button variant="secondary" onClick={() => navigate('/cart')}>
                Go to Cart
              </Button>
              <Button onClick={() => navigate('/products')}>
                Browse Products
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Confetti Animation with saved amount */}
      <Confetti trigger={confettiTrigger} savedAmount={discount} />
      
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Checkout</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">Complete your purchase</p>
      </div>

      {/* Mock Mode Indicator */}
      {isMockMode && paymentPending && (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100">Development Mode</h3>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                Mock payment in progress. This will auto-complete in a moment.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Side - Order Items & Shipping Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items Review */}
          <Card className="p-6">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">Order Items</h2>
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.cartItemId} className="flex flex-col sm:flex-row gap-4 pb-4 border-b border-slate-100 dark:border-slate-700 last:border-b-0 last:pb-0">
                  {/* Product Image */}
                  <div className="w-20 h-20 flex-shrink-0 bg-slate-100 dark:bg-slate-700 rounded-lg overflow-hidden">
                    {item.imageUrl ? (
                      <img 
                        src={item.imageUrl} 
                        alt={item.productName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-10 h-10 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Product Details & Controls */}
                  <div className="flex-1 min-w-0 flex flex-col sm:flex-row gap-3">
                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-800 dark:text-slate-100 truncate">{item.productName}</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        ₹{Number(item.unitPrice).toLocaleString('en-IN')} each
                      </p>
                      
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2 mt-3">
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(item.productId, item.quantity, -1)}
                          disabled={updateQuantityMutation.isPending}
                          className="w-8 h-8 rounded-lg border-2 border-slate-200 dark:border-slate-600 
                            bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 
                            dark:from-slate-700 dark:via-slate-800 dark:to-slate-900
                            flex items-center justify-center text-slate-700 dark:text-slate-200 
                            hover:from-slate-100 hover:via-slate-200 hover:to-slate-300
                            dark:hover:from-slate-600 dark:hover:via-slate-700 dark:hover:to-slate-800
                            disabled:opacity-40 disabled:cursor-not-allowed 
                            transition-all duration-300 shadow-sm hover:shadow-md transform hover:scale-105"
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>
                        <span className="w-12 text-center font-semibold text-slate-800 dark:text-slate-100">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(item.productId, item.quantity, 1)}
                          disabled={updateQuantityMutation.isPending}
                          className="w-8 h-8 rounded-lg border-2 border-slate-200 dark:border-slate-600 
                            bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 
                            dark:from-slate-700 dark:via-slate-800 dark:to-slate-900
                            flex items-center justify-center text-slate-700 dark:text-slate-200 
                            hover:from-slate-100 hover:via-slate-200 hover:to-slate-300
                            dark:hover:from-slate-600 dark:hover:via-slate-700 dark:hover:to-slate-800
                            disabled:opacity-40 disabled:cursor-not-allowed 
                            transition-all duration-300 shadow-sm hover:shadow-md transform hover:scale-105"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                        
                        {/* Remove Button */}
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.productId)}
                          disabled={removeItemMutation.isPending}
                          className="ml-2 p-2 rounded-lg
                            bg-gradient-to-br from-red-50 via-red-100 to-red-200
                            dark:from-red-900/30 dark:via-red-900/40 dark:to-red-900/50
                            text-red-600 dark:text-red-400 
                            hover:from-red-100 hover:via-red-200 hover:to-red-300
                            dark:hover:from-red-900/40 dark:hover:via-red-900/50 dark:hover:to-red-900/60
                            disabled:opacity-40 disabled:cursor-not-allowed 
                            transition-all duration-300 shadow-sm hover:shadow-md transform hover:scale-105"
                          aria-label="Remove item"
                          title="Remove from cart"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Subtotal */}
                    <div className="text-right sm:text-right flex-shrink-0">
                      <p className="font-bold text-slate-800 dark:text-slate-100">
                        ₹{Number(item.subtotal).toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Shipping Information Form */}
          <Card className="p-6">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">Shipping Information</h2>
            
            {/* Saved Addresses Selection */}
            {!addressesLoading && addresses && addresses.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Saved Addresses
                  </h3>
                  <button
                    type="button"
                    onClick={() => setUseNewAddress(!useNewAddress)}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {useNewAddress ? 'Use Saved Address' : '+ Add New Address'}
                  </button>
                </div>
                
                {!useNewAddress && (
                  <div className="grid grid-cols-1 gap-3 max-h-64 overflow-y-auto">
                    {addresses.map((address) => (
                      <label
                        key={address.id}
                        className={`
                          relative p-4 rounded-xl border-2 cursor-pointer transition-all
                          ${selectedAddressId === address.id
                            ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600'
                          }
                        `}
                      >
                        <input
                          type="radio"
                          name="savedAddress"
                          value={address.id}
                          checked={selectedAddressId === address.id}
                          onChange={() => setSelectedAddressId(address.id)}
                          className="sr-only"
                        />
                        {address.isDefault && (
                          <span className="absolute top-2 right-2 px-2 py-0.5 bg-blue-500 dark:bg-blue-600 text-white text-xs font-medium rounded-full">
                            Default
                          </span>
                        )}
                        <div className="space-y-1">
                          <p className="font-semibold text-slate-900 dark:text-white">
                            {address.fullName} • {address.phoneNumber}
                          </p>
                          <p className="text-sm text-slate-600 dark:text-slate-300">
                            {address.streetAddress}
                          </p>
                          <p className="text-sm text-slate-600 dark:text-slate-300">
                            {address.city}, {address.state} - {address.pincode}
                          </p>
                          {address.label && (
                            <span className="inline-block px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs rounded">
                              {address.label}
                            </span>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {/* New Address Form - Show if no saved addresses or user wants to add new */}
            {(useNewAddress || !addresses || addresses.length === 0) && (
              <form onSubmit={handleSubmit((data) => checkoutMutation.mutate(data))} className="space-y-4">
                {/* Full Name */}
                <Input
                  label="Full Name *"
                  placeholder="Enter your full name"
                  error={errors.fullName?.message}
                  autoComplete="name"
                  {...register('fullName')}
                />

                {/* Phone Number */}
                <Input
                  label="Phone Number *"
                  type="tel"
                  placeholder="10-digit mobile number"
                  error={errors.phone?.message}
                  autoComplete="tel"
                  {...register('phone')}
                />

                {/* Address Line */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2 tracking-tight">
                    Address Line *
                  </label>
                  <textarea
                    {...register('addressLine')}
                    placeholder="House no., Building name, Street"
                    rows="2"
                    autoComplete="street-address"
                    className={`w-full rounded-xl border px-4 py-3 
                      bg-white dark:bg-slate-800
                      text-slate-900 dark:text-slate-100 
                      placeholder-slate-400 dark:placeholder-slate-500 
                      focus:outline-none focus:ring-2 focus:ring-indigo-500/50 dark:focus:ring-indigo-400/50 
                      focus:border-indigo-500 dark:focus:border-indigo-400
                      hover:bg-slate-50 dark:hover:bg-slate-700
                      shadow-sm hover:shadow-md
                      transition-all duration-300
                      resize-none
                      ${errors.addressLine 
                        ? 'border-red-400 dark:border-red-500 focus:ring-red-500/50 dark:focus:ring-red-400/50' 
                        : 'border-slate-200 dark:border-slate-600'
                      }`}
                  />
                  {errors.addressLine && (
                    <p className="mt-2 text-sm font-medium text-red-600 dark:text-red-400 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.addressLine.message}
                    </p>
                  )}
                </div>

                {/* City and State */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="City *"
                    placeholder="City"
                    error={errors.city?.message}
                    autoComplete="address-level2"
                    {...register('city')}
                  />
                  <Input
                    label="State *"
                    placeholder="State"
                    error={errors.state?.message}
                    autoComplete="address-level1"
                    {...register('state')}
                  />
              </div>

              {/* Postal Code and Country */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Postal Code *"
                  placeholder="PIN Code"
                  error={errors.postalCode?.message}
                  autoComplete="postal-code"
                  {...register('postalCode')}
                />
                <Input
                  label="Country *"
                  placeholder="Country"
                  error={errors.country?.message}
                  autoComplete="country-name"
                  {...register('country')}
                />
              </div>

              {/* Error Message */}
              {checkoutMutation.error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-600 dark:text-red-300">
                    {checkoutMutation.error.response?.data?.message || 'Unable to place order. Please try again.'}
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full py-3 text-lg"
                disabled={isPending}
              >
                {isPending ? (
                  paymentPending ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Processing Payment...
                    </>
                  ) : (
                    'Placing Order...'
                  )
                ) : (
                  'Place Order'
                )}
              </Button>
            </form>
            )}
            
            {/* Proceed Button for Saved Address */}
            {!useNewAddress && addresses && addresses.length > 0 && selectedAddressId && (
              <>
                {checkoutMutation.error && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg mt-4">
                    <p className="text-sm text-red-600 dark:text-red-300">
                      {checkoutMutation.error.response?.data?.message || 'Unable to place order. Please try again.'}
                    </p>
                  </div>
                )}
                <Button
                  onClick={() => checkoutMutation.mutate({})}
                  className="w-full py-3 text-lg mt-4"
                  disabled={isPending}
                >
                  {isPending ? (
                    paymentPending ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Processing Payment...
                      </>
                    ) : (
                      'Placing Order...'
                    )
                  ) : (
                    'Proceed to Payment'
                  )}
                </Button>
              </>
            )}
          </Card>
        </div>

        {/* Right Side - Order Summary */}
        <div className="lg:col-span-1">
          <Card className="p-6 sticky top-20">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">Order Summary</h2>

            {/* Apply Coupon Section */}
            <div className="mb-6 pb-6 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                Apply Coupon
              </h3>
              
              {/* Best coupon suggestion */}
              {bestCoupon && !appliedCoupon && (
                <div className="mb-4 p-4 rounded-xl bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-950/40 dark:to-violet-950/40 border border-indigo-200 dark:border-indigo-800">
                  <p className="text-sm font-bold text-slate-900 dark:text-white mb-1">Best Savings Available</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                    Save ₹{bestCoupon.discountAmount.toLocaleString('en-IN')} using <strong>{bestCoupon.coupon.code}</strong>
                  </p>
                  <Button
                    type="button"
                    size="sm"
                    className="w-full min-h-[44px]"
                    onClick={() => {
                      setCouponCode(bestCoupon.coupon.code);
                      handleApplyCoupon(bestCoupon.coupon.code);
                    }}
                    disabled={isApplyingCoupon}
                  >
                    Apply {bestCoupon.coupon.code}
                  </Button>
                </div>
              )}

              {/* Available Offers */}
              {availableCoupons.length > 0 && !appliedCoupon && (
                <div className="mb-4 p-3 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/10 dark:to-purple-900/10 border border-indigo-200 dark:border-indigo-800/30">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <p className="text-xs font-semibold text-indigo-900 dark:text-indigo-200">🎉 Available Offers</p>
                    <button
                      type="button"
                      onClick={() => setOffersExpanded((v) => !v)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline min-h-[44px] px-2"
                      aria-expanded={offersExpanded}
                    >
                      {offersExpanded ? (
                        <>Collapse <ChevronUp className="w-3.5 h-3.5" /></>
                      ) : (
                        <>Show <ChevronDown className="w-3.5 h-3.5" /></>
                      )}
                    </button>
                  </div>
                  {offersExpanded && (
                  <div className="space-y-1.5">
                    {availableCoupons.slice(0, 3).map((coupon) => (
                      <button
                        key={coupon.id}
                        type="button"
                        onClick={() => {
                          setCouponCode(coupon.code);
                          setCouponError('');
                        }}
                        className="w-full flex items-center justify-between gap-2 p-2 rounded-lg bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-slate-700 transition-colors text-left group"
                      >
                        <span className="font-bold text-indigo-700 dark:text-indigo-300 text-sm">{coupon.code}</span>
                        <span className="text-xs text-slate-600 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                          {coupon.discountType === 'PERCENTAGE' 
                            ? `${coupon.discountValue}% OFF` 
                            : `₹${coupon.discountValue} OFF`}
                        </span>
                      </button>
                    ))}
                  </div>
                  )}
                </div>
              )}
              
              {appliedCoupon ? (
                <div className="relative p-5 rounded-xl bg-gradient-to-br from-emerald-50 via-green-50 to-emerald-50 dark:from-emerald-900/30 dark:via-green-900/20 dark:to-emerald-900/30 border-2 border-emerald-300 dark:border-emerald-600/50 animate-[slideIn_0.5s_ease-out] shadow-2xl overflow-hidden">
                  {/* Animated background gradient */}
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/0 via-emerald-400/20 to-emerald-400/0 animate-[shimmer_2s_ease-in-out_infinite]" />
                  
                  {/* Pulsing glow effect */}
                  <div className="absolute inset-0 rounded-xl bg-emerald-400/20 animate-pulse" style={{ animationDuration: '2s' }} />
                  
                  <div className="relative flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 animate-[bounceIn_0.6s_ease-out]">
                        <svg className="w-6 h-6 text-emerald-600 dark:text-emerald-400 animate-[checkPop_0.5s_ease-out]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="font-bold text-lg text-emerald-900 dark:text-emerald-100 uppercase tracking-wide">{appliedCoupon.couponCode}</span>
                        <span className="text-2xl animate-[rotate_1s_ease-in-out_infinite]">🎉</span>
                      </div>
                      <p className="text-base text-emerald-800 dark:text-emerald-200 font-bold flex items-center gap-1.5">
                        <span className="text-2xl">💰</span>
                        You saved ₹{Number(appliedCoupon.discountAmount).toLocaleString('en-IN')}!
                      </p>
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
                        ✨ Discount applied successfully
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="relative flex-shrink-0 p-2 rounded-lg text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200/50 dark:hover:bg-emerald-800/50 transition-all hover:scale-110 group"
                      aria-label="Remove coupon"
                    >
                      <svg className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => {
                        setCouponCode(e.target.value.toUpperCase());
                        setCouponError('');
                      }}
                      placeholder="Enter coupon code"
                      className="flex-1 px-4 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all uppercase"
                      disabled={isApplyingCoupon}
                    />
                    <Button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={isApplyingCoupon || !couponCode.trim()}
                      className="px-6"
                    >
                      {isApplyingCoupon ? 'Applying...' : 'Apply'}
                    </Button>
                  </div>
                  {couponError && (
                    <p className="mt-2 text-sm font-medium text-red-600 dark:text-red-400 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {couponError}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Items ({totalItems}):</span>
                <span>₹{Number(subtotal).toLocaleString('en-IN')}</span>
              </div>

              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Shipping:</span>
                <span className={shippingCost === 0 ? 'text-green-600 dark:text-green-400 font-semibold' : ''}>
                  {shippingCost === 0 ? 'FREE' : `₹${shippingCost}`}
                </span>
              </div>

              {subtotal < 500 && subtotal > 0 && (
                <p className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-2 rounded">
                  Add ₹{(500 - subtotal).toFixed(2)} more for free shipping
                </p>
              )}
              
              {/* Discount Row */}
              {appliedCoupon && discount > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    Discount:
                  </span>
                  <span>-₹{Number(discount).toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="border-t border-slate-200 dark:border-slate-700 pt-3">
                <div className="flex justify-between items-baseline">
                  <span className="text-lg font-bold text-slate-800 dark:text-slate-100">Total:</span>
                  <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                    ₹{Number(total).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="pt-6 border-t border-slate-200 dark:border-slate-700 space-y-3">
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
    </div>
  );
}
