import React, { useEffect, useMemo, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import PosAdaptiveShell from '@/features/pos/layouts/PosAdaptiveShell';
import { useAuthStore } from '@/features/auth/store/authStore';
import { getPartnerStoreOnboarding } from '../api/partnerStoreOnboardingApi';
import { getPartnerStoreOperationalReadiness } from '../api/partnerStoreOperationalReadinessApi';

const NON_PARTNER_OWNER_CACHE_PREFIX = 'alpha-tech.partner-store.non-owner.v1';

const buildNonPartnerOwnerCacheKey = (shopSlug, employeeId) => {
  const slug = String(shopSlug || '').trim();
  const id = Number(employeeId);
  if (!slug || !Number.isInteger(id) || id <= 0) return '';
  return `${NON_PARTNER_OWNER_CACHE_PREFIX}:${id}:${slug}`;
};

const hasNonPartnerOwnerCache = (cacheKey) => {
  if (!cacheKey || typeof window === 'undefined') return false;
  try {
    return window.sessionStorage.getItem(cacheKey) === '1';
  } catch {
    return false;
  }
};

const rememberNonPartnerOwner = (cacheKey) => {
  if (!cacheKey || typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(cacheKey, '1');
  } catch {
    // Storage is an optimization only. The authority check still works without it.
  }
};

export default function PartnerStoreOnboardingGate() {
  const { shopSlug } = useParams();
  const employeeId = useAuthStore((authState) => authState.employee?.id);
  const cacheKey = useMemo(
    () => buildNonPartnerOwnerCacheKey(shopSlug, employeeId),
    [employeeId, shopSlug],
  );
  const [state, setState] = useState({ loading: true, onboarding: null, readiness: null, error: '' });

  useEffect(() => {
    let active = true;

    if (!cacheKey) return () => { active = false; };

    if (hasNonPartnerOwnerCache(cacheKey)) {
      setState({ loading: false, onboarding: null, readiness: null, error: '' });
      return () => { active = false; };
    }

    setState({ loading: true, onboarding: null, readiness: null, error: '' });

    const load = async () => {
      try {
        const onboardingResponse = await getPartnerStoreOnboarding();
        if (!active) return;
        const onboarding = onboardingResponse.data?.data || null;

        if (!onboarding?.isPartnerStoreOwner) {
          rememberNonPartnerOwner(cacheKey);
          setState({ loading: false, onboarding, readiness: null, error: '' });
          return;
        }

        if (onboarding?.requiresOnboarding) {
          setState({ loading: false, onboarding, readiness: null, error: '' });
          return;
        }

        const readinessResponse = await getPartnerStoreOperationalReadiness();
        if (!active) return;
        setState({
          loading: false,
          onboarding,
          readiness: readinessResponse.data?.data || null,
          error: '',
        });
      } catch (error) {
        if (!active) return;
        setState({
          loading: false,
          onboarding: null,
          readiness: null,
          error: error?.response?.data?.message || error?.message || 'ตรวจสอบสถานะร้านไม่สำเร็จ',
        });
      }
    };

    load();
    return () => { active = false; };
  }, [cacheKey]);

  if (state.loading) {
    return <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm font-bold text-slate-500">กำลังตรวจสอบสถานะร้าน…</div>;
  }

  if (state.error) {
    return <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6"><div className="max-w-lg rounded-2xl border border-red-200 bg-white p-5 text-sm font-bold text-red-600">{state.error}</div></div>;
  }

  if (state.onboarding?.isPartnerStoreOwner && state.onboarding?.requiresOnboarding) {
    const canonicalSlug = state.onboarding?.application?.provisionedBranch?.slug || shopSlug;
    return <Navigate to={`/${canonicalSlug}/pos/onboarding`} replace />;
  }

  if (state.readiness?.isPartnerStoreOwner && state.readiness?.requiresCertification) {
    const canonicalSlug = state.readiness?.application?.provisionedBranch?.slug || shopSlug;
    return <Navigate to={`/${canonicalSlug}/pos/readiness`} replace />;
  }

  return <PosAdaptiveShell />;
}
