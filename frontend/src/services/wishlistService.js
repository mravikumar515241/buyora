import { axiosClient } from '../api/axiosClient';
import { extractApiData } from '../utils/api';

export const wishlistService = {
  get: (params = {}) =>
    axiosClient.get('/api/wishlist', { params }).then(extractApiData),

  getLists: () =>
    axiosClient.get('/api/wishlist/lists').then(extractApiData),

  createList: (data) =>
    axiosClient.post('/api/wishlist/lists', data).then(extractApiData),

  updateList: (id, data) =>
    axiosClient.put(`/api/wishlist/lists/${id}`, data).then(extractApiData),

  deleteList: (id) =>
    axiosClient.delete(`/api/wishlist/lists/${id}`).then(extractApiData),

  regenerateShareLink: (id) =>
    axiosClient.post(`/api/wishlist/lists/${id}/share`).then(extractApiData),

  getShared: (shareToken) =>
    axiosClient.get(`/api/wishlist/shared/${shareToken}`).then(extractApiData),

  getSharedItems: (shareToken, params = {}) =>
    axiosClient.get(`/api/wishlist/shared/${shareToken}/items`, { params }).then(extractApiData),

  getCount: () =>
    axiosClient.get('/api/wishlist/count').then(extractApiData),

  getRecent: (limit = 5) =>
    axiosClient.get('/api/wishlist/recent', { params: { limit } }).then(extractApiData),

  getStatus: (productId) =>
    axiosClient.get(`/api/wishlist/products/${productId}/status`).then(extractApiData),

  add: (productId, collectionId) =>
    axiosClient.post('/api/wishlist/items', null, { params: { productId, collectionId } }).then(extractApiData),

  remove: (productId) =>
    axiosClient.delete(`/api/wishlist/items/${productId}`).then(extractApiData),

  toggle: (productId, collectionId) =>
    axiosClient.post(`/api/wishlist/toggle/${productId}`, null, { params: { collectionId } }).then(extractApiData),

  moveItem: (productId, targetCollectionId) =>
    axiosClient.post(`/api/wishlist/items/${productId}/move`, null, { params: { targetCollectionId } }).then(extractApiData),

  getSaved: () =>
    axiosClient.get('/api/wishlist/saved').then(extractApiData),

  saveForLater: (productId) =>
    axiosClient.post(`/api/wishlist/save-for-later/${productId}`).then(extractApiData),

  removeSaved: (productId) =>
    axiosClient.delete(`/api/wishlist/saved/${productId}`).then(extractApiData),

  moveSavedToCart: (productId) =>
    axiosClient.post(`/api/wishlist/saved/${productId}/move-to-cart`).then(extractApiData),

  getVendorStats: () =>
    axiosClient.get('/api/wishlist/vendor/stats').then(extractApiData),

  getAdminTop: (limit = 10) =>
    axiosClient.get('/api/admin/wishlist/top', { params: { limit } }).then(extractApiData),

  getAdminAnalytics: () =>
    axiosClient.get('/api/admin/wishlist/analytics').then(extractApiData),
};
