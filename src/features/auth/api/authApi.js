


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


