import apiClient from '@/utils/apiClient';

// ✅ @filename: authApi.js
// ✅ @folder: src/features/auth/api/

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
