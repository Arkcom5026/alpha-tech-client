// src/features/auth/api/authApi.js
import axios from 'axios';

// 🟢 HARDCODED DIRECT IP: เปลี่ยน localhost เป็น 127.0.0.1 เพื่อบังคับวิ่งเข้า IPv4 ตรงๆ ไม่ผ่านระบบแปลชื่อของ Windows
const authApiClient = axios.create({
  baseURL: 'http://127.0.0.1:5000/api',
  timeout: 30000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

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