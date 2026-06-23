import { axiosClient } from '../api/axiosClient';
import { extractApiData, extractApiPage } from '../utils/api';

export const discoveryService = {
  search: (params = {}) =>
    axiosClient.get('/api/discovery/search', { params }).then(extractApiPage),

  suggestions: (q) =>
    axiosClient.get('/api/discovery/suggestions', { params: { q } }).then(extractApiData),

  trending: () =>
    axiosClient.get('/api/discovery/trending').then(extractApiData),

  popular: (limit = 12) =>
    axiosClient.get('/api/discovery/popular', { params: { limit } }).then(extractApiData),

  similar: (productId, limit = 8) =>
    axiosClient.get(`/api/discovery/similar/${productId}`, { params: { limit } }).then(extractApiData),

  recentlyViewed: (sessionId, limit = 12) =>
    axiosClient.get('/api/discovery/recently-viewed', { params: { sessionId, limit } }).then(extractApiData),

  recordView: (productId, sessionId) =>
    axiosClient.post(`/api/discovery/views/${productId}`, null, { params: { sessionId } }).then(extractApiData),

  vendors: () =>
    axiosClient.get('/api/discovery/vendors').then(extractApiData),

  getHistory: () =>
    axiosClient.get('/api/discovery/history').then(extractApiData),

  clearHistory: () =>
    axiosClient.delete('/api/discovery/history').then(extractApiData),
};
