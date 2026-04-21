import axios from 'axios';

// Production backend URL — update VITE_API_URL in Vercel dashboard to change
const baseURL = import.meta.env.VITE_API_URL || 'https://medichain-backend-theta.vercel.app/api';

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
