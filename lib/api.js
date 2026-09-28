// frontend/lib/api.js
import axios from 'axios';
import { renovarTokenAcesso } from './authSession';

const api = axios.create({ baseURL: process.env.NEXT_PUBLIC_API_URL });

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const t = localStorage.getItem('token');
    if (t) config.headers.Authorization = `Bearer ${t}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error?.config || {};
    if (error?.response?.status !== 401 || original._authRetry) {
      return Promise.reject(error);
    }
    original._authRetry = true;
    try {
      const token = await renovarTokenAcesso();
      if (!token) return Promise.reject(error);
      original.headers = original.headers || {};
      original.headers.Authorization = `Bearer ${token}`;
      return api(original);
    } catch {
      return Promise.reject(error);
    }
  }
);

export default api;
