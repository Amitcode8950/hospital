import axios from 'axios';

// In production (Vercel), VITE_API_URL = your Railway backend URL
// e.g. https://medichain-backend.up.railway.app/api
// In local dev, leave VITE_API_URL empty → Vite proxy handles /api
const baseURL = 'https://medichain-ashy.vercel.app/api';

const api = axios.create({ baseURL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('medichain_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('medichain_token');
      localStorage.removeItem('medichain_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
