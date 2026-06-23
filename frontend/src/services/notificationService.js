import { axiosClient } from '../api/axiosClient';

const extract = (res) => res.data?.data ?? res.data;

export const notificationService = {
  list: (params) => axiosClient.get('/api/notifications', { params }).then(extract),
  recent: (limit = 8) => axiosClient.get('/api/notifications/recent', { params: { limit } }).then(extract),
  unreadCount: () => axiosClient.get('/api/notifications/unread-count').then(extract),
  markRead: (id) => axiosClient.put(`/api/notifications/${id}/read`).then(extract),
  markAllRead: () => axiosClient.put('/api/notifications/read-all').then(extract),
  delete: (id) => axiosClient.delete(`/api/notifications/${id}`).then(extract),
  clearAll: () => axiosClient.delete('/api/notifications/clear-all').then(extract),
  getPreferences: () => axiosClient.get('/api/notifications/preferences').then(extract),
  updatePreferences: (data) => axiosClient.put('/api/notifications/preferences', data).then(extract),

  // Admin announcements
  listAnnouncements: () => axiosClient.get('/api/admin/announcements').then(extract),
  createAnnouncement: (data) => axiosClient.post('/api/admin/announcements', data).then(extract),
  updateAnnouncement: (id, data) => axiosClient.put(`/api/admin/announcements/${id}`, data).then(extract),
  deleteAnnouncement: (id) => axiosClient.delete(`/api/admin/announcements/${id}`).then(extract),
};
