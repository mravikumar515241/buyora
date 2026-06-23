import { axiosClient } from '../api/axiosClient';
import { extractApiData } from '../utils/api';

export const paymentService = {
  createOrder: (orderId) =>
    axiosClient.post('/api/payments/create-order', { orderId }).then(extractApiData),

  verify: (payload) =>
    axiosClient.post('/api/payments/verify', payload).then(extractApiData),
};
