import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor to handle API responses
api.interceptors.response.use(
  (response) => {
    // GameFlip API returns {status: "SUCCESS", data: ...}
    if (response.data?.status === 'SUCCESS') {
      return { ...response, data: response.data.data };
    }
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;

// API endpoints
export const endpoints = {
  dashboard: {
    summary: () => api.get('/dashboard/summary'),
    listings: (status?: string) => 
      api.get('/dashboard/listings', { params: status ? { status } : {} }),
  },
  analytics: {
    overview: () => api.get('/analytics/overview'),
    listings: () => api.get('/analytics/listings'),
    sales: () => api.get('/analytics/sales'),
    alerts: () => api.get('/analytics/alerts'),
  },
  listings: {
    list: (params?: any) => api.get('/listings', { params }),
    get: (id: string) => api.get(`/listings/${id}`),
    create: (data: any) => api.post('/listings', data),
    update: (id: string, data: any) => api.patch(`/listings/${id}`, data),
    delete: (id: string) => api.delete(`/listings/${id}`),
    updateStatus: (id: string, status: string) => 
      api.put(`/listings/${id}/status`, { status }),
    uploadPhoto: (id: string, photo: File) => {
      const formData = new FormData();
      formData.append('photo', photo);
      return api.post(`/listings/${id}/photo`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    updateDigitalGoods: (id: string, code: string) =>
      api.put(`/listings/${id}/digital-goods`, { code }),
  },
  competitors: {
    list: () => api.get('/competitors'),
    get: (id: string) => api.get(`/competitors/${id}`),
    create: (data: any) => api.post('/competitors', data),
    delete: (id: string) => api.delete(`/competitors/${id}`),
    listings: (id: string, params?: any) =>
      api.get(`/competitors/${id}/listings`, { params }),
    analytics: (id: string) => api.get(`/competitors/${id}/analytics`),
  },
  accounts: {
    list: () => api.get('/accounts'),
    get: (id: string) => api.get(`/accounts/${id}`),
    create: (data: any) => api.post('/accounts', data),
    uploadCode: (listingId: string, code: string) =>
      api.post(`/accounts/${listingId}/digital-code`, { code }),
    publish: (listingId: string) =>
      api.put(`/accounts/${listingId}/publish`),
  },
  exchanges: {
    list: (params?: any) => api.get('/exchanges', { params }),
  },
  wallet: {
    get: (params?: any) => api.get('/wallet', { params }),
  },
  settings: {
    get: () => api.get('/settings'),
    update: (data: any) => api.patch('/settings', data),
    apiKeys: () => api.get('/settings/api-keys'),
  },
  profile: {
    get: (id?: string) => api.get('/profile', { params: id ? { id } : {} }),
  },
  market: {
    search: (params?: {
      keywords?: string;
      platform?: string;
      category?: string;
      status?: string;
      limit?: number;
      start?: number;
    }) => api.get('/listings', { params }),
  },
};

