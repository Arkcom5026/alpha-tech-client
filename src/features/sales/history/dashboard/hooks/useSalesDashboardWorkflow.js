import { useCallback, useMemo, useState } from 'react';

import { useSalesDashboardStore } from '../index';

export const useSalesDashboardWorkflow = ({ navigate, shopSlug } = {}) => {
  const overview = useSalesDashboardStore((state) => state.overview);
  const loaded = useSalesDashboardStore((state) => state.loaded);
  const loading = useSalesDashboardStore((state) => state.loading);
  const error = useSalesDashboardStore((state) => state.error);
  const lastLoadedAt = useSalesDashboardStore((state) => state.lastLoadedAt);
  const loadOverview = useSalesDashboardStore((state) => state.loadOverview);
  const clearError = useSalesDashboardStore((state) => state.clearError);

  const [insightUI, setInsightUI] = useState({
    loaded: false,
    loading: false,
    error: null,
    lastLoadedAt: null,
    data: null,
  });

  const safeLoadOverview = useCallback(async () => {
    if (loading) return overview;
    try {
      clearError?.();
      return await loadOverview({ scope: 'today' });
    } catch {
      return null;
    }
  }, [clearError, loadOverview, loading, overview]);

  const loadAll = useCallback(async () => {
    await safeLoadOverview();
    setInsightUI((previous) => ({
      ...previous,
      loaded: true,
      lastLoadedAt: previous.lastLoadedAt || new Date(),
    }));
  }, [safeLoadOverview]);

  const health = useMemo(() => {
    if (!loaded || !overview) {
      return {
        tone: 'neutral',
        title: 'ยังไม่ได้เรียกข้อมูลภาพรวมการขาย',
        subtitle: 'กรุณากดคำสั่ง “โหลดทั้งหมด” เพื่อดึงสถิติประมวลผลดุลธุรกรรมล่าสุด',
        actionLabel: 'ดึงข้อมูลภาพรวม',
        action: safeLoadOverview,
      };
    }

    const unpaid = Number(overview?.unpaidCount || 0);
    if (unpaid > 0) {
      return {
        tone: 'warn',
        title: `🚨 ตรวจพบรายการค้างชำระสะสม ${unpaid} บิล`,
        subtitle: 'แนะนำให้ไล่เก็บเงินหรือเร่งปิดสิทธิ์บิลเพื่อไม่ให้เกิดหนี้สูญค้างงวด',
        actionLabel: 'ตรวจสอบบิลค้าง',
        action: () => navigate?.(`/${shopSlug}/pos/sales/bills?status=unpaid`),
      };
    }

    return {
      tone: 'good',
      title: '✨ ข้อมูลธุรกรรมปกติ ไม่มีรายการค้างชำระในงวดงาน',
      subtitle: 'ภาพรวมสุขภาพและสภาพคล่องทางการขายหน้าร้านอยู่ในเกณฑ์ยอดเยี่ยม',
      actionLabel: 'เปิดหน้าจอขายด่วน',
      action: () => navigate?.(`/${shopSlug}/pos/sales/quick`),
    };
  }, [loaded, navigate, overview, safeLoadOverview, shopSlug]);

  return {
    overview,
    loaded,
    loading,
    error,
    lastLoadedAt,
    insightUI,
    health,
    actions: {
      loadOverview: safeLoadOverview,
      loadAll,
    },
  };
};
