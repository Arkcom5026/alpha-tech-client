// src/utils/apiClient.js
// 🏛️ Enterprise Multi-Tenant API Client (Runtime Environment Auto-Matching Edition)
import axios from 'axios';
import { useAuthStore } from '@/features/auth/store/authStore';

let refreshPromise = null;

const isRefreshEndpoint = (url = '') => String(url).includes('/auth/refresh');
const isLogoutEndpoint = (url = '') => String(url).includes('/auth/logout');
const isAuthBypassEndpoint = (url = '') => {
  const normalizedUrl = String(url || '');
  return [
    '/auth/login',
    '/auth/register',
    '/auth/forgot-password',
    '/auth/reset-password',
    '/auth/refresh',
    '/auth/logout',
  ].some((path) => normalizedUrl.includes(path));
};

const applyAuthorizationHeader = (config, bearerToken) => {
  if (!bearerToken) return config;

  if (config.headers && typeof config.headers.set === 'function') {
    config.headers.set('Authorization', bearerToken);
  } else {
    config.headers = config.headers || {};
    config.headers.Authorization = bearerToken;
  }

  return config;
};

// 🟢 1. RUNTIME API DETECTOR: แยกแยะ Local Dev และ Production ด้วย Domain จริงบนบราวเซอร์
const detectBaseURL = () => {
  // 1.1 เช็กระดับ Client-side Runtime (สลับให้อัตโนมัติตาม URL ที่เปิดใช้งานจริง)
  if (typeof window !== 'undefined' && window.location) {
    const currentHostname = window.location.hostname;

    // ถ้าเปิดใช้งานบนโดเมนระบบหลัก (Production) บังคับชี้เข้า API ของเว็บหลักทันที
    if (currentHostname.includes('saduaksabuy.com')) {
      return 'https://api.saduaksabuy.com/api/';
    }

    // สำหรับทีมพัฒนา: ถ้าเปิดรันข้ามเครื่องในวง LAN (เช็กว่าไม่ใช่ localhost แต่เป็นเลข IP อื่น ๆ)
    if (currentHostname !== 'localhost' && currentHostname !== '127.0.0.1') {
      return `http://${currentHostname}:5000/api/`;
    }
  }
  
  // 1.2 ถ้ามีตัวแปร .env ฝังไว้ตอน Build ให้ใช้เป็นตัวเลือกเสริม
  if (import.meta.env.VITE_API_URL) {
    return `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api/`;
  }

  // 1.3 ค่า Fallback ปลอดภัยที่สุดสำหรับเครื่อง Developer (Localhost)
  return 'http://localhost:5000/api/';
};

const baseURL = detectBaseURL();

const refreshAccessToken = async () => {
  if (!refreshPromise) {
    refreshPromise = axios.post(
      `${baseURL}auth/refresh`,
      {},
      {
        withCredentials: true,
        timeout: 20000,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
      .then((res) => {
        const nextAccessToken = res?.data?.accessToken || res?.data?.token || null;

        if (!nextAccessToken) {
          throw new Error('Refresh succeeded but access token is missing');
        }

        useAuthStore.setState((state) => ({
          ...state,
          token: nextAccessToken,
          accessToken: nextAccessToken,
          rememberMe: !!res?.data?.session?.rememberMe,
          session: res?.data?.session || state.session || null,
        }));

        return nextAccessToken;
      })
      .catch((error) => {
        if (import.meta.env?.DEV) {
          console.error('[apiClient] refreshAccessToken failed', {
            message: error?.message,
            status: error?.response?.status,
            data: error?.response?.data,
          });
        }
        throw error;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
};

function getToken() {
  const state = useAuthStore.getState();
  const token = state?.accessToken || state?.token;
  return token ? `Bearer ${token}` : null;
}

const apiClient = axios.create({
  baseURL,
  timeout: 20000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      applyAuthorizationHeader(config, token);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (import.meta.env?.DEV) {
      const requestUrlForLog = error?.config?.url || '';
      const statusForLog = error?.response?.status;
      const isExpectedGuestRefresh401 = isRefreshEndpoint(requestUrlForLog) && statusForLog === 401;

      if (!isExpectedGuestRefresh401) {
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
    }

    if (!error?.response && (error?.code === 'ERR_NETWORK' || error?.message === 'Network Error')) {
      const enhanced = new Error('Network Error: ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้');
      enhanced.original = error;
      return Promise.reject(enhanced);
    }

    const originalRequest = error?.config;
    const status = error?.response?.status;
    const requestUrl = originalRequest?.url || '';

    if (
      status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isAuthBypassEndpoint(requestUrl) &&
      !isRefreshEndpoint(requestUrl) &&
      !isLogoutEndpoint(requestUrl)
    ) {
      originalRequest._retry = true;

      try {
        const nextAccessToken = await refreshAccessToken();
        const bearerToken = nextAccessToken ? `Bearer ${nextAccessToken}` : null;
        applyAuthorizationHeader(originalRequest, bearerToken);
        return apiClient(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;