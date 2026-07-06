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
let silentRefreshTimerId = null;
let lastScheduledAccessToken = null;
let authStoreSubscribed = false;

const AUTH_REFRESH_LOCK_KEY = 'alpha_auth_refresh_lock_v1';
const AUTH_REFRESH_RESULT_KEY = 'alpha_auth_refresh_result_v1';
const TAB_ID = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
const REFRESH_LOCK_TTL_MS = 10000;
const REFRESH_WAIT_TIMEOUT_MS = 12000;
const SILENT_REFRESH_SKEW_MS = 5 * 60 * 1000;
const SILENT_REFRESH_MIN_DELAY_MS = 30 * 1000;

const authDebugEnabled = () => import.meta.env?.DEV && import.meta.env?.VITE_AUTH_DEBUG === 'true';
const authDebug = (...args) => {
  if (authDebugEnabled()) console.info('[auth-flow]', ...args);
};

const ensureTrailingSlash = (value) => {
  const s = String(value || '').trim();
  if (!s) return '';
  return s.endsWith('/') ? s : `${s}/`;
};

const stripTrailingSlash = (value) => String(value || '').replace(/\/+$/, '');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const safeReadJson = (key) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch (_) {
    return null;
  }
};

const safeWriteJson = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (_) {}
};

const safeRemove = (key) => {
  try {
    localStorage.removeItem(key);
  } catch (_) {}
};

const decodeJwtPayload = (token) => {
  try {
    const payload = String(token || '').split('.')[1];
    if (!payload) return null;
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=');
    return JSON.parse(atob(padded));
  } catch (_) {
    return null;
  }
};

const clearSilentRefreshTimer = () => {
  if (silentRefreshTimerId) {
    window.clearTimeout(silentRefreshTimerId);
    silentRefreshTimerId = null;
  }
  lastScheduledAccessToken = null;
};

const scheduleSilentRefreshForToken = (accessToken, source = 'store-change') => {
  if (typeof window === 'undefined') return;

  if (!accessToken) {
    clearSilentRefreshTimer();
    return;
  }

  if (accessToken === lastScheduledAccessToken && silentRefreshTimerId) return;

  const payload = decodeJwtPayload(accessToken);
  const expMs = payload?.exp ? Number(payload.exp) * 1000 : null;

  if (!expMs || !Number.isFinite(expMs)) {
    authDebug('silent-refresh:skip-no-exp', { source });
    clearSilentRefreshTimer();
    return;
  }

  const now = Date.now();
  const refreshAt = expMs - SILENT_REFRESH_SKEW_MS;
  const delayMs = Math.max(refreshAt - now, SILENT_REFRESH_MIN_DELAY_MS);

  if (expMs <= now) {
    authDebug('silent-refresh:skip-expired-token', { source });
    clearSilentRefreshTimer();
    return;
  }

  if (silentRefreshTimerId) window.clearTimeout(silentRefreshTimerId);
  lastScheduledAccessToken = accessToken;

  authDebug('silent-refresh:scheduled', {
    source,
    delayMs,
    expiresInMs: expMs - now,
  });

  silentRefreshTimerId = window.setTimeout(() => {
    silentRefreshTimerId = null;
    authDebug('silent-refresh:timer-fired');

    refreshAccessToken('timer').catch((error) => {
      authDebug('silent-refresh:timer-failed', {
        message: error?.friendlyMessage || error?.message,
        status: error?.response?.status,
      });
    });
  }, delayMs);
};

const ensureAuthStoreSubscription = () => {
  if (authStoreSubscribed || typeof window === 'undefined' || typeof useAuthStore?.subscribe !== 'function') return;
  authStoreSubscribed = true;

  useAuthStore.subscribe((state, prevState) => {
    const token = state?.accessToken || state?.token || null;
    const prevToken = prevState?.accessToken || prevState?.token || null;

    if (token !== prevToken) {
      scheduleSilentRefreshForToken(token, 'auth-store-token-change');
    }
  });

  const currentState = useAuthStore.getState?.();
  scheduleSilentRefreshForToken(currentState?.accessToken || currentState?.token || null, 'auth-store-initial');
};

const getActiveRefreshLock = () => {
  const lock = safeReadJson(AUTH_REFRESH_LOCK_KEY);
  if (!lock?.owner || !lock?.expiresAt) return null;
  if (Number(lock.expiresAt) <= Date.now()) {
    safeRemove(AUTH_REFRESH_LOCK_KEY);
    return null;
  }
  return lock;
};

const acquireRefreshLock = () => {
  const activeLock = getActiveRefreshLock();
  if (activeLock && activeLock.owner !== TAB_ID) return false;

  safeWriteJson(AUTH_REFRESH_LOCK_KEY, {
    owner: TAB_ID,
    createdAt: Date.now(),
    expiresAt: Date.now() + REFRESH_LOCK_TTL_MS,
  });

  const confirmed = getActiveRefreshLock();
  return confirmed?.owner === TAB_ID;
};

const releaseRefreshLock = () => {
  const activeLock = getActiveRefreshLock();
  if (!activeLock || activeLock.owner === TAB_ID) {
    safeRemove(AUTH_REFRESH_LOCK_KEY);
  }
};

const publishRefreshResult = (data) => {
  safeWriteJson(AUTH_REFRESH_RESULT_KEY, {
    owner: TAB_ID,
    createdAt: Date.now(),
    accessToken: data?.accessToken || data?.token || null,
    session: data?.session || null,
  });
};

