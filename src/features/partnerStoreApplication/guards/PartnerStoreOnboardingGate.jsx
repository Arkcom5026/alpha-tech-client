import React, { useEffect, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import PosAdaptiveShell from '@/features/pos/layouts/PosAdaptiveShell';
import { getPartnerStoreOnboarding } from '../api/partnerStoreOnboardingApi';

export default function PartnerStoreOnboardingGate() {
  const { shopSlug } = useParams();
  const [state, setState] = useState({ loading: true, data: null, error: '' });

  useEffect(() => {
    let active = true;
    getPartnerStoreOnboarding()
      .then((response) => {
        if (!active) return;
        setState({ loading: false, data: response.data?.data || null, error: '' });
      })
      .catch((error) => {
        if (!active) return;
        setState({
          loading: false,
          data: null,
          error: error?.response?.data?.message || error?.message || 'ตรวจสอบสถานะเริ่มใช้งานร้านไม่สำเร็จ',
        });
      });
    return () => { active = false; };
  }, []);

  if (state.loading) {
    return <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm font-bold text-slate-500">กำลังตรวจสอบสถานะร้าน…</div>;
  }

  if (state.error) {
    return <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6"><div className="max-w-lg rounded-2xl border border-red-200 bg-white p-5 text-sm font-bold text-red-600">{state.error}</div></div>;
  }

  if (state.data?.isPartnerStoreOwner && state.data?.requiresOnboarding) {
    const canonicalSlug = state.data?.application?.provisionedBranch?.slug || shopSlug;
    return <Navigate to={`/${canonicalSlug}/pos/onboarding`} replace />;
  }

  return <PosAdaptiveShell />;
}
