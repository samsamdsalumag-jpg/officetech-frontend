import axios from 'axios';

// API Configuration - uses VITE_API_URL from environment
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 30000,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const expired = error.response?.data?.expired;
      localStorage.removeItem('token');
      localStorage.removeItem('admin');
      window.dispatchEvent(new CustomEvent('auth:logout', { detail: { expired } }));
    }
    return Promise.reject(error);
  }
);

export default API;
