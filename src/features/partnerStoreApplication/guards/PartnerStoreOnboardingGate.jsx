import React, { useEffect, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import PosAdaptiveShell from '@/features/pos/layouts/PosAdaptiveShell';
import { getPartnerStoreOnboarding } from '../api/partnerStoreOnboardingApi';
import { getPartnerStoreOperationalReadiness } from '../api/partnerStoreOperationalReadinessApi';

export default function PartnerStoreOnboardingGate() {
  const { shopSlug } = useParams();
  const [state, setState] = useState({ loading: true, onboarding: null, readiness: null, error: '' });

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const onboardingResponse = await getPartnerStoreOnboarding();
        if (!active) return;
        const onboarding = onboardingResponse.data?.data || null;

        if (!onboarding?.isPartnerStoreOwner || onboarding?.requiresOnboarding) {
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
  }, []);

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
