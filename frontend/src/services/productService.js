import { axiosClient } from '../api/axiosClient';
import { extractApiData, extractApiPage } from '../utils/api';

export const productService = {
  list: (params = {}) =>
    axiosClient.get('/api/products', { params }).then(extractApiPage),

  getById: (id) =>
    axiosClient.get(`/api/products/${id}`).then(extractApiData),

  byCategory: (categoryId, params = {}) =>
    axiosClient.get(`/api/products/category/${categoryId}`, { params }).then(extractApiPage),

  create: (data) =>
    axiosClient.post('/api/products', data).then(extractApiData),

  update: (id, data) =>
    axiosClient.put(`/api/products/${id}`, data).then(extractApiData),

  delete: (id) =>
    axiosClient.delete(`/api/products/${id}`).then(extractApiData),

  myProducts: (params = {}) =>
    axiosClient.get('/api/products/vendor/me', { params }).then(extractApiPage),
};
