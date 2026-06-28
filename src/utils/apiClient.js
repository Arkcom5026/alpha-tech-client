// src/utils/apiClient.js
// 🏛️ Enterprise Multi-Tenant API Client (Strict Custom Environment Routing Edition)
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

// src/utils/apiClient.js (ฉบับขจัด Network Error ถาวร)

// 🟢 1. STRICT API DETECTOR: ล็อกอันดับตามตัวแปรอัปเดตล่าสุดบน Vercel และแก้ไอพีภายในเครื่อง
const getRuntimeBaseURL = () => {
  // สลับเอา VITE_API_BASE_URL (ตัวที่เพิ่งอัปเดตล่าสุด) ขึ้นมาเช็คเป็นด่านแรกเพื่อความถูกต้องบน Cloud
  const envURL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL;
  if (envURL) {
    return `${envURL.replace(/\/$/, '')}/api/`;
  }

  if (typeof window !== 'undefined' && window.location) {
    const currentHostname = window.location.hostname;
    if (currentHostname !== 'localhost' && currentHostname !== '127.0.0.1') {
      return `http://${currentHostname}:5000/api/`;
    }
  }

  // 🟢 FIXED: เปลี่ยนจาก localhost เป็น 127.0.0.1 เพื่อบังคับวิ่งเลน IPv4 ตรงล็อกเดียวกับ authApi.js ทันที
  return 'http://127.0.0.1:5000/api/';
};

const apiClient = axios.create({
  // 🟢 FIXED: บังคับไอพีเริ่มต้นเป็น 127.0.0.1 เพื่อป้องกัน Windows แปลงค่าเป็น IPv6 (::1) แล้วสายหลุด
  baseURL: 'http://127.0.0.1:5000/api/',
  timeout: 30000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 🟢 2. REALTIME BASEURL OVERRIDE (บังคับพิกัด URL ใหม่ทุกครั้งที่มีการกดส่งข้อมูล)
apiClient.interceptors.request.use(
  (config) => {
    config.baseURL = getRuntimeBaseURL();

    const token = getToken();
    if (token) {
      applyAuthorizationHeader(config, token);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const refreshAccessToken = async () => {
  if (!refreshPromise) {
    const currentBaseURL = getRuntimeBaseURL();
    
    refreshPromise = axios.post(
      `${currentBaseURL}auth/refresh`,
      {},
      {
        withCredentials: true,
        timeout: 30000,
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
        
        originalRequest.baseURL = getRuntimeBaseURL();
        return apiClient(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;