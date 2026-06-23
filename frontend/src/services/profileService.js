import axiosClient from '../api/axiosClient';

export const profileService = {
  getProfile: () => axiosClient.get('/api/profile'),
  
  updateProfile: (data) => axiosClient.put('/api/profile', data),
};
