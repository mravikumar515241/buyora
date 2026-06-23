import { useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderService } from '../../services/orderService';
import { paymentService } from '../../services/paymentService';
import { openRazorpayCheckout } from '../../utils/razorpay';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

const STATUS_FLOW = ['CREATED', 'PAID', 'CONFIRMED', 'SHIPPED', 'DELIVERED'];

const STATUS_INFO = {
  CREATED: { label: 'Order Placed', color: 'text-slate-600' },
  PAID: { label: 'Payment Completed', color: 'text-blue-600' },
  CONFIRMED: { label: 'Order Confirmed', color: 'text-indigo-600' },
  SHIPPED: { label: 'Order Shipped', color: 'text-orange-600' },
  DELIVERED: { label: 'Delivered', color: 'text-green-600' },
  CANCELLED: { label: 'Cancelled', color: 'text-red-600' },
};

function getStatusBadgeClass(status) {
  const classes = {
    CREATED: 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200',
    PAID: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
    CONFIRMED: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300',
    SHIPPED: 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300',
    DELIVERED: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
    CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
  };
  return classes[status] || 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200';
}

function formatDate(dateString) {
  if (!dateString) return '—';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function OrderStatusTimeline({ status }) {
  const isCancelled = status === 'CANCELLED';
  const currentIdx = STATUS_FLOW.indexOf(status);

  return (
    <Card className="p-6 mb-6">
      <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6">Order Status</h2>
      
      {/* Current Status */}
      <div className="mb-6 p-4 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/30 dark:to-blue-900/30 rounded-lg border border-indigo-100 dark:border-indigo-800">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isCancelled ? 'bg-red-600 dark:bg-red-500' : 'bg-indigo-600 dark:bg-indigo-500'}`}>
            {isCancelled ? (
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            )}
          </div>
          <div>
            <p className="text-sm text-slate-600 dark:text-slate-400">Current Status</p>
            <p className={`text-xl font-bold ${STATUS_INFO[status]?.color || 'text-slate-800 dark:text-slate-100'}`}>
              {STATUS_INFO[status]?.label || status}
            </p>
          </div>
        </div>
      </div>

      {/* Timeline */}
      {!isCancelled && (
        <div className="relative">
          {/* Mobile: Vertical Timeline */}
          <div className="flex flex-col gap-4 md:hidden">
            {STATUS_FLOW.map((s, i) => {
              const isCompleted = i <= currentIdx;
              const isCurrent = i === currentIdx;

              return (
                <div key={s} className="flex items-start gap-3">
                  {/* Circle */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 transition-all ${
                    isCompleted 
                      ? 'bg-indigo-600 dark:bg-indigo-500 text-white shadow-lg' 
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                  } ${isCurrent ? 'ring-4 ring-indigo-100 dark:ring-indigo-900' : ''}`}>
                    {isCompleted ? (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      i + 1
                    )}
                  </div>

                  {/* Label */}
                  <div className="flex-1">
                    <span className={`text-sm ${
                      isCompleted ? 'text-slate-800 dark:text-slate-100 font-semibold' : 'text-slate-500 dark:text-slate-400'
                    }`}>
                      {STATUS_INFO[s]?.label || s}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop: Horizontal Timeline */}
          <div className="hidden md:flex items-start justify-between">
            {STATUS_FLOW.map((s, i) => {
              const isCompleted = i <= currentIdx;
              const isCurrent = i === currentIdx;

              return (
                <div key={s} className="flex flex-col items-center flex-1 relative">
                  {/* Circle */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold z-10 transition-all ${
                    isCompleted 
                      ? 'bg-indigo-600 dark:bg-indigo-500 text-white shadow-lg' 
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                  } ${isCurrent ? 'ring-4 ring-indigo-100 dark:ring-indigo-900' : ''}`}>
                    {isCompleted ? (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      i + 1
                    )}
                  </div>

                  {/* Label */}
                  <span className={`text-xs mt-2 text-center max-w-[100px] ${
                    isCompleted ? 'text-slate-800 dark:text-slate-100 font-semibold' : 'text-slate-500 dark:text-slate-400'
                  }`}>
                    {STATUS_INFO[s]?.label || s}
                  </span>

                  {/* Connecting Line */}
                  {i < STATUS_FLOW.length - 1 && (
                    <div className={`absolute top-5 left-[calc(50%+20px)] right-[calc(-50%+20px)] h-0.5 -z-0 ${
                      isCompleted ? 'bg-indigo-600 dark:bg-indigo-500' : 'bg-slate-200 dark:bg-slate-700'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {isCancelled && (
        <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-800 dark:text-red-300 font-medium">
            This order has been cancelled
          </p>
        </div>
      )}
    </Card>
  );
}

export function OrderDetailPage() {
  const { id } = useParams();
  const location = useLocation();
  const queryClient = useQueryClient();
  const message = location.state?.message;
  const [paying, setPaying] = useState(false);

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: () => orderService.getById(id),
    enabled: !!id,
  });

  const payMutation = useMutation({
    mutationFn: () => paymentService.createOrder(order.id),
    onSuccess: (paymentData) => {
      openRazorpayCheckout(paymentData, order, async (payload) => {
        try {
          await paymentService.verify({
            razorpayOrderId: payload.razorpayOrderId,
            razorpayPaymentId: payload.razorpayPaymentId,
            razorpaySignature: payload.razorpaySignature,
            orderId: order.id,
          });
          queryClient.invalidateQueries({ queryKey: ['order', id] });
          window.location.reload(); // Refresh to show updated status
        } catch (e) {
          console.error('Payment verification failed:', e);
        } finally {
          setPaying(false);
        }
      });
    },
    onError: (e) => {
      console.error('Payment initiation failed:', e);
      setPaying(false);
    },
  });

  const handlePay = () => {
    setPaying(true);
    payMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-64" />
          <div className="h-40 bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <Card className="text-center py-16 backdrop-blur-xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/50 dark:border-slate-700/50">
            {/* 404 Icon */}
            <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-indigo-200 dark:from-indigo-900/50 dark:to-indigo-800/50 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            
            {/* Message */}
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              Order Not Found
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto">
              We couldn't find the order you're looking for. It may have been removed, or you might have entered an incorrect order number.
            </p>
            
            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <Link to="/orders" className="block">
                <Button className="glass-button">
                  <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  View My Orders
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
            
            {/* Help Text */}
            <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Need help? Contact our support team for assistance with your orders.
              </p>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  const totalItems = order.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-slate-500 dark:text-slate-400 mb-4">
        <Link to="/" className="hover:text-indigo-600 dark:hover:text-indigo-400">Home</Link>
        <span className="mx-2">/</span>
        <Link to="/orders" className="hover:text-indigo-600 dark:hover:text-indigo-400">Orders</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-700 dark:text-slate-300">Order #{order.id}</span>
      </nav>

      {/* Success Message */}
      {message && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <p className="text-green-800 dark:text-green-200 font-medium">{message}</p>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Order #{order.id}</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Placed on {formatDate(order.createdAt)}
          </p>
        </div>

        {/* Pay Now Button for unpaid orders */}
        {order.status === 'CREATED' && (
          <Button onClick={handlePay} disabled={paying} size="lg">
            {paying ? 'Processing...' : 'Complete Payment'}
          </Button>
        )}
      </div>

      {/* Order Status Timeline */}
      <OrderStatusTimeline status={order.status} />

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Side - Order Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Ordered Products */}
          <Card className="p-6">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">Ordered Products</h2>
            <div className="space-y-4">
              {order.items?.map((item, i) => (
                <div key={i} className="flex flex-col sm:flex-row gap-4 pb-4 border-b border-slate-100 dark:border-slate-700 last:border-b-0 last:pb-0">
                  {/* Product Image - Clickable */}
                  <Link 
                    to={`/products/${item.productId}`}
                    className="w-20 h-20 flex-shrink-0 mx-auto sm:mx-0 rounded-lg overflow-hidden hover:ring-2 hover:ring-blue-500 dark:hover:ring-blue-400 transition-all"
                  >
                    {item.imageUrl ? (
                      <img 
                        src={item.imageUrl} 
                        alt={item.productName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                        <svg className="w-10 h-10 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </Link>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0 text-center sm:text-left">
                    <Link 
                      to={`/products/${item.productId}`}
                      className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-lg truncate">
                        {item.productName}
                      </h3>
                    </Link>
                    <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
                      ₹{Number(item.priceAtOrder).toLocaleString('en-IN')} per unit
                    </p>
                    <p className="text-slate-600 dark:text-slate-400 text-sm">
                      Quantity: {item.quantity}
                    </p>
                  </div>

                  {/* Subtotal */}
                  <div className="text-center sm:text-right sm:self-start">
                    <p className="font-bold text-slate-800 dark:text-slate-100 text-lg">
                      ₹{Number(item.subtotal).toLocaleString('en-IN')}
                    </p>
                    {item.quantity > 1 && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {item.quantity} × ₹{Number(item.priceAtOrder).toLocaleString('en-IN')}
                      </p>
                    )}
                  </div>
                </div>
              ))}

              {/* Total */}
              <div className="flex flex-col sm:flex-row justify-between items-center gap-2 pt-4 border-t-2 border-slate-200 dark:border-slate-700">
                <span className="text-lg font-bold text-slate-800 dark:text-slate-100">Order Total:</span>
                <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                  ₹{Number(order.totalAmount).toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </Card>

          {/* Shipping Address */}
          <Card className="p-6">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">Shipping Address</h2>
            <div className="space-y-2">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-slate-400 dark:text-slate-500 mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div className="flex-1">
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                    {order.shippingAddress}
                  </p>
                </div>
              </div>

              {order.phone && (
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-slate-400 dark:text-slate-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <p className="text-slate-700 dark:text-slate-300">{order.phone}</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Right Side - Order Summary */}
        <div className="lg:col-span-1">
          <Card className="p-6 sticky top-20">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">Order Summary</h2>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-400">Order ID:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-100">#{order.id}</span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-400">Order Date:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-100">
                  {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN') : '—'}
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-400">Total Items:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-100">{totalItems}</span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-400">Status:</span>
                <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusBadgeClass(order.status)}`}>
                  {order.status}
                </span>
              </div>

              <div className="border-t border-slate-200 dark:border-slate-700 pt-3 mt-3">
                <div className="flex justify-between items-baseline">
                  <span className="text-lg font-bold text-slate-800 dark:text-slate-100">Total Amount:</span>
                  <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                    ₹{Number(order.totalAmount).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3 pt-6 border-t border-slate-200 dark:border-slate-700">
              {order.status === 'CREATED' && (
                <Button onClick={handlePay} disabled={paying} className="w-full">
                  {paying ? 'Processing...' : 'Complete Payment'}
                </Button>
              )}

              <Link to="/orders" className="block">
                <Button variant="secondary" className="w-full">
                  Back to Orders
                </Button>
              </Link>

              <Link to="/products" className="block">
                <Button variant="ghost" className="w-full">
                  Continue Shopping
                </Button>
              </Link>
            </div>

            {/* Help Text */}
            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Need help?</p>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Contact support for order-related queries
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
