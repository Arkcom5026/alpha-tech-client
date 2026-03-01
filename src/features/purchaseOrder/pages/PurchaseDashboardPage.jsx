



import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import usePurchaseOrderStore from '../store/purchaseOrderStore';

// ============================================================
// ✅ PurchaseDashboardPage (P1 style: executive overview)
// เป้าหมาย: ทำให้ “ภาพรวมการจัดซื้อ” สมบูรณ์เหมือนหน้าหลักสต๊อก
// - ไม่ปรับ Prisma ใน Task นี้
// - ไม่โหลดอัตโนมัติ (manual load per block) + มีปุ่มโหลดทั้งหมด
// - แสดงเป็นข้อความบนหน้า (ห้าม dialog alert)
// ============================================================

const formatTimeAgo = (d) => {
  if (!d) return '';
  const ts = typeof d === 'string' || typeof d === 'number' ? new Date(d) : d;
  if (!(ts instanceof Date) || Number.isNaN(ts.getTime())) return '';

  const diffMs = Date.now() - ts.getTime();
  const sec = Math.max(0, Math.floor(diffMs / 1000));
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  return `${day}d ago`;
};

const Button = ({ children, onClick, disabled, variant = 'subtle' }) => {
  const base = 'inline-flex items-center justify-center rounded-xl px-3 py-2 text-xs font-medium transition border shadow-sm';
  const variants = {
    primary: 'bg-zinc-900 text-white border-zinc-900 hover:bg-zinc-800',
    subtle: 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50',
    ghost: 'bg-transparent text-zinc-600 border-transparent hover:bg-zinc-100',
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {children}
    </button>
  );
};

const ErrorStrip = ({ message, onRetry, retrying = false }) => {
  if (!message) return null;
  return (
    <div className="mb-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="text-xs text-rose-800 leading-snug">
          <div className="font-semibold">โหลดไม่สำเร็จ</div>
          <div className="mt-0.5 opacity-90">{String(message)}</div>
        </div>
        {onRetry && (
          <Button variant="subtle" onClick={onRetry} disabled={retrying}>
            {retrying ? 'กำลังลองใหม่...' : 'ลองใหม่'}
          </Button>
        )}
      </div>
    </div>
  );
};

const EmptyBox = ({ title, desc, onClick, clickable = false, loading = false }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={!clickable || loading}
    className={`w-full rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm text-left transition ${clickable ? 'hover:shadow-md hover:-translate-y-0.5 cursor-pointer' : 'cursor-default'} ${loading ? 'opacity-70 cursor-wait' : ''}`}
    aria-label={title}
  >
    <div className="text-sm font-semibold text-zinc-800">{title}</div>
    {desc && <div className="text-xs text-zinc-500 mt-1 leading-snug">{desc}</div>}
    {clickable && (
      <div className="mt-4 inline-flex items-center gap-2 text-xs text-zinc-600">
        <span className="rounded-lg bg-zinc-100 px-2 py-1">แตะเพื่อโหลด</span>
        <span className="text-[11px] text-zinc-500">(ไม่โหลดอัตโนมัติ)</span>
      </div>
    )}
  </button>
);

