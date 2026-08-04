import React from 'react';
import { Navigate, Outlet, useParams } from 'react-router-dom';

import { useAuthStore } from '@/features/auth/store/authStore';

const normalizeRole = (value) => String(value || '').trim().toUpperCase();

const decodeTokenPayload = (token) => {
  try {
    const payload = String(token || '').split('.')[1];
    if (!payload) return null;
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
    return JSON.parse(window.atob(padded));
  } catch (_error) {
    return null;
  }
};

export const getTokenAuthorityRole = (token) => {
  const payload = decodeTokenPayload(token);
  return normalizeRole(payload?.role);
};

const SuperAdminAuthorityGuard = () => {
  const { shopSlug } = useParams();
  const accessToken = useAuthStore((state) => state.accessToken || state.token);
  const authChecked = useAuthStore((state) => state.authChecked);
  const isBootstrappingAuth = useAuthStore((state) => state.isBootstrappingAuth);

  if (!authChecked || isBootstrappingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm font-bold text-slate-500">
        กำลังตรวจสอบสิทธิ์แพลตฟอร์ม...
      </div>
    );
  }

  const authorityRole = getTokenAuthorityRole(accessToken);
  if (authorityRole !== 'SUPERADMIN') {
    const fallback = shopSlug ? `/${shopSlug}/pos` : '/login';
    return <Navigate to={fallback} replace />;
  }

  return <Outlet />;
};

export default SuperAdminAuthorityGuard;
