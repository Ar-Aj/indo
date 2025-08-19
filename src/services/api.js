import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },
  
  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },
};

// Mock data for development when backend is unavailable
const mockColors = [
  { _id: '1', name: 'Agreeable Gray', hexCode: '#D4CFC0', brand: 'Sherwin-Williams', category: 'neutral', finish: 'eggshell', price: 65, popularity: 95 },
  { _id: '2', name: 'Naval', hexCode: '#1F2937', brand: 'Sherwin-Williams', category: 'cool', finish: 'satin', price: 65, popularity: 88 },
  { _id: '3', name: 'Cloud White', hexCode: '#F7F4F2', brand: 'Benjamin Moore', category: 'neutral', finish: 'eggshell', price: 70, popularity: 96 },
  { _id: '4', name: 'Swiss Coffee', hexCode: '#F7F3E9', brand: 'Behr', category: 'warm', finish: 'flat', price: 45, popularity: 89 },
  { _id: '5', name: 'Simply White', hexCode: '#F9F9F6', brand: 'Benjamin Moore', category: 'neutral', finish: 'semi-gloss', price: 70, popularity: 94 },
  { _id: '6', name: 'Polar Bear', hexCode: '#F8F8FF', brand: 'Behr', category: 'cool', finish: 'eggshell', price: 45, popularity: 86 }
];

const mockBrands = ['Sherwin-Williams', 'Benjamin Moore', 'Behr', 'Farrow & Ball'];

// Paint API
export const paintAPI = {
  processVisualization: async (formData) => {
    const response = await api.post('/paint/process', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  
  getProjects: async () => {
    try {
      const response = await api.get('/paint/projects');
      return response.data;
    } catch (error) {
      // Return mock empty projects if backend is unavailable
      console.warn('Backend unavailable, using mock data');
      return { projects: [] };
    }
  },
  
  getProject: async (id) => {
    const response = await api.get(`/paint/projects/${id}`);
    return response.data;
  },
  
  getColors: async (params = {}) => {
    try {
      const response = await api.get('/paint/colors', { params });
      return response.data;
    } catch (error) {
      // Return mock colors if backend is unavailable
      console.warn('Backend unavailable, using mock colors data');
      return { colors: mockColors };
    }
  },
  
  getBrands: async () => {
    try {
      const response = await api.get('/paint/brands');
      return response.data;
    } catch (error) {
      // Return mock brands if backend is unavailable
      console.warn('Backend unavailable, using mock brands data');
      return { brands: mockBrands };
    }
  },
};

// Health check
export const healthAPI = {
  check: async () => {
    const response = await api.get('/health');
    return response.data;
  },
};

export default api;