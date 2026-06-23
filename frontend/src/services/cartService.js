import { axiosClient } from '../api/axiosClient';
import { extractApiData } from '../utils/api';

export const cartService = {
  get: () =>
    axiosClient.get('/api/cart').then(extractApiData),

  addItem: (productId, quantity = 1) =>
    axiosClient.post('/api/cart/items', null, { params: { productId, quantity } }).then(extractApiData),

  updateQuantity: (productId, quantity) =>
    axiosClient.put(`/api/cart/items/${productId}`, null, { params: { quantity } }).then(extractApiData),

  removeItem: (productId) =>
    axiosClient.delete(`/api/cart/items/${productId}`).then(extractApiData),
};
