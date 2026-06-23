import axiosClient from '../api/axiosClient';

export const adminUserService = {
  getAllUsers: async (page = 0, size = 10, sortBy = 'createdAt', sortDir = 'DESC') => {
    const response = await axiosClient.get('/api/admin/users', {
      params: { page, size, sortBy, sortDir }
    });
    return response.data;
  },

  getUserById: async (id) => {
    const response = await axiosClient.get(`/api/admin/users/${id}`);
    return response.data;
  },

  updateUserRoles: async (id, roles) => {
    const response = await axiosClient.put(`/api/admin/users/${id}/roles`, { roles });
    return response.data;
  },

  deleteUser: async (id) => {
    const response = await axiosClient.delete(`/api/admin/users/${id}`);
    return response.data;
  },

  toggleUserActiveStatus: async (id) => {
    const response = await axiosClient.put(`/api/admin/users/${id}/toggle-active`);
    return response.data;
  },

  getAllVendors: async (page = 0, size = 10, sortBy = 'createdAt', sortDir = 'DESC') => {
    const response = await axiosClient.get('/api/admin/vendors', {
      params: { page, size, sortBy, sortDir }
    });
    return response.data;
  },

  getVendorById: async (id) => {
    const response = await axiosClient.get(`/api/admin/vendors/${id}`);
    return response.data;
  },

  approveVendor: async (id) => {
    const response = await axiosClient.put(`/api/admin/vendors/${id}/approve`);
    return response.data;
  },

  rejectVendor: async (id) => {
    const response = await axiosClient.put(`/api/admin/vendors/${id}/reject`);
    return response.data;
  },

  deleteVendor: async (id) => {
    const response = await axiosClient.delete(`/api/admin/vendors/${id}`);
    return response.data;
  }
};
