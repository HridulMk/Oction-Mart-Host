import axios from 'axios';
import { config } from '@/config/environment';
import toast from 'react-hot-toast';
import { authService } from './services/auth';

const API_BASE = config.API_BASE_URL || 'http://localhost:8000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});

// Request interceptor: attach Bearer token if available
api.interceptors.request.use(
  (requestConfig) => {
    if (typeof window !== 'undefined') {
      const accessToken = localStorage.getItem('accessToken');
      if (accessToken) {
        requestConfig.headers.Authorization = `Bearer ${accessToken}`;
      }
    }
    return requestConfig;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: global error handling with token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response) {
      const { status, data } = error.response;
      const url = error.config?.url;
      const originalRequest = error.config;

      // console.error("API error:", { status, data, url });

      // Handle 401 errors with token refresh
      if (status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        try {
          const { access } = await authService.refreshToken();
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return api(originalRequest); // Retry original request
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          toast.error('Session expired. Please log in again.');
          if (typeof window !== 'undefined') {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            window.location.href = '/buyer-login-app';
          }
          return Promise.reject(refreshError);
        }
      }

      // Show toast notifications for other errors
      switch (status) {
        case 403:
          toast.error('Access forbidden.');
          break;
        case 404:
          toast.error(`Resource not found: ${url}`);
          break;
        case 500:
          toast.error('Server error. Please try again later.');
          break;
        default:
          toast.error(data?.detail || 'Unexpected API error');
      }
    } else if (error.request) {
      console.error('Network error:', error.request);
      toast.error('Network error. Please check your internet connection.');
    } else {
      console.error('Unexpected error:', error.message);
      toast.error(`Error: ${error.message}`);
    }

    return Promise.reject(error);
  }
);

// Specific API calls (example)
export const getSellerItems = async () => {
  const res = await api.get('/seller/items/');
  return res.data;
};

export const getApprovedAuctioneers = async () => {
  const res = await api.get('/auctioneers/approved/');
  return res.data;
};

export const deleteSellerItem = async (id: number) => {
  const res = await api.delete(`/seller/items/${id}/`);
  return res.data;
};

export const updateSellerItem = async (id: number, data: any) => {
  const res = await api.patch(`/seller/items/${id}/`, data);
  return res.data;
};

export default api;