// src/features/auth/api/authApi.js
import axios from 'axios';

// 🟢 DYNAMIC API ROUTER: ตรวจจับ Environment เพื่อแยกท่อส่งข้อมูลระหว่างเครื่องตัวเองกับบน Cloud
const getAuthBaseURL = () => {
  // 1. ถ้าอยู่บน Cloud Production ดึงค่าโดเมนจากตัวแปรระบบ Vercel ทันที
  const envURL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL;
  if (envURL && envURL.trim() !== '') {
    return `${envURL.replace(/\/$/, '')}/api`;
  }

  // 2. ถ้าอยู่บนเครื่อง Localhost สลับกลับมาใช้ IPv4 เลนด่วนอย่างปลอดภัย
  return 'http://127.0.0.1:5000/api';
};

const authApiClient = axios.create({
  baseURL: getAuthBaseURL(), // 🟢 สวิตช์พิกัดปลายทางแบบอัตโนมัติ 100%
  timeout: 30000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 🚀 เพิ่ม Interceptor เผื่อเหนียวดักทับช่วง Runtime อีกหนึ่งสเต็ป
authApiClient.interceptors.request.use(
  (config) => {
    config.baseURL = getAuthBaseURL();
    return config;
  },
  (error) => Promise.reject(error)
);

export async function registerUser(data) {
  try {
    const res = await authApiClient.post('/auth/register', data);
    return res;
  } catch (err) {
    console.error('🔴 registerUser error:', err);
    throw err;
  }
}

export async function loginUser(data) {
  try {
    const res = await authApiClient.post('/auth/login', data);
    return res;
  } catch (err) {
    console.error('🔴 loginUser error:', err);
    throw err;
  }
}

export async function verifySession() {
  try {
    const res = await authApiClient.get('/auth/me');
    return res;
  } catch (err) {
    console.error('🔴 verifySession error:', err);
    throw err;
  }
}

export async function refreshSession() {
  try {
    const res = await authApiClient.post('/auth/refresh');
    return res;
  } catch (err) {
    const status = err?.response?.status;
    if (status !== 401) {
      console.error('🔴 refreshSession error:', err);
    }
    throw err;
  }
}

export async function logoutSession() {
  try {
    const res = await authApiClient.post('/auth/logout');
    return res;
  } catch (err) {
    console.error('🔴 logoutSession error:', err);
    throw err;
  }
}

export async function logoutAllSessions() {
  try {
    const res = await authApiClient.post('/auth/logout-all');
    return res;
  } catch (err) {
    console.error('🔴 logoutAllSessions error:', err);
    throw err;
  }
}

export async function requestPasswordReset(data) {
  try {
    const res = await authApiClient.post('/auth/forgot-password', data);
    return res;
  } catch (err) {
    console.error('🔴 requestPasswordReset error:', err);
    throw err;
  }
}

export async function resetPassword(data) {
  try {
    const res = await authApiClient.post('/auth/reset-password', data);
    return res;
  } catch (err) {
    console.error('🔴 resetPassword error:', err);
    throw err;
  }
}