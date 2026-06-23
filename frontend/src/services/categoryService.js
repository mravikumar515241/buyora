import { axiosClient } from '../api/axiosClient';
import { extractApiData, extractApiList } from '../utils/api';

export const categoryService = {
  list: () =>
    axiosClient.get('/api/categories').then((res) => extractApiList(res) ?? []),

  getById: (id) =>
    axiosClient.get(`/api/categories/${id}`).then(extractApiData),

  create: (data) =>
    axiosClient.post('/api/categories', data).then(extractApiData),

  update: (id, data) =>
    axiosClient.put(`/api/categories/${id}`, data).then(extractApiData),

  delete: (id) =>
    axiosClient.delete(`/api/categories/${id}`).then(extractApiData),
};
