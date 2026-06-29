// src/utils/apiClient.js
// ✅ API Client v2 — Localhost Cookie-Safe + Refresh Queue
// - Local dev ใช้ http://localhost:5000/api/ เป็นหลัก
// - ห้ามบังคับไป /api/simple/
// - withCredentials: true ทุก request เพื่อส่ง HttpOnly refresh cookie
// - 401 → refresh ครั้งเดียวร่วมกัน → retry request เดิม
// - Auth bypass endpoints ไม่ retry ตัวเองเพื่อกัน loop

import axios from 'axios';
import { useAuthStore } from '@/features/auth/store/authStore';

let refreshPromise = null;

const ensureTrailingSlash = (value) => {
  const s = String(value || '').trim();
  if (!s) return '';
  return s.endsWith('/') ? s : `${s}/`;
};

const stripTrailingSlash = (value) => String(value || '').replace(/\/+$/, '');

const normalizeEnvBaseURL = (raw) => {
  const value = String(raw || '').trim();
  if (!value) return '';

  const cleaned = stripTrailingSlash(value);

  // รองรับทั้ง:
  // VITE_API_BASE_URL=http://localhost:5000
  // VITE_API_BASE_URL=http://localhost:5000/api
  if (cleaned.endsWith('/api')) return ensureTrailingSlash(cleaned);

  return ensureTrailingSlash(`${cleaned}/api`);
};

export const getRuntimeBaseURL = () => {
  const envURL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL;
  const envBaseURL = normalizeEnvBaseURL(envURL);

  if (envBaseURL) return envBaseURL;

  if (typeof window !== 'undefined' && window.location) {
    const host = window.location.hostname;

    // ✅ สำคัญ: ถ้าเปิดหน้าเว็บด้วย localhost ให้ยิง API ไป localhost เหมือนกัน
    // เพื่อให้ Browser ส่ง cookie ของ localhost กลับไปได้ถูก host
    if (host === 'localhost' || host === '127.0.0.1') {
      return `http://${host}:5000/api/`;
    }

    // LAN เช่น 192.168.1.x
    return `http://${host}:5000/api/`;
  }

  return 'http://localhost:5000/api/';
};

const normalizeRequestUrl = (url = '') => {
  const value = String(url || '');

  // ปล่อย absolute URL ไปตามเดิม
  if (/^https?:\/\//i.test(value)) return value;

  // ล้าง path เก่าที่เคยหลุดเข้ามา
  return value
    .replace(/^\/api\/simple\/?/, '/')
    .replace(/^\/api\/?/, '/');
};

const isRefreshEndpoint = (url = '') => String(url).includes('/auth/refresh') || String(url).includes('auth/refresh');
const isLogoutEndpoint = (url = '') => String(url).includes('/auth/logout') || String(url).includes('auth/logout');

const isAuthBypassEndpoint = (url = '') => {
  const normalizedUrl = String(url || '');

  return [
    '/auth/login',
    '/auth/register',
    '/auth/forgot-password',
    '/auth/reset-password',
    '/auth/refresh',
    '/auth/logout',
    'auth/login',
    'auth/register',
    'auth/forgot-password',
    'auth/reset-password',
    'auth/refresh',
    'auth/logout',
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

function getToken() {
  const state = useAuthStore.getState();
  const token = state?.accessToken || state?.token;
  return token ? `Bearer ${token}` : null;
}

const apiClient = axios.create({
  baseURL: getRuntimeBaseURL(),
  timeout: 30000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    config.baseURL = getRuntimeBaseURL();
    config.withCredentials = true;
    config.url = normalizeRequestUrl(config.url);

    const token = getToken();
    if (token && !isAuthBypassEndpoint(config.url)) {
      applyAuthorizationHeader(config, token);
    }

    if (import.meta.env?.DEV) {
      // ช่วยตรวจว่า baseURL ไม่หลุดกลับไป 127/api/simple อีก
      if (String(config.baseURL).includes('/api/simple')) {
        console.warn('[apiClient] invalid baseURL contains /api/simple', config.baseURL);
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

const refreshAccessToken = async () => {
  if (!refreshPromise) {
    const refreshURL = `${getRuntimeBaseURL()}auth/refresh`;

    refreshPromise = axios
      .post(
        refreshURL,
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
          throw Object.assign(new Error('Refresh succeeded but access token is missing'), {
            code: 'REFRESH_ACCESS_TOKEN_MISSING',
          });
        }

        useAuthStore.setState((state) => ({
          ...state,
          token: nextAccessToken,
          accessToken: nextAccessToken,
          rememberMe: !!res?.data?.session?.rememberMe,
          session: res?.data?.session || state.session || null,
          authChecked: true,
          isBootstrappingAuth: false,
          authError: null,
        }));

        return nextAccessToken;
      })
      .catch((error) => {
        const serverMessage =
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          '';

        const enhanced = Object.assign(error, {
          code: error?.code || 'REFRESH_FAILED',
          friendlyMessage:
            String(serverMessage).toLowerCase().includes('refresh token not found') ||
            String(serverMessage).toLowerCase().includes('refresh token')
              ? 'ไม่พบ refresh cookie ใน Browser: กรุณา login ใหม่หลังจากล้าง cookie เก่าของ 127.0.0.1/localhost'
              : serverMessage || 'Refresh session ไม่สำเร็จ',
        });

        if (import.meta.env?.DEV) {
          console.error('[apiClient] refreshAccessToken failed', {
            refreshURL,
            message: enhanced?.message,
            friendlyMessage: enhanced?.friendlyMessage,
            status: enhanced?.response?.status,
            data: enhanced?.response?.data,
          });
        }

        throw enhanced;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (!error?.response && (error?.code === 'ERR_NETWORK' || error?.message === 'Network Error')) {
      const enhanced = new Error('Network Error: ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์หลังบ้านได้ กรุณาตรวจสอบการตั้งค่า API');
      enhanced.original = error;
      return Promise.reject(enhanced);
    }

    const originalRequest = error?.config;
    const status = error?.response?.status;
    const requestUrl = originalRequest?.url || '';

    const shouldTryRefresh =
      status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isAuthBypassEndpoint(requestUrl) &&
      !isRefreshEndpoint(requestUrl) &&
      !isLogoutEndpoint(requestUrl);

    if (shouldTryRefresh) {
      originalRequest._retry = true;

      try {
        const nextAccessToken = await refreshAccessToken();
        const bearerToken = nextAccessToken ? `Bearer ${nextAccessToken}` : null;

        originalRequest.baseURL = getRuntimeBaseURL();
        originalRequest.withCredentials = true;
        originalRequest.url = normalizeRequestUrl(originalRequest.url);

        applyAuthorizationHeader(originalRequest, bearerToken);

        return apiClient(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    if (import.meta.env?.DEV) {
      const isExpectedGuestRefresh401 = isRefreshEndpoint(requestUrl) && status === 401;

      if (!isExpectedGuestRefresh401) {
        console.error('[apiClient] error', {
          message: error?.message,
          code: error?.code,
          name: error?.name,
          url: originalRequest?.url,
          baseURL: originalRequest?.baseURL,
          method: originalRequest?.method,
          status,
          data: error?.response?.data,
        });
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
