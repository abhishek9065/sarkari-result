import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance with auth
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Jobs API
export const jobsApi = {
  getAll: () => api.get('/jobs'),
  getById: (id: string) => api.get(`/jobs/${id}`),
  create: (data: any) => api.post('/jobs', data),
  update: (id: string, data: any) => api.put(`/jobs/${id}`, data),
  delete: (id: string) => api.delete(`/jobs/${id}`),
};

// Results API
export const resultsApi = {
  getAll: () => api.get('/results'),
  getById: (id: string) => api.get(`/results/${id}`),
  create: (data: any) => api.post('/results', data),
  update: (id: string, data: any) => api.put(`/results/${id}`, data),
  delete: (id: string) => api.delete(`/results/${id}`),
};

// Admit Cards API
export const admitCardsApi = {
  getAll: () => api.get('/admit-cards'),
  getById: (id: string) => api.get(`/admit-cards/${id}`),
  create: (data: any) => api.post('/admit-cards', data),
  update: (id: string, data: any) => api.put(`/admit-cards/${id}`, data),
  delete: (id: string) => api.delete(`/admit-cards/${id}`),
};

// Admin Dashboard API
export const adminApi = {
  getDashboardStats: () => api.get('/admin/dashboard'),
};

export default api;
