// src/features/purchaseOrder/pages/PurchaseDashboardPage.jsx
// 🏛️ Enterprise Platinum Light Mode Edition (User Feedback Optimized — Clear Reading Text)
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
  const base = 'inline-flex items-center justify-center rounded-xl px-4 py-2 text-xs font-black transition-all border shadow-sm duration-150 select-none';
  const variants = {
    primary: 'bg-gradient-to-b from-orange-500 to-amber-500 text-white border-orange-600/20 hover:from-orange-600 hover:to-amber-600 shadow-orange-500/10 active:scale-95 transform',
    subtle: 'bg-slate-800 text-slate-100 border-slate-900 hover:bg-slate-900 active:scale-95 transform',
    ghost: 'bg-transparent text-slate-500 border-transparent hover:bg-slate-100 hover:text-slate-900',
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
    <div className="mb-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 shadow-sm animate-fadeIn">
      <div className="flex items-start justify-between gap-3">
        <div className="text-xs text-rose-700 leading-snug font-medium">
          <div className="font-black text-sm">โหลดข้อมูลไม่สำเร็จ</div>
          <div className="mt-0.5 font-bold opacity-90">{String(message)}</div>
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
    className={`w-full rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-6 shadow-inner text-left transition-all duration-200 ${clickable ? 'hover:border-orange-500/40 hover:bg-white hover:-translate-y-0.5 cursor-pointer' : 'cursor-default'} ${loading ? 'opacity-70 cursor-wait' : ''}`}
    aria-label={title}
  >
    <div className="text-sm font-black text-slate-900">{title}</div>
    {desc && <div className="text-xs text-slate-500 mt-1.5 leading-snug font-bold">{desc}</div>}
    {clickable && (
      <div className="mt-4 inline-flex items-center gap-2 text-xs text-orange-600 font-black select-none">
        <span className="rounded-lg bg-orange-500/10 border border-orange-500/20 px-2.5 py-1">แตะเพื่อสั่งโหลดข้อมูล</span>
        <span className="text-[11px] text-slate-400 font-bold">(ระบบไม่โหลดอัตโนมัติ)</span>
      </div>
    )}
  </button>
);

