import { axiosClient } from '../api/axiosClient';
import { extractApiData, extractApiPage } from '../utils/api';

export const inventoryService = {
  getVendorDashboard: () =>
    axiosClient.get('/api/inventory/vendor/dashboard').then(extractApiData),

  getVendorProducts: (status) =>
    axiosClient
      .get('/api/inventory/vendor/products', { params: status ? { status } : {} })
      .then(extractApiData),

  getVendorAnalytics: () =>
    axiosClient.get('/api/inventory/vendor/analytics').then(extractApiData),

  setStock: (productId, data) =>
    axiosClient.put(`/api/inventory/vendor/products/${productId}/stock`, data).then(extractApiData),

  increaseStock: (productId, data) =>
    axiosClient.post(`/api/inventory/vendor/products/${productId}/increase`, data).then(extractApiData),

  decreaseStock: (productId, data) =>
    axiosClient.post(`/api/inventory/vendor/products/${productId}/decrease`, data).then(extractApiData),

  updateThresholds: (productId, data) =>
    axiosClient.put(`/api/inventory/vendor/products/${productId}/thresholds`, data).then(extractApiData),

  updateAvailability: (productId, data) =>
    axiosClient.put(`/api/inventory/vendor/products/${productId}/availability`, data).then(extractApiData),

  bulkUpdate: (items) =>
    axiosClient.put('/api/inventory/vendor/products/bulk', { items }).then(extractApiData),

  uploadStockSheet: (csvContent) =>
    axiosClient.post('/api/inventory/vendor/products/upload-sheet', csvContent, {
      headers: { 'Content-Type': 'text/plain' },
    }).then(extractApiData),

  getVendorHistory: (params = {}) =>
    axiosClient.get('/api/inventory/vendor/history', { params }).then(extractApiPage),

  getProductHistory: (productId, params = {}) =>
    axiosClient.get(`/api/inventory/products/${productId}/history`, { params }).then(extractApiPage),

  getNotifications: (params = {}) =>
    axiosClient.get('/api/inventory/vendor/notifications', { params }).then(extractApiPage),

  markNotificationRead: (id) =>
    axiosClient.put(`/api/inventory/vendor/notifications/${id}/read`).then(extractApiData),

  getRestockStatus: (productId) =>
    axiosClient.get(`/api/inventory/products/${productId}/notify-me`).then(extractApiData),

  subscribeRestock: (productId) =>
    axiosClient.post(`/api/inventory/products/${productId}/notify-me`).then(extractApiData),

  unsubscribeRestock: (productId) =>
    axiosClient.delete(`/api/inventory/products/${productId}/notify-me`).then(extractApiData),

  getAdminDashboard: () =>
    axiosClient.get('/api/admin/inventory/dashboard').then(extractApiData),

  getAdminProducts: (params = {}) =>
    axiosClient.get('/api/admin/inventory/products', { params }).then(extractApiPage),

  adminSetStock: (productId, data) =>
    axiosClient.put(`/api/admin/inventory/products/${productId}/stock`, data).then(extractApiData),

  getAdminHistory: (params = {}) =>
    axiosClient.get('/api/admin/inventory/history', { params }).then(extractApiPage),
};
