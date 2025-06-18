
import axios from 'axios';
import { useAuthStore } from '@/features/auth/store/authStore';

// ✅ ฟังก์ชันดึง token จาก authStore โดยตรง
function getToken() {
  const state = useAuthStore.getState();
  const token = state?.token;
  return token ? `Bearer ${token}` : null;
}

const apiClient = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
  timeout: 10000,
});

apiClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers['Authorization'] = token;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default apiClient;
