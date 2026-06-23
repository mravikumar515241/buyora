import { axiosClient } from '../api/axiosClient';
import { extractApiData, extractApiPage } from '../utils/api';

export const orderService = {
  checkout: (data) =>
    axiosClient.post('/api/orders/checkout', data).then(extractApiData),

  myOrders: (params = {}) =>
    axiosClient.get('/api/orders', { params }).then(extractApiPage),

  getById: (id) =>
    axiosClient.get(`/api/orders/${id}`).then(extractApiData),
};
