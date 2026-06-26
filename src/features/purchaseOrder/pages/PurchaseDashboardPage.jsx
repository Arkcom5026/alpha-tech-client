// src/features/purchaseOrder/pages/PurchaseDashboardPage.jsx
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { usePurchaseOrderStore } from '../store/purchaseOrderStore';

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
  const base = 'inline-flex items-center justify-center rounded-xl px-4 py-2 text-xs font-black transition-all border shadow-sm duration-150';
  const variants = {
    primary: 'bg-gradient-to-b from-amber-400 to-orange-500 text-white border-amber-500/30 hover:shadow-[0_0_20px_rgba(245,158,11,0.2)] shadow-orange-500/10',
    subtle: 'bg-zinc-800 text-zinc-100 border-zinc-700/80 hover:bg-zinc-700 hover:text-white',
    ghost: 'bg-transparent text-zinc-400 border-transparent hover:bg-zinc-800/60 hover:text-white',
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
    <div className="mb-3 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="text-xs text-rose-300 leading-snug">
          <div className="font-bold">โหลดไม่สำเร็จ</div>
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
    className={`w-full rounded-2xl border border-dashed border-zinc-800 bg-zinc-900 p-6 shadow-sm text-left transition-all duration-200 ${clickable ? 'hover:border-amber-500/40 hover:bg-zinc-800/40 hover:-translate-y-0.5 cursor-pointer' : 'cursor-default'} ${loading ? 'opacity-70 cursor-wait' : ''}`}
    aria-label={title}
  >
    <div className="text-sm font-bold text-white">{title}</div>
    {desc && <div className="text-xs text-zinc-400 mt-1.5 leading-snug font-medium">{desc}</div>}
    {clickable && (
      <div className="mt-4 inline-flex items-center gap-2 text-xs text-amber-400">
        <span className="rounded-lg bg-amber-500/10 border border-amber-500/20 px-2 py-1 font-bold">แตะเพื่อโหลด</span>
        <span className="text-[11px] text-zinc-500 font-bold">(ไม่โหลดอัตโนมัติ)</span>
      </div>
    )}
  </button>
);

