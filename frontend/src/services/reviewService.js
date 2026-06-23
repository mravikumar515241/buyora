import { axiosClient } from '../api/axiosClient';
import { extractApiData, extractApiPage } from '../utils/api';

export const reviewService = {
  getByProduct: (productId, params = {}) =>
    axiosClient.get(`/api/reviews/products/${productId}`, { params }).then(extractApiPage),

  getSummary: (productId) =>
    axiosClient.get(`/api/reviews/products/${productId}/summary`).then(extractApiData),

  canReview: (productId) =>
    axiosClient.get(`/api/reviews/products/${productId}/can-review`).then(extractApiData),

  create: (productId, data) =>
    axiosClient.post(`/api/reviews/products/${productId}`, data).then(extractApiData),

  update: (reviewId, data) =>
    axiosClient.put(`/api/reviews/${reviewId}`, data).then(extractApiData),

  delete: (reviewId) =>
    axiosClient.delete(`/api/reviews/${reviewId}`).then(extractApiData),

  vote: (reviewId, helpful) =>
    axiosClient.post(`/api/reviews/${reviewId}/vote`, null, { params: { helpful } }).then(extractApiData),
};
