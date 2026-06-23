import { axiosClient } from '../api/axiosClient';
import { extractApiData } from '../utils/api';

export const authService = {
  register: (data) =>
    axiosClient.post('/api/auth/register', data).then(extractApiData),

  registerVendor: (data) =>
    axiosClient.post('/api/auth/register/vendor', data).then(extractApiData),

  login: (data) =>
    axiosClient.post('/api/auth/login', data).then(extractApiData),

  me: () =>
    axiosClient.get('/api/auth/me').then(extractApiData),
};
