import axiosClient from '../api/axiosClient';

export const addressService = {
  getAddresses: () => axiosClient.get('/api/addresses'),
  
  getAddressById: (id) => axiosClient.get(`/api/addresses/${id}`),
  
  getDefaultAddress: () => axiosClient.get('/api/addresses/default'),
  
  createAddress: (data) => axiosClient.post('/api/addresses', data),
  
  updateAddress: (id, data) => axiosClient.put(`/api/addresses/${id}`, data),
  
  deleteAddress: (id) => axiosClient.delete(`/api/addresses/${id}`),
  
  setDefaultAddress: (id) => axiosClient.put(`/api/addresses/${id}/set-default`),
};