const waitForCrossTabRefreshResult = async () => {
  const startedAt = Date.now();

  while (Date.now() - startedAt < REFRESH_WAIT_TIMEOUT_MS) {
    const lock = getActiveRefreshLock();
    const result = safeReadJson(AUTH_REFRESH_RESULT_KEY);

    if (!lock) {
      if (result?.accessToken && Number(result.createdAt || 0) >= startedAt - 1000) {
        return result;
      }
      return null;
    }

    if (result?.accessToken && Number(result.createdAt || 0) >= startedAt - 1000) {
      return result;
    }

    await sleep(80);
  }

  return null;
};

const applyRefreshResultToStore = ({ accessToken, session }) => {
  if (!accessToken) return null;

  useAuthStore.setState((state) => ({
    ...state,
    token: accessToken,
    accessToken,
    rememberMe: !!session?.rememberMe,
    session: session || state.session || null,
    authChecked: true,
    isBootstrappingAuth: false,
    authError: null,
  }));

  scheduleSilentRefreshForToken(accessToken, 'refresh-result');

  return accessToken;
};

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
const isAuthMeEndpoint = (url = '') => String(url).includes('/auth/me') || String(url).includes('auth/me');

const isAuthBypassEndpoint = (url = '') => {
  const normalizedUrl = String(url || '');

  return [
    '/auth/login',
    '/auth/register',
    '/auth/forgot-password',
    '/auth/reset-password',
    '/auth/refresh',
    '/auth/logout',
    '/auth/logout-all',
    'auth/login',
    'auth/register',
    'auth/forgot-password',
    'auth/reset-password',
    'auth/refresh',
    'auth/logout',
    'auth/logout-all',
  ].some((path) => normalizedUrl.includes(path));
};

const waitForAuthBootstrapToFinish = async ({ timeoutMs = 5000, intervalMs = 50 } = {}) => {
  const startedAt = Date.now();

  while (useAuthStore.getState()?.isBootstrappingAuth) {
    if (Date.now() - startedAt >= timeoutMs) {
      if (import.meta.env?.DEV) {
        console.warn('[apiClient] auth bootstrap wait timed out; request will continue');
      }
      return;
    }

    await sleep(intervalMs);
  }
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
  async (config) => {
    ensureAuthStoreSubscription();

    config.baseURL = getRuntimeBaseURL();
    config.withCredentials = true;
    config.url = normalizeRequestUrl(config.url);

    // ✅ Bootstrap gate:
    // On hard reload the app intentionally keeps accessToken in memory only.
    // App.jsx starts bootstrapAuthAction(), but pages/stores may fire protected APIs immediately.
    // Without this gate those protected APIs hit 401 and create extra refresh attempts.
    // /auth/me is the verifier used by bootstrap itself, so it must not wait on bootstrap.
    if (!isAuthBypassEndpoint(config.url) && !isAuthMeEndpoint(config.url)) {
      await waitForAuthBootstrapToFinish();
    }

    const token = getToken();
    if (token && !isAuthBypassEndpoint(config.url)) {
      applyAuthorizationHeader(config, token);
    }

    if (authDebugEnabled()) {
      authDebug('request', {
        method: config.method,
        url: config.url,
        hasToken: !!token,
        isAuthBypass: isAuthBypassEndpoint(config.url),
        isAuthMe: isAuthMeEndpoint(config.url),
      });
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

const refreshAccessToken = async (reason = '401') => {
  ensureAuthStoreSubscription();

  if (!refreshPromise) {
    refreshPromise = (async () => {
      const refreshURL = `${getRuntimeBaseURL()}auth/refresh`;

      if (!acquireRefreshLock()) {
        authDebug('refresh:wait-cross-tab', { reason });
        const crossTabResult = await waitForCrossTabRefreshResult();
        if (crossTabResult?.accessToken) {
          authDebug('refresh:use-cross-tab-result', { reason });
          return applyRefreshResultToStore(crossTabResult);
        }
        authDebug('refresh:cross-tab-timeout-fallback', { reason });
      }

      try {
        authDebug('refresh:start', { reason, refreshURL });
        const res = await axios.post(
          refreshURL,
          {},
          {
            withCredentials: true,
            timeout: 30000,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        const nextAccessToken = res?.data?.accessToken || res?.data?.token || null;

        if (!nextAccessToken) {
          throw Object.assign(new Error('Refresh succeeded but access token is missing'), {
            code: 'REFRESH_ACCESS_TOKEN_MISSING',
          });
        }

        publishRefreshResult(res?.data || {});
        applyRefreshResultToStore({ accessToken: nextAccessToken, session: res?.data?.session || null });
        authDebug('refresh:success', { reason });

        return nextAccessToken;
      } catch (error) {
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

        useAuthStore.setState((state) => ({
          ...state,
          token: null,
          accessToken: null,
          authChecked: true,
          isBootstrappingAuth: false,
          authError: enhanced?.friendlyMessage || 'Refresh session ไม่สำเร็จ',
        }));
        clearSilentRefreshTimer();

        if (import.meta.env?.DEV) {
          console.error('[apiClient] refreshAccessToken failed', {
            reason,
            refreshURL,
            message: enhanced?.message,
            friendlyMessage: enhanced?.friendlyMessage,
            status: enhanced?.response?.status,
            data: enhanced?.response?.data,
          });
        }

        throw enhanced;
      } finally {
        releaseRefreshLock();
        refreshPromise = null;
      }
    })();
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
        const nextAccessToken = await refreshAccessToken('401');
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
