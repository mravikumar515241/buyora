import { axiosClient } from '../api/axiosClient';
import { extractApiData } from '../utils/api';

export const vendorService = {
  register: (data) =>
    axiosClient.post('/api/vendors/register', data).then(extractApiData),

  getMe: () =>
    axiosClient.get('/api/vendors/me').then(extractApiData),

  updateMe: (data) =>
    axiosClient.put('/api/vendors/me', data).then(extractApiData),

  getProfile: (vendorId) =>
    axiosClient.get(`/api/vendors/${vendorId}`).then(extractApiData),
};
