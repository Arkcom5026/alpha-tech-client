// src/features/auth/api/authApi.js

import apiClient from '@/utils/apiClient';

/**
 * ============================================================
 * Authentication API
 * ใช้ apiClient กลางของระบบ
 * ============================================================
 */

export const registerUser = async (data) => {
  return await apiClient.post('/auth/register', data);
};

export const loginUser = async (data) => {
  return await apiClient.post('/auth/login', data);
};

export const verifySession = async () => {
  return await apiClient.get('/auth/me');
};

export const refreshSession = async () => {
  return await apiClient.post('/auth/refresh');
};

export const logoutSession = async () => {
  return await apiClient.post('/auth/logout');
};

export const logoutAllSessions = async () => {
  return await apiClient.post('/auth/logout-all');
};

export const requestPasswordReset = async (data) => {
  return await apiClient.post('/auth/forgot-password', data);
};

export const resetPassword = async (data) => {
  return await apiClient.post('/auth/reset-password', data);
};

export default {
  registerUser,
  loginUser,
  verifySession,
  refreshSession,
  logoutSession,
  logoutAllSessions,
  requestPasswordReset,
  resetPassword,
};  