const SummaryCard = ({ label, value, clickable = false, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={!clickable}
    className={`w-full rounded-2xl border border-zinc-800/80 bg-zinc-900/60 px-5 py-4 shadow-sm text-left transition-all duration-200 ${clickable ? 'hover:border-amber-500/40 hover:shadow-xl hover:-translate-y-0.5 cursor-pointer' : 'cursor-default'}`}
    aria-label={label}
  >
    <div className="text-xs text-zinc-400 font-medium">{label}</div>
    <div className="text-xl font-black text-white mt-1.5 tracking-tight">{value}</div>
    {clickable && <div className="text-[11px] mt-2 text-amber-400 font-bold">แตะเพื่อดูรายการ</div>}
  </button>
);

const TrendLine = ({ tone = 'neutral', text }) => {
  if (!text) return null;
  const map = {
    neutral: 'text-zinc-500',
    good: 'text-emerald-400',
    warn: 'text-amber-400',
    critical: 'text-rose-400',
  };
  return <div className={`text-[11px] mt-1.5 font-bold ${map[tone] || map.neutral}`}>{text}</div>;
};

const KPIBarItem = ({ label, value, tone = 'neutral', hint, onClick }) => {
  const toneMap = {
    neutral: 'border-zinc-800 bg-zinc-900/60 text-white',
    warn: 'border-amber-500/20 bg-amber-500/5 text-white',
    good: 'border-emerald-500/20 bg-emerald-500/5 text-white',
    critical: 'border-rose-500/20 bg-rose-500/5 text-white',
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-2xl border px-4 py-3 text-left shadow-sm transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 ${toneMap[tone] || toneMap.neutral}`}
      aria-label={label}
    >
      <div className="text-[11px] text-zinc-400 font-bold uppercase tracking-wider">{label}</div>
      <div className="text-lg font-black mt-1 leading-none text-white tracking-tight">{value}</div>
      <TrendLine tone={tone} text={hint} />
    </button>
  );
};

const HealthBanner = ({ tone = 'neutral', title, subtitle, actionLabel, onAction }) => {
  const toneMap = {
    good: 'border-emerald-500/20 bg-emerald-500/5',
    warn: 'border-amber-500/20 bg-amber-500/5',
    critical: 'border-rose-500/20 bg-rose-500/5',
    neutral: 'border-zinc-800 bg-zinc-900/60',
  };

  const dotMap = {
    good: 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.4)]',
    warn: 'bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.4)]',
    critical: 'bg-rose-400 shadow-[0_0_10px_rgba(248,113,113,0.4)]',
    neutral: 'bg-zinc-500',
  };

  return (
    <div className={`w-full rounded-2xl border px-5 py-4 shadow-sm ${toneMap[tone] || toneMap.neutral}`}>
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${dotMap[tone] || dotMap.neutral} animate-pulse`} />
            <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Purchase Health</div>
          </div>
          <div className="text-base font-black text-white mt-1.5 truncate tracking-tight">{title}</div>
          {subtitle && <div className="text-xs text-zinc-400 mt-0.5 font-medium leading-snug">{subtitle}</div>}
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
      neutral: 'border-zinc-800 bg-zinc-900/40',
      warn: 'border-amber-500/20 bg-amber-500/5',
      critical: 'border-rose-500/20 bg-rose-500/5',
    };
    return (
      <button
        type="button"
        onClick={onClick}
        className={`w-full rounded-2xl border px-4 py-3 text-left shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${map[tone]}`}
      >
        <div className="text-[11px] text-zinc-400 font-bold uppercase tracking-wider">{label}</div>
        <div className="text-base font-black text-white mt-1 tracking-tight">{value}</div>
      </button>
    );
  };

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 shadow-sm space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-black text-white">Aging Summary</div>
          <div className="text-xs text-zinc-400 mt-0.5 font-medium">ค้างตามอายุงาน (เฉพาะที่ยังไม่ปิด)</div>
        </div>
        <div className="text-[10px] font-black bg-zinc-800 text-amber-400 px-2 py-0.5 rounded-md border border-zinc-700 uppercase tracking-wide">
          รวม {total} รายการ
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Seg label="0–7 วัน" value={`${Number(b.d0_7 || 0)} บิล`} tone="neutral" />
        <Seg label="8–14 วัน" value={`${Number(b.d8_14 || 0)} บิล`} tone="warn" />
        <Seg label="15+ วัน" value={`${Number(b.d15p || 0)} บิล`} tone="critical" />
      </div>
    </div>
  );
};

