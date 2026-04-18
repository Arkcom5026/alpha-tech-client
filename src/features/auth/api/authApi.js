



// src/features/auth/api/authApi.js

import apiClient from '@/utils/apiClient';

export async function registerUser(data) {
  try {
    const res = await apiClient.post('/auth/register', data);
    return res;
  } catch (err) {
    console.error('🔴 registerUser error:', err);
    throw err; // ส่งให้ layer ด้านบนจัดการ error ตามมาตรฐาน
  }
}

export async function loginUser(data) {
  try {
    const res = await apiClient.post('/auth/login', data);
    return res;
  } catch (err) {
    console.error('🔴 loginUser error:', err);
    throw err;
  }
}

export async function verifySession() {
  try {
    // session bootstrap endpoint for restoring auth from token
    const res = await apiClient.get('/auth/me');
    return res;
  } catch (err) {
    console.error('🔴 verifySession error:', err);
    throw err;
  }
}

export async function refreshSession() {
  try {
    const res = await apiClient.post('/auth/refresh');
    return res;
  } catch (err) {
    const status = err?.response?.status;

    // Guest bootstrap without refresh cookie → expected 401, do not spam console
    if (status !== 401) {
      console.error('🔴 refreshSession error:', err);
    }

    throw err;
  }
}

export async function logoutSession() {
  try {
    const res = await apiClient.post('/auth/logout');
    return res;
  } catch (err) {
    console.error('🔴 logoutSession error:', err);
    throw err;
  }
}

export async function logoutAllSessions() {
  try {
    const res = await apiClient.post('/auth/logout-all');
    return res;
  } catch (err) {
    console.error('🔴 logoutAllSessions error:', err);
    throw err;
  }
}


export async function requestPasswordReset(data) {
  try {
    const res = await apiClient.post('/auth/forgot-password', data);
    return res;
  } catch (err) {
    console.error('🔴 requestPasswordReset error:', err);
    throw err;
  }
}

export async function resetPassword(data) {
  try {
    const res = await apiClient.post('/auth/reset-password', data);
    return res;
  } catch (err) {
    console.error('🔴 resetPassword error:', err);
    throw err;
  }
}






