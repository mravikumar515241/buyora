import { axiosClient } from '../api/axiosClient';
import { extractApiData, extractApiPage } from '../utils/api';

export const adminService = {
  // Products
  products: (params = {}) =>
    axiosClient.get('/api/admin/products', { params }).then(extractApiPage),

  getProduct: (id) =>
    axiosClient.get(`/api/admin/products/${id}`).then(extractApiData),

  approveProduct: (id) =>
    axiosClient.patch(`/api/admin/products/${id}/approve`).then(extractApiData),

  rejectProduct: (id, rejectionReason) =>
    axiosClient.patch(`/api/admin/products/${id}/reject`, { rejectionReason }).then(extractApiData),

  requestModification: (id, comments) =>
    axiosClient.patch(`/api/admin/products/${id}/request-modification`, { comments }).then(extractApiData),

  // Orders
  updateOrderStatus: (id, status) =>
    axiosClient.patch(`/api/admin/orders/${id}/status`, null, { params: { status } }).then(extractApiData),

  orders: (params = {}) =>
    axiosClient.get('/api/admin/orders', { params }).then(extractApiPage),

  // Analytics
  analytics: () =>
    axiosClient.get('/api/admin/analytics/dashboard').then(extractApiData),

  // Reviews moderation
  reviews: (params = {}) =>
    axiosClient.get('/api/admin/reviews', { params }).then(extractApiPage),

  deleteReview: (id) =>
    axiosClient.delete(`/api/admin/reviews/${id}`).then(extractApiData),

  hideReview: (id, reason) =>
    axiosClient.post(`/api/admin/reviews/${id}/hide`, { reason }).then(extractApiData),

  restoreReview: (id, reason) =>
    axiosClient.post(`/api/admin/reviews/${id}/restore`, { reason }).then(extractApiData),

  reviewAnalytics: () =>
    axiosClient.get('/api/admin/reviews/analytics').then(extractApiData),

  discoveryAnalytics: () =>
    axiosClient.get('/api/admin/discovery/analytics').then(extractApiData),
};
