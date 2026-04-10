// frontend/lib/api.js
import axios from 'axios';

const api = axios.create({ baseURL: process.env.NEXT_PUBLIC_API_URL });

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const t = localStorage.getItem('token');
    if (t) config.headers.Authorization = `Bearer ${t}`;
  }
  return config;
});

export default api;
