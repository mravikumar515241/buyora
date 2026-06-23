import { axiosClient } from '../api/axiosClient';

const extractApiData = (res) => res.data?.data || res.data;

export const couponService = {
  // Get all active coupons
  getActiveCoupons: (params) => 
    axiosClient.get('/api/coupons', { params }).then(extractApiData),

  // Validate coupon
  validateCoupon: (data) => 
    axiosClient.post('/api/coupons/validate', data).then(extractApiData),

  // Admin: Get all coupons
  getAllCoupons: (params) => 
    axiosClient.get('/api/admin/coupons', { params }).then(extractApiData),

  // Admin: Get coupon by ID
  getCouponById: (id) => 
    axiosClient.get(`/api/admin/coupons/${id}`).then(extractApiData),

  // Admin: Create coupon
  createCoupon: (data) => 
    axiosClient.post('/api/admin/coupons', data).then(extractApiData),

  // Admin: Update coupon
  updateCoupon: (id, data) => 
    axiosClient.put(`/api/admin/coupons/${id}`, data).then(extractApiData),

  // Admin: Delete coupon
  deleteCoupon: (id) => 
    axiosClient.delete(`/api/admin/coupons/${id}`).then(extractApiData),
};