const PurchaseDashboardPage = () => {
  const navigate = useNavigate();
  const { shopSlug } = useParams();

  const fetchAllPurchaseOrdersAction = usePurchaseOrderStore((s) => s.fetchAllPurchaseOrdersAction);
  const storeError = usePurchaseOrderStore((s) => s.error);

  const [overviewUI, setOverviewUI] = useState({
    loaded: false,
    loading: false,
    error: null,
    lastLoadedAt: null,
    data: null,
  });

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

  useEffect(() => {
    if (!storeError) return;
    setOverviewUI((prev) => ({
      ...prev,
      error: prev.error || storeError,
    }));
  }, [storeError]);

  const computeOverview = useCallback((list) => {
    const items = Array.isArray(list) ? list : [];
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
      openPO: 0,
      awaitingReceipt: 0,
      readyToClose: 0,
      completedThisMonth: 0,
      pending: 0,
      inProgress: 0,
      completed: 0,
      cancelled: 0,
      trend: { openPO_month: null, openPO_week: null, completed_month: null },
      aging: { d0_7: 0, d8_14: 0, d15p: 0 },
      oldOver7: 0,
      oldOver15: 0,
    };

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

      if (st === 'COMPLETED') {
        counts.completed += 1;
        if (dt) {
          const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`;
          if (key === thisMonthKey) counts.completedThisMonth += 1;
          if (monthly[key]) monthly[key].completed += 1;
        }
        continue;
      }

      const isInProgress = st === 'PENDING' || st === 'PARTIALLY_RECEIVED' || st === 'RECEIVED' || st === 'PAID';
      if (isInProgress) {
        counts.inProgress += 1;

        if (st === 'PENDING') {
          counts.pending += 1;
          counts.openPO += 1;

          if (dt) {
            const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`;
            if (monthly[key]) monthly[key].openPO += 1;
            if (dt >= weekStart) weekly.last7.openPO += 1;
            else if (dt >= prevWeekStart && dt < weekStart) weekly.prev7.openPO += 1;
          }
        }

        if (st === 'PARTIALLY_RECEIVED' || st === 'RECEIVED') counts.awaitingReceipt += 1;
        if (st === 'PAID') counts.readyToClose += 1;

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
      counts.inProgress += 1;
    }

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
    await safeLoadOverview();
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
        action: () => navigate(`/${shopSlug}/pos/purchases/list?status=pending,partially_received,received,paid`),
      };
    }

    if (oldOver7 > 0) {
      return {
        tone: 'warn',
        title: `${oldOver7} PO ยังไม่ปิดเกิน 7 วัน`,
        subtitle: `รวมงานค้าง ${inProgress} รายการ • ควรไล่เช็คสถานะและปิดงานให้ทันรอบบัญชี`,
        actionLabel: 'ดู PO ค้าง',
        action: () => navigate(`/${shopSlug}/pos/purchases/list?status=pending,partially_received,received,paid`),
      };
    }

    if (inProgress > 0) {
      return {
        tone: 'warn',
        title: `มีงานจัดซื้อค้าง ${inProgress} รายการ`,
        subtitle: 'ยังอยู่ในกระบวนการ (PENDING/RECEIVED/PAID) — ตรวจรับ/ชำระ/ปิดงานตามลำดับ',
        actionLabel: 'ดูรายการ',
        action: () => navigate(`/${shopSlug}/pos/purchases/list?status=pending,partially_received,received,paid`),
      };
    }

    return {
      tone: 'good',
      title: 'ไม่มีงานจัดซื้อค้าง',
      subtitle: `รวมทั้งหมด ${Number(d.total || 0)} รายการ • Status Normal`,
      actionLabel: 'ดูทั้งหมด',
      action: () => navigate(`/${shopSlug}/pos/purchases/list`),
    };
  }, [overviewUI.loaded, overviewUI.data, safeLoadOverview, navigate, shopSlug]);

  return (
    <div className="space-y-6 animate-fadeIn p-6 bg-slate-900 min-h-screen text-white">
      
      {/* ================= HEADER LAYOUT CLEAN ================= */}
      <div className="bg-zinc-900 border border-zinc-800/80 p-6 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-xl font-black text-white">ภาพรวมระบบงานจัดซื้อ</h1>
          <p className="text-xs text-zinc-400 mt-0.5 font-medium">Executive Procurement & Supplier Operations Overview</p>
          {lastUpdatedAll && <div className="text-[10px] font-mono text-zinc-500 mt-1.5">UPDATED: {formatTimeAgo(lastUpdatedAll)}</div>}
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Button variant="primary" onClick={() => navigate(`/${shopSlug}/pos/purchases/create`)}>สร้าง PO ใหม่</Button>
          <Button variant="subtle" onClick={() => navigate(`/${shopSlug}/pos/purchases/list?status=pending,partially_received,received,paid`)}>
            ดู PO ค้างทั้งหมด
          </Button>
          <Button variant="subtle" onClick={loadAllAction} disabled={overviewUI.loading}>
            {overviewUI.loading ? 'กำลังโหลด...' : 'โหลดทั้งหมด'}
          </Button>
        </div>
      </div>

      {/* ================= Layer 1: Executive Summary ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPIBarItem
              label="Open PO"
              value={overviewUI.loaded && overviewUI.data ? `${overviewUI.data.openPO} รายการ` : '—'}
              tone={overviewUI.loaded && overviewUI.data && overviewUI.data.openPO > 0 ? 'warn' : 'neutral'}
              hint={overviewUI.loaded && overviewUI.data ? `เดือนนี้ ${overviewUI.data.trend.openPO_month} • 7 วัน ${overviewUI.data.trend.openPO_week}` : 'แตะ “โหลดทั้งหมด” เพื่อดึงข้อมูล'}
              onClick={() => navigate(`/${shopSlug}/pos/purchases/list?status=pending`)}
            />
            <KPIBarItem
              label="Awaiting Receipt"
              value={overviewUI.loaded && overviewUI.data ? `${overviewUI.data.awaitingReceipt} รายการ` : '—'}
              tone={overviewUI.loaded && overviewUI.data && overviewUI.data.awaitingReceipt > 0 ? 'warn' : 'neutral'}
              hint={overviewUI.loaded && overviewUI.data ? 'สถานะ RECEIVED' : ''}
              onClick={() => navigate(`/${shopSlug}/pos/purchases/list?status=partially_received,received`)}
            />
            <KPIBarItem
              label="Ready to Close"
              value={overviewUI.loaded && overviewUI.data ? `${overviewUI.data.readyToClose} รายการ` : '—'}
              tone={overviewUI.loaded && overviewUI.data && overviewUI.data.readyToClose > 0 ? 'good' : 'neutral'}
              hint={overviewUI.loaded && overviewUI.data ? 'สถานะ PAID (รอปิดงาน)' : ''}
              onClick={() => navigate(`/${shopSlug}/pos/purchases/list?status=paid`)}
            />
            <KPIBarItem
              label="Completed This Month"
              value={overviewUI.loaded && overviewUI.data ? `${overviewUI.data.completedThisMonth} รายการ` : '—'}
              tone={overviewUI.loaded && overviewUI.data && overviewUI.data.completedThisMonth > 0 ? 'good' : 'neutral'}
              hint={overviewUI.loaded && overviewUI.data ? `เทียบเดือนก่อน ${overviewUI.data.trend.completed_month}` : ''}
              onClick={() => navigate(`/${shopSlug}/pos/purchases/list?status=completed`)}
            />
          </div>

          <HealthBanner
            tone={health.tone}
            title={health.title}
            subtitle={health.subtitle}
            actionLabel={health.actionLabel}
            onAction={health.action}
          />
        </div>

        <div className="lg:col-span-4">
          <AgingSummary
            buckets={overviewUI.loaded && overviewUI.data ? overviewUI.data.aging : null}
            onClick={() => navigate(`/${shopSlug}/pos/purchases/list?status=pending,partially_received,received,paid`)}
          />
        </div>
      </div>

      {/* ================= Layer 2: Operational Snapshot ================= */}
      <div className="bg-zinc-900 border border-zinc-800/80 p-6 rounded-2xl shadow-sm space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-black text-white">Operational Snapshot</h2>
            <p className="text-xs text-zinc-400 mt-0.5 font-medium">แตะเพื่อโหลดสถานะเอกสารล่าสุดแยกรายกลุ่มบัญชี</p>
          </div>
          {overviewUI.loaded && (
            <div className="flex items-center gap-3">
              <span className="text-[11px] text-zinc-500 font-mono">UPDATED: {formatTimeAgo(overviewUI.lastLoadedAt)}</span>
              <Button variant="subtle" onClick={safeLoadOverview} disabled={overviewUI.loading}>
                {overviewUI.loading ? 'กำลังโหลด...' : 'รีเฟรช'}
              </Button>
            </div>
          )}
        </div>

        <ErrorStrip message={overviewUI.error} onRetry={safeLoadOverview} retrying={overviewUI.loading} />

        {!overviewUI.loaded && (
          <EmptyBox
            title="ยังไม่ได้โหลดข้อมูลภาพรวมเอกสาร"
            desc={overviewUI.error || 'แตะที่กล่องนี้เพื่อสั่ง Query จำนวนใบสั่งซื้อ PO ทั้งหมดจากฐานข้อมูล'}
            clickable
            loading={overviewUI.loading}
            onClick={safeLoadOverview}
          />
        )}

        {overviewUI.loaded && overviewUI.data && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <SummaryCard
              label="Open (PENDING)"
              value={`${overviewUI.data.openPO} รายการ`}
              clickable
              onClick={() => navigate(`/${shopSlug}/pos/purchases/list?status=pending`)}
            />
            <SummaryCard
              label="Awaiting Receipt"
              value={`${overviewUI.data.awaitingReceipt} รายการ`}
              clickable
              onClick={() => navigate(`/${shopSlug}/pos/purchases/list?status=partially_received,received`)}
            />
            <SummaryCard
              label="Ready to Close (PAID)"
              value={`${overviewUI.data.readyToClose} รายการ`}
              clickable
              onClick={() => navigate(`/${shopSlug}/pos/purchases/list?status=paid`)}
            />
            <SummaryCard
              label="Completed"
              value={`${overviewUI.data.completed} รายการ`}
              clickable
              onClick={() => navigate(`/${shopSlug}/pos/purchases/list?status=completed`)}
            />
            <SummaryCard
              label="Cancelled"
              value={`${overviewUI.data.cancelled} รายการ`}
              clickable
              onClick={() => navigate(`/${shopSlug}/pos/purchases/list?status=cancelled`)}
            />
          </div>
        )}
      </div>

      {/* ================= Layer 3: Insight Section ================= */}
      <div className="bg-zinc-900 border border-zinc-800/80 p-6 rounded-2xl shadow-sm space-y-4">
        <div>
          <h2 className="text-base font-black text-white">Procurement Insights & Analysis</h2>
          <p className="text-xs text-zinc-400 mt-0.5 font-medium">สรุปยอดวงเงินการสั่งซื้อสะสมและซัพพลายเออร์หลักประจำเขตพื้นที่</p>
        </div>

        <Tabs defaultValue="monthly" className="w-full">
          <TabsList className="bg-zinc-800 p-1 rounded-xl border border-zinc-700/60">
            <TabsTrigger value="monthly" className="rounded-lg text-xs font-bold px-4 py-2 data-[state=active]:bg-gradient-to-b data-[state=active]:from-amber-400 data-[state=active]:to-orange-500 data-[state=active]:text-white text-zinc-400">
              ยอดรวมรายเดือน
            </TabsTrigger>
            <TabsTrigger value="top-suppliers" className="rounded-lg text-xs font-bold px-4 py-2 data-[state=active]:bg-gradient-to-b data-[state=active]:from-amber-400 data-[state=active]:to-orange-500 data-[state=active]:text-white text-zinc-400">
              Supplier ยอดนิยม
            </TabsTrigger>
          </TabsList>

          <TabsContent value="monthly" className="outline-none pt-2">
            {!monthlyUI.loaded ? (
              <EmptyBox
                title="ยังไม่ได้โหลดข้อมูลยอดรวมรายเดือน"
                desc="ใน Task นี้เรายก Executive layer ให้ครบก่อน — กราฟจะเชื่อม aggregation ใน Task ถัดไป"
                clickable
                loading={monthlyUI.loading}
                onClick={() => setMonthlyUI((prev) => ({ ...prev, loaded: true, lastLoadedAt: new Date() }))}
              />
            ) : (
              <Card className="border border-zinc-800 bg-zinc-900/40 rounded-2xl shadow-none">
                <CardContent className="p-5">
                  <div className="text-sm font-bold text-zinc-200">วิเคราะห์ทิศทางวงเงินการจัดซื้อรายเดือน</div>
                  <div className="text-xs text-zinc-400 mt-1.5 leading-relaxed font-medium">
                    (Placeholder) — ในเฟสถัดไปจะเพิ่มการคำนวณ 2 มิติหลัก: จำนวน PO + มูลค่าเงินหมุนเวียนสุทธิ พร้อมช่วงคัดกรองเวลา 30 วัน, 90 วัน และรอบปีบัญชีปัจจุบัน
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="top-suppliers" className="outline-none pt-2">
            {!supplierUI.loaded ? (
              <EmptyBox
                title="ยังไม่ได้โหลดรายชื่อ Supplier ยอดนิยม"
                desc="ใน Task นี้ยังไม่เพิ่ม query ใหม่ — จะทำระบบจัดอันดับมูลค่าคู่ค้า Supplier ใน Task ถัดไป"
                clickable
                loading={supplierUI.loading}
                onClick={() => setSupplierUI((prev) => ({ ...prev, loaded: true, lastLoadedAt: new Date() }))}
              />
            ) : (
              <Card className="border border-zinc-800 bg-zinc-900/40 rounded-2xl shadow-none">
                <CardContent className="p-5">
                  <div className="text-sm font-bold text-zinc-200">อันดับคู่ค้า / ซัพพลายเออร์ที่มียอดสั่งซื้อสูงสุด</div>
                  <div className="text-xs text-zinc-400 mt-1.5 leading-relaxed font-medium">
                    (Placeholder) — ระบบ Agent สแตนด์บายรอผูกกับ API ดึงตารางรายชื่อบริษัทคู่ค้าและสัดส่วนเปอร์เซ็นต์ความคุ้มค่าในการกระจายคลังสินค้า
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

    </div>
  );
};

export default PurchaseDashboardPage;