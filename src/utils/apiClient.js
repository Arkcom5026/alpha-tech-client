import axios from 'axios';
import { useAuthStore } from '@/features/auth/store/authStore';

// ✅ ฟังก์ชันดึง token จาก authStore โดยตรง
function getToken() {
  const state = useAuthStore.getState();
  const token = state?.token;
  return token ? `Bearer ${token}` : null;
}

// ✅ baseURL: normalize ให้ลงท้ายด้วย /api/ เสมอ
let baseURL = 'http://localhost:5000/api/';
if (import.meta.env.VITE_API_URL) {
  baseURL = `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api/`;
}

const apiClient = axios.create({
  baseURL,
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ⛳️ Request interceptor: แนบ Authorization จาก store ให้ทุกคำขอ
apiClient.interceptors.request.use(
  (config) => {
    const token = getToken();

    if (token) {
      // ✅ Axios v1: config.headers อาจเป็น AxiosHeaders หรือ object หรือ undefined
      // ตั้งให้ชัวร์ว่า Authorization ถูกแนบจริงเสมอ
      if (config.headers && typeof config.headers.set === 'function') {
        config.headers.set('Authorization', token);
      } else {
        config.headers = config.headers || {};
        // eslint-disable-next-line no-param-reassign
        config.headers.Authorization = token;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// 🧭 Response interceptor: log error แบบละเอียดใน DEV mode
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (import.meta.env?.DEV) {      
      console.error('[apiClient] error', {
        message: error?.message,
        code: error?.code,
        name: error?.name,
        url: error?.config?.url,
        baseURL: error?.config?.baseURL,
        method: error?.config?.method,
        status: error?.response?.status,
        data: error?.response?.data,
      });
    }

    if (!error?.response && (error?.code === 'ERR_NETWORK' || error?.message === 'Network Error')) {
      const enhanced = new Error('Network Error: ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้');
      // @ts-ignore
      enhanced.original = error;
      return Promise.reject(enhanced);
    }

    return Promise.reject(error);
  }
);

export default apiClient;



  