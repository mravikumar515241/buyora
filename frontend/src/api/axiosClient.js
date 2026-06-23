import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const token = localStorage.getItem('token');
      if (token) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    } else if (error.response?.status === 403) {
      const event = new CustomEvent('toast', { detail: { type: 'error', message: 'You do not have permission.' } });
      window.dispatchEvent(event);
    } else if (error.response?.status >= 500) {
      const event = new CustomEvent('toast', { detail: { type: 'error', message: error.response?.data?.message || 'Server error. Please try again.' } });
      window.dispatchEvent(event);
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