const SummaryCard = ({ label, value, clickable = false, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={!clickable}
    className={`w-full rounded-2xl border border-slate-200 bg-slate-50/60 px-5 py-4 shadow-sm text-left transition-all duration-200 ${clickable ? 'hover:border-orange-500/40 hover:bg-white hover:shadow-md hover:-translate-y-0.5 cursor-pointer' : 'cursor-default'}`}
    aria-label={label}
  >
    <div className="text-xs text-slate-400 font-black uppercase tracking-wide">{label}</div>
    <div className="text-xl font-black text-slate-900 mt-1.5 tracking-tight">{value}</div>
    {clickable && <div className="text-[11px] mt-2 text-orange-600 font-black">แตะเพื่อเรียกดูตาราง</div>}
  </button>
);

const TrendLine = ({ tone = 'neutral', text }) => {
  if (!text) return null;
  const map = {
    neutral: 'text-slate-400',
    good: 'text-emerald-600',
    warn: 'text-orange-600',
    critical: 'text-rose-600',
  };
  return <div className={`text-[11px] mt-1.5 font-black ${map[tone] || map.neutral}`}>{text}</div>;
};

const KPIBarItem = ({ label, value, tone = 'neutral', hint, onClick }) => {
  const toneMap = {
    neutral: 'border-slate-200 bg-white text-slate-900',
    warn: 'border-orange-500/20 bg-orange-500/5 text-slate-900',
    good: 'border-emerald-500/20 bg-emerald-500/5 text-slate-900',
    critical: 'border-rose-500/20 bg-rose-500/5 text-slate-900',
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-2xl border px-4 py-3 text-left shadow-[0_4px_20px_rgba(0,0,0,0.01)] transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${toneMap[tone] || toneMap.neutral}`}
      aria-label={label}
    >
      <div className="text-[11px] text-slate-400 font-black uppercase tracking-wider select-none">{label}</div>
      <div className="text-lg font-black mt-1 leading-none text-slate-900 tracking-tight">{value}</div>
      <TrendLine tone={tone} text={hint} />
    </button>
  );
};

const HealthBanner = ({ tone = 'neutral', title, subtitle, actionLabel, onAction }) => {
  const toneMap = {
    good: 'border-emerald-500/20 bg-emerald-500/5',
    warn: 'border-orange-500/20 bg-orange-500/5',
    critical: 'border-rose-500/20 bg-rose-500/5',
    neutral: 'border-slate-200 bg-white',
  };

  const dotMap = {
    good: 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]',
    warn: 'bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.3)]',
    critical: 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.3)]',
    neutral: 'bg-slate-400',
  };

  return (
    <div className={`w-full rounded-2xl border px-5 py-4 shadow-[0_4px_20px_rgba(0,0,0,0.01)] ${toneMap[tone] || toneMap.neutral}`}>
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 select-none">
            <span className={`h-2 w-2 rounded-full ${dotMap[tone] || dotMap.neutral} animate-pulse`} />
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Procurement Health Status</div>
          </div>
          <div className="text-base font-black text-slate-900 mt-1.5 truncate tracking-tight">{title}</div>
          {subtitle && <div className="text-xs text-slate-500 mt-0.5 font-bold leading-snug">{subtitle}</div>}
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
      neutral: 'border-slate-200 bg-slate-50/60',
      warn: 'border-orange-500/20 bg-orange-500/5',
      critical: 'border-rose-500/20 bg-rose-500/5',
    };
    return (
      <button
        type="button"
        onClick={onClick}
        className={`w-full rounded-2xl border px-4 py-3 text-left shadow-sm transition-all duration-200 hover:bg-white hover:shadow-md hover:-translate-y-0.5 ${map[tone]}`}
      >
        <div className="text-[11px] text-slate-400 font-black uppercase tracking-wider">{label}</div>
        <div className="text-base font-black text-slate-900 mt-1 tracking-tight">{value}</div>
      </button>
    );
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_4px_25px_rgba(0,0,0,0.01)] space-y-4">
      <div className="flex items-start justify-between gap-3 select-none">
        <div>
          <div className="text-sm font-black text-slate-900">Aging Summary Report</div>
          <div className="text-xs text-slate-400 mt-0.5 font-bold">วิเคราะห์งานค้างตามอายุเอกสารบิล</div>
        </div>
        <div className="text-[10px] font-black bg-slate-100 text-orange-700 px-2.5 py-0.5 rounded-lg border border-slate-200/60 uppercase tracking-wide">
          งานค้างรวม {total} ใบ
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
        title: 'ยังไม่ได้เรียกข้อมูลสารบบภาพรวม',
        subtitle: 'กรุณากดคำสั่ง “โหลดทั้งหมด” เพื่อคำนวณสถิติประมวลผลดุลการค้า',
        actionLabel: 'ดึงข้อมูลภาพรวม',
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
        title: `🚨 พบใบสั่งซื้อค้างส่งวิกฤต ${oldOver15} รายการ (เกิน 15 วัน)`,
        subtitle: `รวมงานรอเคลียร์สุทธิ ${inProgress} ใบ — กรุณาติดตามคู่ค้าหรือเร่งรัดการตัดงบระบบคลังสินค้า`,
        actionLabel: 'จัดระบบบิลค้าง',
        action: () => navigate(`/${shopSlug}/pos/purchases/list?status=pending,partially_received,received,paid`),
      };
    }

    if (oldOver7 > 0) {
      return {
        tone: 'warn',
        title: `⚠️ มีเอกสาร PO รอเคลียร์สะสม ${oldOver7} รายการ (เกิน 7 วัน)`,
        subtitle: `รวมงานอยู่ในกระบวนการ ${inProgress} ใบ — ควรประมวลสเตตัสปิดจ๊อบให้ทันรอบงบบัญชี`,
        actionLabel: 'จัดระบบบิลค้าง',
        action: () => navigate(`/${shopSlug}/pos/purchases/list?status=pending,partially_received,received,paid`),
      };
    }

    if (inProgress > 0) {
      return {
        tone: 'warn',
        title: `📦 มีรายการจัดซื้ออยู่ระหว่างดำเนินงาน ${inProgress} รายการ`,
        subtitle: 'อยู่ในขั้นตอนตามท่อ (PENDING/RECEIVED/PAID) — ตรวจนับของและชำระงบตามสายพานปกติ',
        actionLabel: 'ตรวจสอบตาราง',
        action: () => navigate(`/${shopSlug}/pos/purchases/list?status=pending,partially_received,received,paid`),
      };
    }

    return {
      tone: 'good',
      title: '✨ ข้อมูลคลังนิ่งสนิท ไม่มีใบสั่งซื้อตกงวดงานค้าง',
      subtitle: `รวมเอกสารประวัติจัดซื้อเรียบร้อยทั้งสิ้น ${Number(d.total || 0)} รายการ • ใช้งานได้ปกติ`,
      actionLabel: 'ดูสมุดประวัติ',
      action: () => navigate(`/${shopSlug}/pos/purchases/list`),
    };
  }, [overviewUI.loaded, overviewUI.data, safeLoadOverview, navigate, shopSlug]);

  return (
    // 🟢 PLATINUM LIGHT MODE OVERHAUL: ล้างความมืดทึมออก เปลี่ยนเฉดสว่าง คลีน ตัวหนังสืออ่านง่ายสะใจร้อยเปอร์เซ็นต์
    <div className="space-y-6 animate-fadeIn p-4 md:p-6 bg-slate-50 min-h-screen text-slate-800 font-sans">
      
      {/* ================= 🟦 1. ส่วนหัวบอร์ดสไตล์ Glassmorphism คลีนแพลทินัม ================= */}
      <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-[0_4px_25px_rgba(0,0,0,0.01)] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 transition-all select-none">
        <div className="min-w-0">
          <h1 className="text-xl font-black text-slate-900 tracking-tight">ภาพรวมแดชบอร์ดงานจัดซื้อ (PO Overview)</h1>
          <p className="text-xs text-slate-400 mt-0.5 font-bold tracking-wide">Executive Procurement Analytics & Supplier Control Center</p>
          {lastUpdatedAll && <div className="text-[10px] font-mono text-slate-400 font-black mt-1.5">🔄 อัปเดตล่าสุด: {formatTimeAgo(lastUpdatedAll)}</div>}
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Button variant="primary" onClick={() => navigate(`/${shopSlug}/pos/purchases/create`)}>สร้างใบสั่งซื้อ PO ใหม่</Button>
          <Button variant="subtle" onClick={() => navigate(`/${shopSlug}/pos/purchases/list?status=pending,partially_received,received,paid`)}>
            เรียกดูใบสั่งซื้อค้างทั้งหมด
          </Button>
          <Button variant="subtle" onClick={loadAllAction} disabled={overviewUI.loading}>
            {overviewUI.loading ? 'กำลังสตรีม...' : 'โหลดข้อมูลทั้งหมด'}
          </Button>
        </div>
      </div>

      {/* ================= Layer 2: KPI & Health Matrix ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 select-none">
            <KPIBarItem
              label="ใบสั่งซื้อ Open PO"
              value={overviewUI.loaded && overviewUI.data ? `${overviewUI.data.openPO} ใบ` : '—'}
              tone={overviewUI.loaded && overviewUI.data && overviewUI.data.openPO > 0 ? 'warn' : 'neutral'}
              hint={overviewUI.loaded && overviewUI.data ? `เดือนนี้ ${overviewUI.data.trend.openPO_month} • 7 วัน ${overviewUI.data.trend.openPO_week}` : 'กดปุ่มเพื่อ Query ข้อมูล'}
              onClick={() => navigate(`/${shopSlug}/pos/purchases/list?status=pending`)}
            />
            <KPIBarItem
              label="บิลค้างตรวจรับของ"
              value={overviewUI.loaded && overviewUI.data ? `${overviewUI.data.awaitingReceipt} ใบ` : '—'}
              tone={overviewUI.loaded && overviewUI.data && overviewUI.data.awaitingReceipt > 0 ? 'warn' : 'neutral'}
              hint={overviewUI.loaded && overviewUI.data ? 'สถานะ RECEIVED ค้างคลัง' : ''}
              onClick={() => navigate(`/${shopSlug}/pos/purchases/list?status=partially_received,received`)}
            />
            <KPIBarItem
              label="บิลชำระงบ (รอปิดจ๊อบ)"
              value={overviewUI.loaded && overviewUI.data ? `${overviewUI.data.readyToClose} ใบ` : '—'}
              tone={overviewUI.loaded && overviewUI.data && overviewUI.data.readyToClose > 0 ? 'good' : 'neutral'}
              hint={overviewUI.loaded && overviewUI.data ? 'สถานะ PAID สรุปงวดบัญชี' : ''}
              onClick={() => navigate(`/${shopSlug}/pos/purchases/list?status=paid`)}
            />
            <KPIBarItem
              label="ปิดงานสำเร็จประจำเดือน"
              value={overviewUI.loaded && overviewUI.data ? `${overviewUI.data.completedThisMonth} ใบ` : '—'}
              tone={overviewUI.loaded && overviewUI.data && overviewUI.data.completedThisMonth > 0 ? 'good' : 'neutral'}
              hint={overviewUI.loaded && overviewUI.data ? `เทียบงบงวดก่อน ${overviewUI.data.trend.completed_month}` : ''}
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

      {/* ================= Layer 3: Document Status Snapshot ================= */}
      <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-[0_4px_25px_rgba(0,0,0,0.01)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 select-none">
          <div>
            <h2 className="text-base font-black text-slate-900">ตารางวิเคราะห์ดุลสถานภาพเอกสาร (Operational Snapshot)</h2>
            <p className="text-xs text-slate-400 font-bold mt-0.5">จำแนกปริมาณบิลที่หมุนเวียนในระบบเพื่อตัดยอดบัญชีสต็อกรายวัน</p>
          </div>
          {overviewUI.loaded && (
            <div className="flex items-center gap-3">
              <span className="text-[11px] text-slate-400 font-mono font-bold">เช็คข้อมูลเมื่อ: {formatTimeAgo(overviewUI.lastLoadedAt)}</span>
              <Button variant="subtle" onClick={safeLoadOverview} disabled={overviewUI.loading}>
                {overviewUI.loading ? 'กำลังเรียก...' : 'รีเฟรชสเตตัส'}
              </Button>
            </div>
          )}
        </div>

        <ErrorStrip message={overviewUI.error} onRetry={safeLoadOverview} retrying={overviewUI.loading} />

        {!overviewUI.loaded && (
          <EmptyBox
            title="ภาพรวมเอกสารยังไม่ได้รับการโหลดสิทธิ์"
            desc={overviewUI.error || 'กรุณาแตะที่กล่องผืนผ้านี้ หรือกดปุ่มโหลดข้อมูลทั้งหมดด้านบนเพื่อเริ่มต้นทำ Aggregation ดึงข้อมูล'}
            clickable
            loading={overviewUI.loading}
            onClick={safeLoadOverview}
          />
        )}

        {overviewUI.loaded && overviewUI.data && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <SummaryCard
              label="รอส่งของ (PENDING)"
              value={`${overviewUI.data.openPO} ใบ`}
              clickable
              onClick={() => navigate(`/${shopSlug}/pos/purchases/list?status=pending`)}
            />
            <SummaryCard
              label="ของถึงคลังรอตรวจบิล"
              value={`${overviewUI.data.awaitingReceipt} ใบ`}
              clickable
              onClick={() => navigate(`/${shopSlug}/pos/purchases/list?status=partially_received,received`)}
            />
            <SummaryCard
              label="จ่ายเงินแล้วรอปิด (PAID)"
              value={`${overviewUI.data.readyToClose} ใบ`}
              clickable
              onClick={() => navigate(`/${shopSlug}/pos/purchases/list?status=paid`)}
            />
            <SummaryCard
              label="เสร็จสมบูรณ์ (COMPLETED)"
              value={`${overviewUI.data.completed} ใบ`}
              clickable
              onClick={() => navigate(`/${shopSlug}/pos/purchases/list?status=completed`)}
            />
            <SummaryCard
              label="ยกเลิกบิลทิ้ง (CANCELLED)"
              value={`${overviewUI.data.cancelled} ใบ`}
              clickable
              onClick={() => navigate(`/${shopSlug}/pos/purchases/list?status=cancelled`)}
            />
          </div>
        )}
      </div>

      {/* ================= Layer 4: Analytics Deep Dive Insights ================= */}
      <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-[0_4px_25px_rgba(0,0,0,0.01)] space-y-4">
        <div className="select-none">
          <h2 className="text-base font-black text-slate-900">Procurement Insights & Volumetric Analysis</h2>
          <p className="text-xs text-slate-400 font-bold mt-0.5">กราฟวิเคราะห์ยอดราคาทุนสะสมและการจัดลำดับสัดส่วนมูลค่าบริษัทคู่ค้าหลัก</p>
        </div>

        <Tabs defaultValue="monthly" className="w-full">
          <TabsList className="bg-slate-100 p-1 rounded-2xl border border-slate-200/60 w-fit select-none">
            <TabsTrigger value="monthly" className="rounded-xl text-xs font-black px-5 py-2 data-[state=active]:bg-slate-900 data-[state=active]:text-white text-slate-500 transition-all duration-200">
              วิเคราะห์วงเงินรายเดือน
            </TabsTrigger>
            <TabsTrigger value="top-suppliers" className="rounded-xl text-xs font-black px-5 py-2 data-[state=active]:bg-slate-900 data-[state=active]:text-white text-slate-500 transition-all duration-200">
              อันดับ Supplier ยอดนิยม
            </TabsTrigger>
          </TabsList>

          <TabsContent value="monthly" className="outline-none pt-2 animate-fadeIn">
            {!monthlyUI.loaded ? (
              <EmptyBox
                title="ข้อมูลกราฟราคาทุนรายเดือนยังไม่ได้โหลดสิทธิ์"
                desc="โมดูล Aggregation เลเยอร์การเงินพร้อมสแตนด์บาย — กดเพื่อเรียกดูภาพจำลองข้อมูลเฟสถัดไป"
                clickable
                loading={monthlyUI.loading}
                onClick={() => setMonthlyUI((prev) => ({ ...prev, loaded: true, lastLoadedAt: new Date() }))}
              />
            ) : (
              <Card className="border border-slate-200 bg-slate-50/50 rounded-2xl shadow-none">
                <CardContent className="p-5">
                  <div className="text-sm font-black text-slate-900">แนวโน้มงบประมาณวงเงินการจัดซื้อสะสมรายสัปดาห์</div>
                  <div className="text-xs text-slate-500 mt-1.5 leading-relaxed font-bold">
                    (📊 แผงวิเคราะห์เสมือน) — ในแผนงานพาร์ตถัดไปจะทำการเรนเดอร์โครงสร้างแผนภูมิกราฟ 2 มิติ เชื่อมต่อแกนหาจำนวนใบสั่งซื้อ PO ร่วมกับยอดรวมตัวเลข Net Amount ประจำงวดงบประมาณ 30 วัน และ 90 วัน เพื่อความคมชัดสูงสุด
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="top-suppliers" className="outline-none pt-2 animate-fadeIn">
            {!supplierUI.loaded ? (
              <EmptyBox
                title="ข้อมูลสถิติมูลค่าการค้าซัพพลายเออร์ยังไม่ได้โหลดสิทธิ์"
                desc="โมดูลสถิติสัดส่วนพาร์ตเนอร์พร้อมเปิดงาน — กดเพื่อเรียกดูภาพจำลองข้อมูลเฟสถัดไป"
                clickable
                loading={supplierUI.loading}
                onClick={() => setSupplierUI((prev) => ({ ...prev, loaded: true, lastLoadedAt: new Date() }))}
              />
            ) : (
              <Card className="border border-slate-200 bg-slate-50/50 rounded-2xl shadow-none">
                <CardContent className="p-5">
                  <div className="text-sm font-black text-slate-900">การจัดอันดับบริษัทคู่ค้าซัพพลายเออร์ที่มียอดสั่งซื้อสูงสุด (Top Share)</div>
                  <div className="text-xs text-slate-500 mt-1.5 leading-relaxed font-bold">
                    (📊 แผงวิเคราะห์เสมือน) — แผงคอนโซลกลาง Agent รอดึงฐานข้อมูลมาคำนวณแยกสัดส่วนจัดอันดับยอดส่งพัสดุรายบริษัท เพื่อให้เจ้าของร้านเห็นภาพชัดเจนว่าร้านค้าพึ่งพาการกระจายคลังสินค้าไปที่ Supplier เจ้าไหนมากที่สุด
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