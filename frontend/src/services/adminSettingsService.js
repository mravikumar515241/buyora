import axiosClient from '../api/axiosClient';

export const adminSettingsService = {
  getAllSettings: async () => {
    const response = await axiosClient.get('/api/admin/settings');
    return response.data;
  },

  getSetting: async (key) => {
    const response = await axiosClient.get(`/api/admin/settings/${key}`);
    return response.data;
  },

  updateSetting: async (key, value) => {
    const response = await axiosClient.put(`/api/admin/settings/${key}`, { value });
    return response.data;
  },
};