const SummaryCard = ({ label, value, clickable = false, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={!clickable}
    className={`w-full rounded-2xl border border-zinc-200 bg-white px-5 py-4 shadow-sm text-left transition ${clickable ? 'hover:shadow-md hover:-translate-y-0.5 cursor-pointer' : 'cursor-default'}`}
    aria-label={label}
  >
    <div className="text-xs text-zinc-500">{label}</div>
    <div className="text-xl font-semibold text-zinc-900 mt-1">{value}</div>
    {clickable && <div className="text-[11px] mt-2 text-zinc-500">แตะเพื่อดูรายการ</div>}
  </button>
);

const TrendLine = ({ tone = 'neutral', text }) => {
  if (!text) return null;
  const map = {
    neutral: 'text-zinc-500',
    good: 'text-emerald-700',
    warn: 'text-amber-700',
    critical: 'text-rose-700',
  };
  return <div className={`text-[11px] mt-1 ${map[tone] || map.neutral}`}>{text}</div>;
};

const KPIBarItem = ({ label, value, tone = 'neutral', hint, onClick }) => {
  const toneMap = {
    neutral: 'border-zinc-200 bg-white',
    warn: 'border-amber-200 bg-amber-50',
    good: 'border-emerald-200 bg-emerald-50',
    critical: 'border-rose-200 bg-rose-50',
  };

  const valueMap = {
    neutral: 'text-zinc-900',
    warn: 'text-amber-950',
    good: 'text-emerald-950',
    critical: 'text-rose-950',
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-2xl border px-4 py-3 text-left shadow-sm transition hover:shadow-md hover:-translate-y-0.5 ${toneMap[tone] || toneMap.neutral}`}
      aria-label={label}
    >
      <div className="text-[11px] text-zinc-500">{label}</div>
      <div className={`text-xl font-semibold mt-1 leading-none ${valueMap[tone] || valueMap.neutral}`}>{value}</div>
      <TrendLine tone={tone} text={hint} />
    </button>
  );
};

const HealthBanner = ({ tone = 'neutral', title, subtitle, actionLabel, onAction }) => {
  const toneMap = {
    good: 'border-emerald-200 bg-emerald-50',
    warn: 'border-amber-200 bg-amber-50',
    critical: 'border-rose-200 bg-rose-50',
    neutral: 'border-zinc-200 bg-white',
  };

  const dotMap = {
    good: 'bg-emerald-500',
    warn: 'bg-amber-500',
    critical: 'bg-rose-500',
    neutral: 'bg-zinc-400',
  };

  return (
    <div className={`w-full rounded-2xl border px-4 py-3 shadow-sm ${toneMap[tone] || toneMap.neutral}`}>
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className={`h-2.5 w-2.5 rounded-full ${dotMap[tone] || dotMap.neutral}`} />
            <div className="text-xs font-semibold text-zinc-800">Purchase Health</div>
          </div>
          <div className="text-sm font-semibold text-zinc-900 mt-1 truncate">{title}</div>
          {subtitle && <div className="text-[11px] text-zinc-600 mt-0.5 leading-snug">{subtitle}</div>}
        </div>

        {onAction && (
          <Button variant="subtle" onClick={onAction}>
            {actionLabel || 'ดูรายการ'}
          </Button>
        )}
      </div>
    </div>
  );
};

const AgingSummary = ({ buckets, onClick }) => {
  const b = buckets || { d0_7: 0, d8_14: 0, d15p: 0 };
  const total = Number(b.d0_7 || 0) + Number(b.d8_14 || 0) + Number(b.d15p || 0);

  const Seg = ({ label, value, tone }) => {
    const map = {
      neutral: 'border-zinc-200 bg-white',
      warn: 'border-amber-200 bg-amber-50',
      critical: 'border-rose-200 bg-rose-50',
    };
    return (
      <button
        type="button"
        onClick={onClick}
        className={`w-full rounded-2xl border px-4 py-3 text-left shadow-sm transition hover:shadow-md hover:-translate-y-0.5 ${map[tone]}`}
      >
        <div className="text-[11px] text-zinc-500">{label}</div>
        <div className="text-lg font-semibold text-zinc-900 mt-1">{value}</div>
      </button>
    );
  };

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-zinc-800">Aging Summary</div>
          <div className="text-xs text-zinc-500 mt-0.5">ค้างตามอายุงาน (เฉพาะที่ยังไม่ปิด)</div>
        </div>
        <div className="text-[11px] text-zinc-500">รวม {total} รายการ</div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
        <Seg label="0–7 วัน" value={`${Number(b.d0_7 || 0)} รายการ`} tone="neutral" />
        <Seg label="8–14 วัน" value={`${Number(b.d8_14 || 0)} รายการ`} tone="warn" />
        <Seg label="15+ วัน" value={`${Number(b.d15p || 0)} รายการ`} tone="critical" />
      </div>
    </div>
  );
};

const PurchaseDashboardPage = () => {
  const navigate = useNavigate();

  const fetchAllPurchaseOrdersAction = usePurchaseOrderStore((s) => s.fetchAllPurchaseOrdersAction);
  const storeError = usePurchaseOrderStore((s) => s.error);

  const [overviewUI, setOverviewUI] = useState({
    loaded: false,
    loading: false,
    error: null,
    lastLoadedAt: null,
    data: null,
  });

  // (optional) blocks สำหรับอนาคต — ยังไม่ทำกราฟจริงใน Task นี้
  const [monthlyUI, setMonthlyUI] = useState({
    loaded: false,
    loading: false,
    error: null,
    lastLoadedAt: null,
    data: null,
  });

  const [supplierUI, setSupplierUI] = useState({
    loaded: false,
    loading: false,
    error: null,
    lastLoadedAt: null,
    data: null,
  });

  // สะท้อน error จาก store (ถ้ามี)
  useEffect(() => {
    if (!storeError) return;
    setOverviewUI((prev) => ({
      ...prev,
      error: prev.error || storeError,
    }));
  }, [storeError]);

  const computeOverview = useCallback((list) => {
    const items = Array.isArray(list) ? list : [];

    // NOTE: ไม่ผูก Prisma — ใช้สถานะจากรายการ PO ที่ได้จาก API เท่านั้น
    const getStatus = (po) => String(po?.status || po?.purchaseOrderStatus || '').toUpperCase();

    const pickDate = (po) => {
      const d = po?.date || po?.poDate || po?.orderedAt || po?.createdAt || po?.updatedAt;
      const dt = d ? new Date(d) : null;
      return dt && !Number.isNaN(dt.getTime()) ? dt : null;
    };

    const now = new Date();
    const thisMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonthKey = `${prevMonth.getFullYear()}-${String(prevMonth.getMonth() + 1).padStart(2, '0')}`;

    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - 7);
    const prevWeekStart = new Date(now);
    prevWeekStart.setDate(prevWeekStart.getDate() - 14);

    const counts = {
      total: items.length,
      // executive KPI
      openPO: 0, // PENDING
      awaitingReceipt: 0, // PARTIALLY_RECEIVED + RECEIVED
      readyToClose: 0, // PAID
      completedThisMonth: 0, // COMPLETED in current month

      // legacy
      pending: 0,
      inProgress: 0,
      completed: 0,
      cancelled: 0,

      // trends
      trend: {
        openPO_month: null,
        openPO_week: null,
        completed_month: null,
      },

      // aging
      aging: {
        d0_7: 0,
        d8_14: 0,
        d15p: 0,
      },

      // health helpers
      oldOver7: 0,
      oldOver15: 0,
    };

    // buckets for trend
    const monthly = {
      [thisMonthKey]: { openPO: 0, completed: 0 },
      [prevMonthKey]: { openPO: 0, completed: 0 },
    };

    const weekly = {
      last7: { openPO: 0 },
      prev7: { openPO: 0 },
    };

    for (const po of items) {
      const st = getStatus(po);
      const dt = pickDate(po);

      if (st === 'CANCELLED') {
        counts.cancelled += 1;
        continue;
      }

      // completed
      if (st === 'COMPLETED') {
        counts.completed += 1;
        if (dt) {
          const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`;
          if (key === thisMonthKey) counts.completedThisMonth += 1;
          if (monthly[key]) monthly[key].completed += 1;
        }
        continue;
      }

      // in-progress family
      const isInProgress = st === 'PENDING' || st === 'PARTIALLY_RECEIVED' || st === 'RECEIVED' || st === 'PAID';
      if (isInProgress) {
        counts.inProgress += 1;

        if (st === 'PENDING') {
          counts.pending += 1;
          counts.openPO += 1;

          // trends
          if (dt) {
            const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`;
            if (monthly[key]) monthly[key].openPO += 1;

            if (dt >= weekStart) weekly.last7.openPO += 1;
            else if (dt >= prevWeekStart && dt < weekStart) weekly.prev7.openPO += 1;
          }
        }

        if (st === 'PARTIALLY_RECEIVED' || st === 'RECEIVED') counts.awaitingReceipt += 1;
        if (st === 'PAID') counts.readyToClose += 1;

        // aging summary (เฉพาะที่ยังไม่ปิด)
        if (dt) {
          const ageDays = Math.floor((now.getTime() - dt.getTime()) / (1000 * 60 * 60 * 24));
          if (ageDays >= 0 && ageDays <= 7) counts.aging.d0_7 += 1;
          else if (ageDays >= 8 && ageDays <= 14) {
            counts.aging.d8_14 += 1;
            counts.oldOver7 += 1;
          } else if (ageDays >= 15) {
            counts.aging.d15p += 1;
            counts.oldOver7 += 1;
            counts.oldOver15 += 1;
          }
        }

        continue;
      }

      // fallback: นับเป็น inProgress เพื่อไม่ทำตัวเลขหาย
      counts.inProgress += 1;
    }

    // trend helpers
    const pct = (cur, prev) => {
      const c = Number(cur || 0);
      const p = Number(prev || 0);
      if (p <= 0) return c === 0 ? '0%' : `+${c}`;
      const v = Math.round(((c - p) / p) * 100);
      if (v === 0) return '0%';
      return v > 0 ? `+${v}%` : `${v}%`;
    };

    counts.trend.openPO_month = pct(monthly[thisMonthKey].openPO, monthly[prevMonthKey].openPO);
    counts.trend.completed_month = pct(monthly[thisMonthKey].completed, monthly[prevMonthKey].completed);
    counts.trend.openPO_week = (() => {
      const c = Number(weekly.last7.openPO || 0);
      const p = Number(weekly.prev7.openPO || 0);
      if (p <= 0) return c === 0 ? '0' : `+${c}`;
      const v = c - p;
      return v === 0 ? '0' : v > 0 ? `+${v}` : `${v}`;
    })();

    return counts;
  }, []);

  const safeLoadOverview = useCallback(async () => {
    if (!fetchAllPurchaseOrdersAction) {
      setOverviewUI((prev) => ({ ...prev, error: 'ยังไม่พบ action: fetchAllPurchaseOrdersAction' }));
      return;
    }

    try {
      setOverviewUI((prev) => ({ ...prev, loading: true, error: null }));

      // ✅ โหลด “ภาพรวม” = เอาทั้งหมดเท่าที่ API รองรับ
      // ถ้า BE รองรับ status=all → จะได้ครบ (แนะนำ)
      // ถ้าไม่รองรับ → อย่างน้อย default pending/partially_received ก็ยังทำงานได้
      const list = await fetchAllPurchaseOrdersAction({ search: '', status: 'all' });

      const counts = computeOverview(list);
      setOverviewUI({
        loaded: true,
        loading: false,
        error: null,
        lastLoadedAt: new Date(),
        data: counts,
      });
    } catch (err) {
      setOverviewUI((prev) => ({
        ...prev,
        loading: false,
        error: err?.message || 'โหลดข้อมูลไม่สำเร็จ',
      }));
    }
  }, [fetchAllPurchaseOrdersAction, computeOverview]);

  const loadAllAction = useCallback(async () => {
    // ตอนนี้ทำให้สมบูรณ์ก่อน 1 บล็อก (overview)
    await safeLoadOverview();
    // monthly/supplier ยังเป็น placeholder (ไม่เรียก API เพิ่ม)
    setMonthlyUI((prev) => ({ ...prev, loaded: true, lastLoadedAt: prev.lastLoadedAt || new Date() }));
    setSupplierUI((prev) => ({ ...prev, loaded: true, lastLoadedAt: prev.lastLoadedAt || new Date() }));
  }, [safeLoadOverview]);

  const lastUpdatedAll = useMemo(() => {
    const dates = [overviewUI.lastLoadedAt, monthlyUI.lastLoadedAt, supplierUI.lastLoadedAt]
      .filter(Boolean)
      .map((d) => (typeof d === 'string' || typeof d === 'number' ? new Date(d) : d))
      .filter((d) => d instanceof Date && !Number.isNaN(d.getTime()));
    if (!dates.length) return null;
    return new Date(Math.max(...dates.map((d) => d.getTime())));
  }, [overviewUI.lastLoadedAt, monthlyUI.lastLoadedAt, supplierUI.lastLoadedAt]);

  const health = useMemo(() => {
    if (!overviewUI.loaded || !overviewUI.data) {
      return {
        tone: 'neutral',
        title: 'ยังไม่ได้โหลดข้อมูลภาพรวมการจัดซื้อ',
        subtitle: 'กด “โหลดทั้งหมด” หรือแตะ “ภาพรวม” เพื่อดึงตัวเลขล่าสุด (ไม่โหลดอัตโนมัติ)',
        actionLabel: 'โหลดภาพรวม',
        action: safeLoadOverview,
      };
    }

    const d = overviewUI.data;
    const inProgress = Number(d.inProgress || 0);
    const oldOver15 = Number(d.oldOver15 || 0);
    const oldOver7 = Number(d.oldOver7 || 0);

    if (oldOver15 > 0) {
      return {
        tone: 'critical',
        title: `${oldOver15} PO ค้างเกิน 15 วัน`,
        subtitle: `รวมงานค้าง ${inProgress} รายการ • แนะนำเข้าไปปิด/ตรวจรับ/สรุปการจ่ายให้ครบ`,
        actionLabel: 'ดู PO ค้าง',
        action: () => navigate('/pos/purchases/orders?status=pending,partially_received,received,paid'),
      };
    }

    if (oldOver7 > 0) {
      return {
        tone: 'warn',
        title: `${oldOver7} PO ยังไม่ปิดเกิน 7 วัน`,
        subtitle: `รวมงานค้าง ${inProgress} รายการ • ควรไล่เช็คสถานะและปิดงานให้ทันรอบบัญชี`,
        actionLabel: 'ดู PO ค้าง',
        action: () => navigate('/pos/purchases/orders?status=pending,partially_received,received,paid'),
      };
    }

    if (inProgress > 0) {
      return {
        tone: 'warn',
        title: `มีงานจัดซื้อค้าง ${inProgress} รายการ`,
        subtitle: 'ยังอยู่ในกระบวนการ (PENDING/RECEIVED/PAID) — ตรวจรับ/ชำระ/ปิดงานตามลำดับ',
        actionLabel: 'ดูรายการ',
        action: () => navigate('/pos/purchases/orders?status=pending,partially_received,received,paid'),
      };
    }

    return {
      tone: 'good',
      title: 'ไม่มีงานจัดซื้อค้าง',
      subtitle: `รวมทั้งหมด ${Number(d.total || 0)} รายการ • สถานะปกติ`,
      actionLabel: 'ดูทั้งหมด',
      action: () => navigate('/pos/purchases/orders'),
    };
  }, [overviewUI.loaded, overviewUI.data, safeLoadOverview, navigate]);

  return (
    <div className="p-8 w-full flex flex-col items-center bg-gradient-to-b from-white to-zinc-50 min-h-screen">
      <div className="w-full max-w-6xl">
        {/* ================= Header ================= */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="min-w-0">
            <h1 className="text-xl font-semibold text-zinc-800">ภาพรวมการจัดซื้อ</h1>
            <p className="text-xs text-zinc-500 mt-1">Executive Overview
            
            <span className="sr-only">Manual load only • No dialog alerts</span></p>
            {lastUpdatedAll && <div className="text-[11px] text-zinc-500 mt-2">updated {formatTimeAgo(lastUpdatedAll)}</div>}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button variant="subtle" onClick={() => navigate('/pos/purchases/orders/new')}>สร้าง PO ใหม่</Button>
            <Button
              variant="subtle"
              onClick={() => navigate('/pos/purchases/orders?status=pending,partially_received,received,paid')}
            >
              ดู PO ค้างทั้งหมด
            </Button>
            <Button variant="subtle" onClick={loadAllAction} disabled={overviewUI.loading}>
              {overviewUI.loading ? 'กำลังโหลด...' : 'โหลดทั้งหมด'}
            </Button>
          </div>
        </div>

        {/* ================= Layer 1: Executive Summary ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <KPIBarItem
                label="Open PO"
                value={overviewUI.loaded && overviewUI.data ? `${overviewUI.data.openPO} รายการ` : '—'}
                tone={overviewUI.loaded && overviewUI.data && overviewUI.data.openPO > 0 ? 'warn' : 'neutral'}
                hint={overviewUI.loaded && overviewUI.data ? `เดือนนี้ ${overviewUI.data.trend.openPO_month} • 7 วัน ${overviewUI.data.trend.openPO_week}` : 'แตะ “โหลดทั้งหมด” เพื่อดึงข้อมูล'}
                onClick={() => navigate('/pos/purchases/orders?status=pending')}
              />
              <KPIBarItem
                label="Awaiting Receipt"
                value={overviewUI.loaded && overviewUI.data ? `${overviewUI.data.awaitingReceipt} รายการ` : '—'}
                tone={overviewUI.loaded && overviewUI.data && overviewUI.data.awaitingReceipt > 0 ? 'warn' : 'neutral'}
                hint={overviewUI.loaded && overviewUI.data ? 'สถานะ RECEIVED / PARTIALLY_RECEIVED' : ''}
                onClick={() => navigate('/pos/purchases/orders?status=partially_received,received')}
              />
              <KPIBarItem
                label="Ready to Close"
                value={overviewUI.loaded && overviewUI.data ? `${overviewUI.data.readyToClose} รายการ` : '—'}
                tone={overviewUI.loaded && overviewUI.data && overviewUI.data.readyToClose > 0 ? 'good' : 'neutral'}
                hint={overviewUI.loaded && overviewUI.data ? 'สถานะ PAID (รอปิดงาน)' : ''}
                onClick={() => navigate('/pos/purchases/orders?status=paid')}
              />
              <KPIBarItem
                label="Completed This Month"
                value={overviewUI.loaded && overviewUI.data ? `${overviewUI.data.completedThisMonth} รายการ` : '—'}
                tone={overviewUI.loaded && overviewUI.data && overviewUI.data.completedThisMonth > 0 ? 'good' : 'neutral'}
                hint={overviewUI.loaded && overviewUI.data ? `เทียบเดือนก่อน ${overviewUI.data.trend.completed_month}` : ''}
                onClick={() => navigate('/pos/purchases/orders?status=completed')}
              />
            </div>

            <div className="mt-3">
              <HealthBanner
                tone={health.tone}
                title={health.title}
                subtitle={health.subtitle}
                actionLabel={health.actionLabel}
                onAction={health.action}
              />
            </div>
          </div>

          <div>
            <AgingSummary
              buckets={overviewUI.loaded && overviewUI.data ? overviewUI.data.aging : null}
              onClick={() => navigate('/pos/purchases/orders?status=pending,partially_received,received,paid')}
            />
          </div>
        </div>

        <div className="border-t border-zinc-200/60 pt-6 mt-2" />

        {/* ================= Layer 2: Operational Snapshot ================= */}
        <div className="mb-6">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div>
              <h2 className="text-sm font-semibold text-zinc-800">Operational Snapshot</h2>
              <p className="text-xs text-zinc-500 mt-0.5">แตะเพื่อโหลดตัวเลขล่าสุด (ไม่โหลดอัตโนมัติ)</p>
            </div>
            {overviewUI.loaded ? (
              <div className="flex items-center gap-2">
                {overviewUI.lastLoadedAt && <span className="text-[11px] text-zinc-500">updated {formatTimeAgo(overviewUI.lastLoadedAt)}</span>}
                <Button variant="subtle" onClick={safeLoadOverview} disabled={overviewUI.loading}>
                  {overviewUI.loading ? 'กำลังโหลด...' : 'รีเฟรช'}
                </Button>
              </div>
            ) : null}
          </div>

          <ErrorStrip message={overviewUI.error} onRetry={safeLoadOverview} retrying={overviewUI.loading} />

          {!overviewUI.loaded && (
            <EmptyBox
              title="ยังไม่ได้โหลดข้อมูลภาพรวม"
              desc={overviewUI.error || 'แตะที่บล็อกนี้เพื่อโหลดจำนวน PO และตัวชี้วัด Executive'}
              clickable
              loading={overviewUI.loading}
              onClick={safeLoadOverview}
            />
          )}

          {overviewUI.loaded && overviewUI.data && (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <SummaryCard
                label="Open (PENDING)"
                value={`${overviewUI.data.openPO} รายการ`}
                clickable
                onClick={() => navigate('/pos/purchases/orders?status=pending')}
              />
              <SummaryCard
                label="Awaiting Receipt"
                value={`${overviewUI.data.awaitingReceipt} รายการ`}
                clickable
                onClick={() => navigate('/pos/purchases/orders?status=partially_received,received')}
              />
              <SummaryCard
                label="Ready to Close (PAID)"
                value={`${overviewUI.data.readyToClose} รายการ`}
                clickable
                onClick={() => navigate('/pos/purchases/orders?status=paid')}
              />
              <SummaryCard
                label="Completed"
                value={`${overviewUI.data.completed} รายการ`}
                clickable
                onClick={() => navigate('/pos/purchases/orders?status=completed')}
              />
              <SummaryCard
                label="Cancelled"
                value={`${overviewUI.data.cancelled} รายการ`}
                clickable
                onClick={() => navigate('/pos/purchases/orders?status=cancelled')}
              />
            </div>
          )}
        </div>

        <div className="border-t border-zinc-200/60 pt-6 mt-4" />

        {/* ================= Layer 3: Insight Section (placeholder-ready) ================= */}
        <div className="mb-2">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div>
              <h2 className="text-sm font-semibold text-zinc-800">Insights</h2>
              <p className="text-xs text-zinc-500 mt-0.5">กราฟรายเดือน + Top Supplier (ยังเป็น placeholder ใน Task นี้)</p>
            </div>
            <div className="text-[11px] text-zinc-500">toggle: 30 วัน / 90 วัน / ปีนี้ (coming soon)</div>
          </div>
        </div>

        <Tabs defaultValue="monthly">
          <TabsList>
            <TabsTrigger value="monthly">ยอดรวมรายเดือน</TabsTrigger>
            <TabsTrigger value="top-suppliers">Supplier ยอดนิยม</TabsTrigger>
          </TabsList>

          <TabsContent value="monthly">
            <div className="mt-4">
              {!monthlyUI.loaded ? (
                <EmptyBox
                  title="ยังไม่ได้โหลดข้อมูลยอดรวมรายเดือน"
                  desc="ใน Task นี้เรายก Executive layer ให้ครบก่อน — กราฟจะเชื่อม aggregation ใน Task ถัดไป"
                  clickable
                  loading={monthlyUI.loading}
                  onClick={() => setMonthlyUI((prev) => ({ ...prev, loaded: true, lastLoadedAt: new Date() }))}
                />
              ) : (
                <Card>
                  <CardContent className="p-4">
                    <div className="text-sm font-semibold text-zinc-800">กราฟยอดรวมรายเดือน</div>
                    <div className="text-xs text-zinc-500 mt-1">(placeholder) — จะเพิ่ม 2 มิติ: จำนวน PO + มูลค่ารวม พร้อมช่วงเวลา 30/90/ปีนี้</div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="top-suppliers">
            <div className="mt-4">
              {!supplierUI.loaded ? (
                <EmptyBox
                  title="ยังไม่ได้โหลด Supplier ยอดนิยม"
                  desc="ใน Task นี้ยังไม่เพิ่ม query ใหม่ — จะทำ Top Supplier ใน Task ถัดไป"
                  clickable
                  loading={supplierUI.loading}
                  onClick={() => setSupplierUI((prev) => ({ ...prev, loaded: true, lastLoadedAt: new Date() }))}
                />
              ) : (
                <Card>
                  <CardContent className="p-4">
                    <div className="text-sm font-semibold text-zinc-800">Supplier ยอดนิยม</div>
                    <div className="text-xs text-zinc-500 mt-1">(placeholder) — รอเชื่อมข้อมูลใน Task ถัดไป</div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PurchaseDashboardPage;









