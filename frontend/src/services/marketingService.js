import { axiosClient } from '../api/axiosClient';

const extract = (res) => res.data?.data ?? res.data;

export const marketingService = {
  getHomepage: (sessionId) =>
    axiosClient.get('/api/marketing/homepage', { params: sessionId ? { sessionId } : {} }).then(extract),

  // Admin
  getAnalytics: () => axiosClient.get('/api/admin/marketing/analytics').then(extract),
  getAuditLogs: (params) => axiosClient.get('/api/admin/marketing/audit-logs', { params }).then(extract),

  listBanners: () => axiosClient.get('/api/admin/marketing/banners').then(extract),
  createBanner: (data) => axiosClient.post('/api/admin/marketing/banners', data).then(extract),
  updateBanner: (id, data) => axiosClient.put(`/api/admin/marketing/banners/${id}`, data).then(extract),
  deleteBanner: (id) => axiosClient.delete(`/api/admin/marketing/banners/${id}`).then(extract),
  reorderBanners: (orderedIds) => axiosClient.put('/api/admin/marketing/banners/reorder', { orderedIds }).then(extract),

  listCampaigns: () => axiosClient.get('/api/admin/marketing/campaigns').then(extract),
  createCampaign: (data) => axiosClient.post('/api/admin/marketing/campaigns', data).then(extract),
  updateCampaign: (id, data) => axiosClient.put(`/api/admin/marketing/campaigns/${id}`, data).then(extract),
  deleteCampaign: (id) => axiosClient.delete(`/api/admin/marketing/campaigns/${id}`).then(extract),

  listFlashSales: () => axiosClient.get('/api/admin/marketing/flash-sales').then(extract),
  createFlashSale: (data) => axiosClient.post('/api/admin/marketing/flash-sales', data).then(extract),
  updateFlashSale: (id, data) => axiosClient.put(`/api/admin/marketing/flash-sales/${id}`, data).then(extract),
  deleteFlashSale: (id) => axiosClient.delete(`/api/admin/marketing/flash-sales/${id}`).then(extract),

  listSections: () => axiosClient.get('/api/admin/marketing/homepage-sections').then(extract),
  updateSections: (sections) => axiosClient.put('/api/admin/marketing/homepage-sections', { sections }).then(extract),

  listAnnouncements: () => axiosClient.get('/api/admin/marketing/announcements').then(extract),
  createAnnouncement: (data) => axiosClient.post('/api/admin/marketing/announcements', data).then(extract),
  updateAnnouncement: (id, data) => axiosClient.put(`/api/admin/marketing/announcements/${id}`, data).then(extract),
  deleteAnnouncement: (id) => axiosClient.delete(`/api/admin/marketing/announcements/${id}`).then(extract),

  listMedia: () => axiosClient.get('/api/admin/marketing/media').then(extract),
  createMedia: (data) => axiosClient.post('/api/admin/marketing/media', data).then(extract),
  deleteMedia: (id) => axiosClient.delete(`/api/admin/marketing/media/${id}`).then(extract),

  listVendorPromotions: (status) =>
    axiosClient.get('/api/admin/marketing/vendor-promotions', { params: status ? { status } : {} }).then(extract),
  reviewVendorPromotion: (id, data) =>
    axiosClient.put(`/api/admin/marketing/vendor-promotions/${id}/review`, data).then(extract),
};

export const DEFAULT_HOMEPAGE_SECTIONS = [];

export const SECTION_TYPES = [
  { value: 'HERO_CAROUSEL', label: 'Hero Carousel' },
  { value: 'BANNER_GRID', label: 'Banner Grid' },
  { value: 'FLASH_SALE', label: 'Flash Sale' },
  { value: 'PRODUCT_CAROUSEL', label: 'Product Carousel' },
  { value: 'CATEGORY_LIST', label: 'Category List' },
  { value: 'COUPON_LIST', label: 'Coupon List' },
  { value: 'VENDOR_SPOTLIGHT', label: 'Vendor Spotlight' },
];

export const PRODUCT_SOURCES = [
  { value: 'trending', label: 'Trending' },
  { value: 'best_selling', label: 'Best Sellers' },
  { value: 'newest', label: 'New Arrivals' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'most_wishlisted', label: 'Most Wishlisted' },
  { value: 'recently_viewed', label: 'Recently Viewed' },
  { value: 'recommended', label: 'Recommended' },
  { value: 'featured', label: 'Featured' },
  { value: 'curated', label: 'Curated (product IDs)' },
];
