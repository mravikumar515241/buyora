const SCRIPT_URL = 'https://checkout.razorpay.com/v1/checkout.js';

function loadScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = SCRIPT_URL;
    script.async = true;
    script.onload = resolve;
    script.onerror = resolve;
    document.body.appendChild(script);
  });
}

/**
 * Check if payment is in mock mode
 */
function isMockPayment(paymentData) {
  return paymentData.keyId === 'mock_key_id' || 
         paymentData.razorpayOrderId?.startsWith('order_mock_');
}

/**
 * Simulate mock payment for development
 */
function simulateMockPayment(paymentData, order, onSuccess) {
  return new Promise((resolve) => {
    // Simulate payment delay
    setTimeout(() => {
      // Create mock payment response
      const mockResponse = {
        razorpayPaymentId: `pay_mock_${Date.now()}`,
        razorpayOrderId: paymentData.razorpayOrderId,
        razorpaySignature: `mock_signature_${Date.now()}`,
      };
      
      // Call success callback
      onSuccess(mockResponse);
      resolve();
    }, 1500); // 1.5 second delay to simulate payment processing
  });
}

/**
 * @param {{ keyId: string, razorpayOrderId: string, amount: string, currency: string }} paymentData
 * @param {{ id: number }} order
 * @param {(payload: { razorpayPaymentId: string, razorpayOrderId: string, razorpaySignature: string }) => Promise<void>} onSuccess
 */
export function openRazorpayCheckout(paymentData, order, onSuccess) {
  // Check if this is a mock payment
  if (isMockPayment(paymentData)) {
    console.log('🔄 Mock payment mode detected - simulating payment...');
    return simulateMockPayment(paymentData, order, onSuccess);
  }
  
  // Real Razorpay integration
  return loadScript().then(() => {
    if (!window.Razorpay) {
      return Promise.reject(new Error('Razorpay failed to load'));
    }
    const amount = Number(paymentData.amount) || 0; // paise
    const options = {
      key: paymentData.keyId,
      amount,
      currency: paymentData.currency || 'INR',
      order_id: paymentData.razorpayOrderId,
      name: 'Buyora',
      description: `Order #${order.id}`,
      handler: function (response) {
        onSuccess({
          razorpayPaymentId: response.razorpay_payment_id,
          razorpayOrderId: response.razorpay_order_id,
          razorpaySignature: response.razorpay_signature,
        });
      },
      modal: {
        ondismiss: function() {
          console.log('Payment cancelled by user');
        }
      },
      theme: {
        color: '#4F46E5' // Indigo color matching the app theme
      }
    };
    const rzp = new window.Razorpay(options);
    rzp.open();
  });
}
