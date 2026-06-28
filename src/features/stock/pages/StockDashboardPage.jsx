// src/features/stock/pages/StockDashboardPage.jsx
// P1 Style: Operational Overview (ระดับพนักงานสต๊อก)
// 🎨 Minimal Platinum Light Mode Edition (User Feedback Optimized — High Contrast Layout)

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom'; // 🟢 ดึง useParams มาเพื่อแกะชื่อร้านพาร์ตเนอร์
import useStockStore from '@/features/stock/store/stockStore';

// =============================
// Small UI Components
// =============================

const ArrowRight = (props) => (
  <svg
    viewBox="0 0 24 24"
    width="18"
    height="18"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    {...props}
  >
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </svg>
);

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

const Button = ({ children, onClick, disabled, variant = 'primary' }) => {
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

const Section = ({ title, subtitle, right, children }) => (
  <section className="mb-10">
    <header className="mb-4 flex items-start justify-between gap-4 select-none">
      <div>
        <h2 className="text-base font-black text-slate-900">{title}</h2>
        {subtitle && <p className="text-xs text-slate-400 font-bold mt-0.5">{subtitle}</p>}
      </div>
      {right}
    </header>
    {children}
  </section>
);

const EmptyBox = ({ title, desc, action, onClick, clickable = false, loading = false }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={!clickable || loading}
    className={`w-full rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-6 shadow-inner text-left transition-all duration-200 ${clickable ? 'hover:border-orange-500/40 hover:bg-white hover:-translate-y-0.5 cursor-pointer' : 'cursor-default'} ${loading ? 'opacity-70 cursor-wait' : ''}`}
    aria-label={title}
  >
    <div className="text-sm font-black text-slate-900">{title}</div>
    {desc && <div className="text-xs text-slate-500 mt-1.5 leading-snug font-bold">{desc}</div>}
    {action && <div className="mt-4">{action}</div>}

    {clickable && !action && (
      <div className="mt-4 inline-flex items-center gap-2 text-xs text-orange-600 font-black select-none">
        <span className="rounded-lg bg-orange-500/10 border border-orange-500/20 px-2.5 py-1">แตะเพื่อสั่งโหลดข้อมูล</span>
        <span className="text-[11px] text-slate-400 font-bold">(ระบบไม่โหลดอัตโนมัติ)</span>
      </div>
    )}
  </button>
);

const SummaryCard = ({ label, value, color, onClick, clickable = false, hint }) => {
  const colorMap = {
    green: 'border-emerald-500/20 bg-white text-slate-900 hover:border-emerald-500/40',
    blue: 'border-blue-500/20 bg-white text-slate-900 hover:border-blue-500/40',
    rose: 'border-rose-500/20 bg-white text-slate-900 hover:border-rose-500/40',
    amber: 'border-orange-500/20 bg-white text-slate-900 hover:border-orange-500/40',
    zinc: 'border-slate-200 bg-white text-slate-900 hover:border-slate-400',
  };

  const labelTone = {
    green: 'text-emerald-600',
    blue: 'text-blue-600',
    rose: 'text-rose-600',
    amber: 'text-orange-600',
    zinc: 'text-slate-400',
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!clickable}
      className={`w-full rounded-2xl border px-5 py-4 shadow-[0_4px_20px_rgba(0,0,0,0.01)] text-left transition-all duration-200 ${colorMap[color]} ${clickable ? 'hover:shadow-md hover:-translate-y-0.5 cursor-pointer' : 'cursor-default'}`}
      aria-label={label}
    >
      <div className={`text-[11px] font-black uppercase tracking-wider ${labelTone[color] || 'text-slate-400'}`}>{label}</div>
      <div className="text-xl font-black mt-1.5 tracking-tight text-slate-900">{value}</div>
      {clickable && (
        <div className="text-[11px] mt-2 font-black text-orange-600 opacity-90">
          {hint || 'แตะเพื่อเรียกดูตาราง'}
        </div>
      )}
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

const MiniChip = ({ label, value, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600 shadow-sm hover:bg-slate-50 hover:text-slate-900 transition font-bold"
  >
    <span className="opacity-70 font-medium">{label}</span>
    <span className="font-black text-orange-600">{value}</span>
  </button>
);

// =============================
// Executive UI (signal + actions)
// =============================

const HealthBadge = ({ tone = 'neutral', title, subtitle }) => {
  const toneMap = {
    good: 'border-emerald-500/20 bg-emerald-500/5 text-slate-900',
    warn: 'border-orange-500/20 bg-orange-500/5 text-slate-900',
    critical: 'border-rose-500/20 bg-rose-500/5 text-slate-900',
    neutral: 'border-slate-200 bg-white text-slate-900',
  };

  const dotMap = {
    good: 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]',
    warn: 'bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.3)]',
    critical: 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.3)]',
    neutral: 'bg-slate-400',
  };

  return (
    <div className={`w-full rounded-2xl border px-5 py-4 shadow-[0_4px_20px_rgba(0,0,0,0.01)] ${toneMap[tone] || toneMap.neutral}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 select-none">
            <span className={`h-2 w-2 rounded-full ${dotMap[tone] || dotMap.neutral} animate-pulse`} />
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Inventory Health Status</div>
          </div>
          <div className="text-base font-black mt-1.5 leading-tight text-slate-900">{title}</div>
          {subtitle && <div className="text-xs mt-1 text-slate-500 font-bold leading-snug">{subtitle}</div>}
        </div>
        <div className="hidden sm:flex flex-col items-end gap-2 select-none">
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">Executive Summary</div>
        </div>
      </div>
    </div>
  );
};

const ActionItem = ({ title, desc, tone = 'neutral', ctaLabel = 'ไปดู', onClick, disabled = false }) => {
  const toneMap = {
    critical: 'border-rose-500/20 bg-rose-500/5',
    warn: 'border-orange-500/20 bg-orange-500/5',
    neutral: 'border-slate-200 bg-white',
  };

  return (
    <div className={`rounded-2xl border p-4 shadow-[0_4px_20px_rgba(0,0,0,0.01)] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 transition-all duration-200 hover:shadow-md ${toneMap[tone] || toneMap.neutral}`}>
      <div className="min-w-0">
        <div className="text-sm font-black text-slate-900 truncate">{title}</div>
        {desc && <div className="text-xs text-slate-500 mt-0.5 font-bold leading-snug">{desc}</div>}
      </div>
      <Button variant="subtle" onClick={onClick} disabled={disabled}>
        <span className="text-xs font-bold">{ctaLabel}</span>
        <ArrowRight className="ml-1 opacity-70 w-3.5 h-3.5" />
      </Button>
    </div>
  );
};

// =============================
// Page Component
// =============================

const StockDashboardPage = () => {
  const navigate = useNavigate();
  const { shopSlug } = useParams(); // 🟢 แกะตัวแปร Tenant บ่งบอกแบรนด์พาร์ตเนอร์จากพิกัด URL

  // Store selectors
  const loadOverviewAction = useStockStore((s) => s?.loadDashboardOverviewAction);
  const loadAuditInProgressAction = useStockStore((s) => s?.loadDashboardAuditInProgressAction);
  const loadRiskAction = useStockStore((s) => s?.loadDashboardRiskAction);

  const overviewState = useStockStore((s) => s?.dashboardOverview);
  const auditState = useStockStore((s) => s?.dashboardAuditInProgress);
  const riskState = useStockStore((s) => s?.dashboardRisk);

  // Local UI states
  const [overviewUI, setOverviewUI] = useState({
    loaded: Boolean(overviewState?.data),
    loading: false,
    error: null,
    lastLoadedAt: overviewState?.lastLoadedAt ?? null,
    data: overviewState?.data ?? null,
  });

  const [auditUI, setAuditUI] = useState({
    loaded: Boolean(auditState?.data),
    loading: false,
    error: null,
    lastLoadedAt: auditState?.lastLoadedAt ?? null,
    data: auditState?.data ?? null,
  });

  const [riskUI, setRiskUI] = useState({
    loaded: Boolean(riskState?.data),
    loading: false,
    error: null,
    lastLoadedAt: riskState?.lastLoadedAt ?? null,
    data: riskState?.data ?? null,
  });

  // Keep UI states in sync with store snapshots
  useEffect(() => {
    if (!overviewState) return;
    setOverviewUI((prev) => ({
      ...prev,
      loaded: Boolean(overviewState?.data),
      data: overviewState?.data ?? null,
      lastLoadedAt: overviewState?.lastLoadedAt ?? prev.lastLoadedAt,
      error: overviewState?.error ?? prev.error,
      loading: Boolean(overviewState?.loading),
    }));
  }, [overviewState]);

  useEffect(() => {
    if (!auditState) return;
    setAuditUI((prev) => ({
      ...prev,
      loaded: Boolean(auditState?.data),
      data: auditState?.data ?? null,
      lastLoadedAt: auditState?.lastLoadedAt ?? prev.lastLoadedAt,
      error: auditState?.error ?? prev.error,
      loading: Boolean(auditState?.loading),
    }));
  }, [auditState]);

  useEffect(() => {
    if (!riskState) return;
    setRiskUI((prev) => ({
      ...prev,
      loaded: Boolean(riskState?.data),
      data: riskState?.data ?? null,
      lastLoadedAt: riskState?.lastLoadedAt ?? prev.lastLoadedAt,
      error: riskState?.error ?? prev.error,
      loading: Boolean(riskState?.loading),
    }));
  }, [riskState]);

  // Handler (manual load per block)
  const safeLoad = useCallback(
    async (blockKey) => {
      const setters = { overview: setOverviewUI, audit: setAuditUI, risk: setRiskUI };
      const actions = { overview: loadOverviewAction, audit: loadAuditInProgressAction, risk: loadRiskAction };
      const storeKeyMap = { overview: 'dashboardOverview', audit: 'dashboardAuditInProgress', risk: 'dashboardRisk' };

      const setState = setters[blockKey];
      const action = actions[blockKey];
      const storeKey = storeKeyMap[blockKey];

      if (!setState) return;

      if (!action) {
        setState((prev) => ({
          ...prev,
          loaded: false,
          loading: false,
          error: 'ยังไม่เชื่อม store/action สำหรับบล็อกนี้',
        }));
        return;
      }

      try {
        setState((prev) => ({ ...prev, loading: true, error: null }));
        const result = await action();
        if (result && result.ok === false) {
          throw new Error(result.error || 'โหลดข้อมูลไม่สำเร็จ');
        }

        const latest = useStockStore?.getState ? useStockStore.getState() : null;
        const latestBlock = latest?.[storeKey];
        if (latestBlock?.error) {
          throw new Error(latestBlock.error);
        }

        setState((prev) => ({
          ...prev,
          loaded: true,
          loading: false,
          error: null,
          lastLoadedAt: new Date(),
        }));
      } catch (err) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: err?.message || 'โหลดข้อมูลไม่สำเร็จ',
        }));
      }
    },
    [loadOverviewAction, loadAuditInProgressAction, loadRiskAction]
  );

  const overviewCards = useMemo(() => {
    const data = overviewUI.data;
    if (!data) return null;
    return {
      inStock: Number(data.inStock ?? 0),
      claimed: Number(data.claimed ?? 0),
      soldToday: Number(data.soldToday ?? 0),
      missingPendingReview: Number(data.missingPendingReview ?? 0),
    };
  }, [overviewUI.data]);

  const overviewExtras = useMemo(() => {
    const data = overviewUI.data;
    if (!data) return null;
    const structuredTotal = Number(data?.structured?.total ?? data?.totalStockItems ?? NaN);
    const simpleNetAvailable = Number(data?.simple?.netAvailable ?? data?.simpleNetAvailable ?? NaN);
    return {
      hasStructuredTotal: Number.isFinite(structuredTotal),
      structuredTotal: Number.isFinite(structuredTotal) ? structuredTotal : 0,
      hasSimpleNetAvailable: Number.isFinite(simpleNetAvailable),
      simpleNetAvailable: Number.isFinite(simpleNetAvailable) ? simpleNetAvailable : 0,
    };
  }, [overviewUI.data]);

  const riskCards = useMemo(() => {
    const data = riskUI.data;
    if (!data) return null;
    return {
      lost: Number(data.lost ?? 0),
      damaged: Number(data.damaged ?? 0),
      used: Number(data.used ?? 0),
      returned: Number(data.returned ?? 0),
    };
  }, [riskUI.data]);

  const auditData = auditUI.data;

  const lastUpdatedAll = useMemo(() => {
    const dates = [overviewUI.lastLoadedAt, auditUI.lastLoadedAt, riskUI.lastLoadedAt]
      .filter(Boolean)
      .map((d) => (typeof d === 'string' || typeof d === 'number' ? new Date(d) : d))
      .filter((d) => d instanceof Date && !Number.isNaN(d.getTime()));
    if (!dates.length) return null;
    return new Date(Math.max(...dates.map((d) => d.getTime())));
  }, [overviewUI.lastLoadedAt, auditUI.lastLoadedAt, riskUI.lastLoadedAt]);

  const riskTotal = useMemo(() => {
    if (!riskCards) return null;
    return (riskCards.lost || 0) + (riskCards.damaged || 0) + (riskCards.used || 0) + (riskCards.returned || 0);
  }, [riskCards]);

  // 🟢 FIXED: คัดกรองสุขภาพแบบมินิมอล หากสถานะปกติดี (good) จะส่งค่าปลดล็อคกลับไปแบบเรียบง่าย ไม่สร้างกล่องใหญ่ครอบทับซ้ำซ้อน
  const health = useMemo(() => {
    if (!overviewCards && !riskCards && !auditUI.loaded) {
      return {
        tone: 'neutral',
        title: 'ยังไม่ได้โหลดข้อมูลพอสำหรับสรุปสุขภาพสต๊อก',
        subtitle: 'กด “โหลดทั้งหมด” เพื่อดูภาพรวม + งานค้าง + ความเสี่ยงในครั้งเดียว (ระบบแมนนวลไม่โหลดอัตโนมัติ)',
      };
    }

    const inStock = overviewCards?.inStock ?? null;
    const missing = overviewCards?.missingPendingReview ?? null;
    const claimed = overviewCards?.claimed ?? null;
    const soldToday = overviewCards?.soldToday ?? null;
    const hasAuditInProgress = Boolean(auditData);
    const rt = typeof riskTotal === 'number' ? riskTotal : null;

    const flags = {
      missing: typeof missing === 'number' && missing > 0,
      risk: typeof rt === 'number' && rt > 0,
      audit: hasAuditInProgress,
      claimedHigh: typeof claimed === 'number' && claimed >= 10,
      inStockLow: typeof inStock === 'number' && inStock <= 0,
    };

    if ((flags.missing && missing >= 5) || (flags.risk && rt >= 5) || (flags.inStockLow && (flags.missing || flags.risk))) {
      const parts = [];
      if (flags.missing) parts.push(`ต้องตรวจสอบ ${missing} รายการ`);
      if (flags.risk) parts.push(`ความเสี่ยง ${rt} รายการ`);
      if (flags.inStockLow) parts.push('ไม่มีสินค้าพร้อมขาย');
      if (flags.audit) parts.push('มีรอบตรวจนับค้าง');
      return { tone: 'critical', title: 'CRITICAL WARNING', subtitle: parts.join(' • ') };
    }

    if (flags.missing || flags.risk || flags.audit || flags.claimedHigh) {
      const parts = [];
      if (flags.missing) parts.push(`ต้องตรวจสอบ ${missing} รายการ`);
      if (flags.risk) parts.push(`ความเสี่ยง ${rt} รายการ`);
      if (flags.audit) parts.push('มีรอบตรวจนับที่กำลังทำอยู่');
      if (flags.claimedHigh) parts.push(`CLAIMED สูง (${claimed})`);
      return { tone: 'warn', title: 'WARNING STATUS', subtitle: parts.join(' • ') };
    }

    return null; // 🟢 สภาพปกติ = ส่งค่า null ตัดกล่องซ้อนทับออกทันที
  }, [overviewCards, riskCards, riskTotal, auditData, auditUI.loaded]);

  const loadAllAction = useCallback(async () => {
    await safeLoad('overview');
    await safeLoad('audit');
    await safeLoad('risk');
  }, [safeLoad]);

  const immediateActions = useMemo(() => {
    const items = [];

    if (!overviewUI.loaded) {
      items.push({
        tone: 'neutral',
        title: 'โหลดภาพรวมงานสต๊อก',
        desc: 'IN_STOCK / CLAIMED / SOLD Today / MISSING_PENDING_REVIEW',
        ctaLabel: overviewUI.loading ? 'กำลังโหลด...' : 'โหลด',
        onClick: () => safeLoad('overview'),
        disabled: overviewUI.loading,
      });
    }

    if (!auditUI.loaded) {
      items.push({
        tone: 'neutral',
        title: 'เช็คว่ามีรอบตรวจนับค้างหรือไม่',
        desc: 'ถ้ามี → กลับไปทำต่อได้ทันที',
        ctaLabel: auditUI.loading ? 'กำลังโหลด...' : 'โหลด',
        onClick: () => safeLoad('audit'),
        disabled: auditUI.loading,
      });
    }

    if (!riskUI.loaded) {
      items.push({
        tone: 'neutral',
        title: 'โหลด Risk Snapshot',
        desc: 'LOST / DAMAGED / USED / RETURNED',
        ctaLabel: riskUI.loading ? 'กำลังโหลด...' : 'โหลด',
        onClick: () => safeLoad('risk'),
        disabled: riskUI.loading,
      });
    }

    if (overviewCards) {
      if ((overviewCards.missingPendingReview || 0) > 0) {
        items.push({
          tone: 'critical',
          title: `ต้องตรวจสอบ (MISSING_PENDING_REVIEW) ${overviewCards.missingPendingReview} รายการ`,
          desc: 'เคลียร์รายการที่ต้องตรวจสอบเพื่อลดความเสี่ยงสต๊อก',
          ctaLabel: 'ตรวจสอบ',
          onClick: () => navigate(`/${shopSlug}/pos/stock/items?status=MISSING_PENDING_REVIEW`),
          disabled: false,
        });
      }

      if ((overviewCards.claimed || 0) > 0) {
        items.push({
          tone: 'warn',
          title: `สินค้าถูกจอง (CLAIMED) ${overviewCards.claimed} รายการ`,
          desc: 'ตรวจสอบว่ามีรายการจองค้าง/เคลียร์สถานะให้ถูกต้อง',
          ctaLabel: 'ดูรายการ',
          onClick: () => navigate(`/${shopSlug}/pos/stock/items?status=CLAIMED`),
          disabled: false,
        });
      }

      if ((overviewCards.inStock || 0) <= 0) {
        items.push({
          tone: 'warn',
          title: 'ไม่มีสินค้าพร้อมขาย (IN_STOCK = 0)',
          desc: 'ตรวจสอบว่ามีการรับเข้าแล้วหรือมีสถานะค้างอยู่',
          ctaLabel: 'ดูทั้งหมด',
          onClick: () => navigate(`/${shopSlug}/pos/stock/items`),
          disabled: false,
        });
      }
    }

    if (auditData) {
      items.push({
        tone: 'warn',
        title: 'มีรอบตรวจนับที่กำลังทำอยู่',
        desc: 'กลับไปทำต่อเพื่อให้รอบตรวจจบและข้อมูลสต๊อกนิ่ง',
        ctaLabel: 'ทำต่อ',
        onClick: () => navigate(auditData.mode === 'FULL' ? `/${shopSlug}/pos/stock/stock-audit` : `/${shopSlug}/pos/stock/ready-audit`),
        disabled: false,
      });
    }

    if (riskCards && typeof riskTotal === 'number' && riskTotal > 0) {
      items.push({
        tone: riskTotal >= 5 ? 'critical' : 'warn',
        title: `พบความเสี่ยงสต๊อก ${riskTotal} รายการ`,
        desc: 'แนะนำให้เคลียร์ LOST / DAMAGED / USED / RETURNED ให้ชัดเจน',
        ctaLabel: 'ดู Risk',
        onClick: () => navigate(`/${shopSlug}/pos/stock/items?status=LOST`),
        disabled: false,
      });
    }

    if (items.length === 0) {
      items.push({
        tone: 'neutral',
        title: 'ไม่มีงานเร่งด่วนในสต๊อกตอนนี้',
        desc: 'สุขภาพสต๊อกปกติ — ใช้ปุ่มรีเฟรชเป็นระยะเพื่อตรวจสอบความเปลี่ยนแปลง',
        ctaLabel: 'รีเฟรชทั้งหมด',
        onClick: () => loadAllAction(),
        disabled: false,
      });
    }

    return items.slice(0, 5);
  }, [overviewUI.loaded, overviewUI.loading, auditUI.loaded, auditUI.loading, riskUI.loaded, riskUI.loading, overviewCards, auditData, riskCards, riskTotal, navigate, safeLoad, loadAllAction, shopSlug]);

  return (
    // 🟢 PLATINUM LIGHT MODE OVERHAUL: ล้างความมืดทึมออก เปลี่ยนเฉดสว่าง คลีน ตัวหนังสือสีกราไฟต์เข้มอ่านง่ายชัดเจน
    <div className="space-y-6 animate-fadeIn p-4 md:p-6 bg-slate-50 min-h-screen text-slate-800 font-sans">
      
      {/* ================= 🟦 ส่วนหัวภาพรวมของแผงควบคุมสไตล์ Glassmorphism ================= */}
      <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-[0_4px_25px_rgba(0,0,0,0.01)] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 transition-all select-none">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">ภาพรวมระบบคลังสินค้า (Stock Overview)</h1>
            {overviewUI.loaded && !health && (
              <span className="text-[9px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider flex items-center gap-1 select-none">
                <span className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" /> Status Normal
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 font-bold mt-0.5 tracking-wide">Operational Stock Control Panel • โฟกัสงานคลังและปริมาณสินค้าหมุนเวียนหน้าร้าน</p>
          {lastUpdatedAll && (
            <div className="text-[10px] font-mono text-slate-400 font-black mt-1.5">🔄 อัปเดตล่าสุด: {formatTimeAgo(lastUpdatedAll)}</div>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button variant="subtle" onClick={loadAllAction} disabled={overviewUI.loading || auditUI.loading || riskUI.loading}>
            {(overviewUI.loading || auditUI.loading || riskUI.loading) ? 'กำลังสตรีม...' : 'โหลดข้อมูลทั้งหมด'}
          </Button>
        </div>
      </div>

      {/* บล็อกสรุปสุขภาพคลังแบบบริหารจัดการ (จะแสดงผลแบบกล่องต่อเมื่อมีสภาวะแจ้งเตือนผิดปกติเท่านั้น) */}
      {health && (
        <div className="w-full">
          <HealthBadge tone={health.tone} title={health.title} subtitle={health.subtitle} />
        </div>
      )}

      {/* ================= Section: Immediate Actions ================= */}
      <Section title="Immediate Actions" subtitle="สิ่งที่ควรดำเนินการตอนนี้ (เพื่อปรับดุลบัญชีสต็อกให้นิ่งและลดอัตราสินค้าสูญหาย)">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {immediateActions.map((it, idx) => (
            <ActionItem
              key={`act-${idx}`}
              tone={it.tone}
              title={it.title}
              desc={it.desc}
              ctaLabel={it.ctaLabel}
              onClick={it.onClick}
              disabled={it.disabled}
            />
          ))}
        </div>
      </Section>

      {/* ================= Block A: Overview ================= */}
      <Section
        title="ภาพรวมปริมาณงานสต๊อกพัสดุ"
        subtitle="แกนวัดสินค้าคงคลัง ข้อมูลพร้อมขายหน้าร้าน และรายงานสินค้าถูกจองค้างงวด"
        right={overviewUI.loaded ? (
          <div className="flex items-center gap-2 select-none">
            {overviewUI.lastLoadedAt && (
              <span className="text-[11px] text-slate-400 font-mono font-bold">เช็คข้อมูลเมื่อ: {formatTimeAgo(overviewUI.lastLoadedAt)}</span>
            )}
            <Button variant="subtle" onClick={() => safeLoad('overview')} disabled={overviewUI.loading}>
              {overviewUI.loading ? 'กำลังเรียก...' : 'รีเฟรชยอดคลัง'}
            </Button>
          </div>
        ) : null}
      >
        <ErrorStrip message={overviewUI.error} onRetry={() => safeLoad('overview')} retrying={overviewUI.loading} />

        {!overviewUI.loaded && (
          <EmptyBox
            title="สถิติภาพรวมสต๊อกยังไม่ได้โหลดสิทธิ์"
            desc={overviewUI.error || 'แตะที่กล่องผืนผ้านี้เพื่อเริ่มต้นส่งคำสั่งรันจำนวนตัวเลขคงคลังสถิติล่าสุด'}
            clickable
            loading={overviewUI.loading}
            onClick={() => safeLoad('overview')}
          />
        )}

        {overviewUI.loaded && overviewCards && (
          <div className="space-y-4">
            {(overviewExtras?.hasStructuredTotal || overviewExtras?.hasSimpleNetAvailable) && (
              <div className="flex flex-wrap items-center gap-2 select-none">
                {overviewExtras?.hasSimpleNetAvailable && (
                  <MiniChip
                    label="สินค้าพร้อมขายแบบไม่ยิง SN (SIMPLE)"
                    value={overviewExtras.simpleNetAvailable}
                    onClick={() => navigate(`/${shopSlug}/pos/stock/simple`)}
                  />
                )}
                {overviewExtras?.hasStructuredTotal && (
                  <MiniChip
                    label="จำนวนชุดไอเทมซีเรียลนัมเบอร์ (STRUCTURED)"
                    value={overviewExtras.structuredTotal}
                    onClick={() => navigate(`/${shopSlug}/pos/stock/items`)}
                  />
                )}
              </div>
            )}

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <SummaryCard
                label="สินค้าพร้อมจำหน่าย (IN_STOCK)"
                value={overviewCards.inStock}
                color="green"
                clickable
                onClick={() => navigate(`/${shopSlug}/pos/stock/items?status=IN_STOCK`)}
                hint="เรียกดูตารางสินค้าพร้อมขาย"
              />
              <SummaryCard
                label="สินค้าถูกจองค้างบิล (CLAIMED)"
                value={overviewCards.claimed}
                color="blue"
                clickable
                onClick={() => navigate(`/${shopSlug}/pos/stock/items?status=CLAIMED`)}
                hint="เรียกดูรายการที่ถูกจอง"
              />
              <SummaryCard
                label="ตัดขายวันนี้ (SOLD Today)"
                value={overviewCards.soldToday}
                color="zinc"
                clickable
                onClick={() => navigate(`/${shopSlug}/pos/stock/items?status=SOLD&date=today`)}
                hint="ประวัติขายวันนี้ (อิงสิทธิ์ soldAt)"
              />
              <SummaryCard
                label="ต้องส่งการตรวจสอบ (MISSING)"
                value={overviewCards.missingPendingReview}
                color="amber"
                clickable
                onClick={() => navigate(`/${shopSlug}/pos/stock/items?status=MISSING_PENDING_REVIEW`)}
                hint="เรียกดูรายการที่ต้องตรวจสอบ"
              />
            </div>
          </div>
        )}
      </Section>

      {/* ================= Block B: Audit In Progress ================= */}
      <Section
        title="ความคืบหน้ารอบตรวจนับสินค้าค้างงาน"
        subtitle="ตรวจสอบกระบวนการเช็คสต็อกสินค้าทางกายภาพเพื่อปรับยอด Re-reconcile บัญชีสาขา"
        right={auditUI.loaded ? (
          <div className="flex items-center gap-2 select-none">
            {auditUI.lastLoadedAt && (
              <span className="text-[11px] text-slate-400 font-mono font-bold">เช็คข้อมูลเมื่อ: {formatTimeAgo(auditUI.lastLoadedAt)}</span>
            )}
            <Button variant="subtle" onClick={() => safeLoad('audit')} disabled={auditUI.loading}>
              {auditUI.loading ? 'กำลังเรียก...' : 'รีเฟรชสเตตัสนับ'}
            </Button>
          </div>
        ) : null}
      >
        <ErrorStrip message={auditUI.error} onRetry={() => safeLoad('audit')} retrying={auditUI.loading} />

        {!auditUI.loaded && (
          <EmptyBox
            title="บันทึกการตรวจนับสต๊อกค้างงวดยังไม่ได้โหลดสิทธิ์"
            desc={auditUI.error || 'แตะที่กล่องผืนผ้านี้เพื่อดึงสเตตัสประวัติรอบตรวจนับปัจจุบัน'}
            clickable
            loading={auditUI.loading}
            onClick={() => safeLoad('audit')}
          />
        )}

        {auditUI.loaded && (
          <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-[0_4px_25px_rgba(0,0,0,0.01)]">
            {!auditData ? (
              <div className="text-sm text-slate-400 font-bold py-2 italic text-center select-none">👍 ไม่พบรอบบันทึกตรวจนับพัสดุค้างคาในระบบหลังบ้าน ณ เวลานี้</div>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <div className="text-sm font-black text-slate-900">
                      ระดับการควบคุมรอบ: <span className="text-orange-600 bg-orange-50 px-2 py-0.5 border border-orange-200/60 rounded-md font-mono text-xs">{auditData.mode === 'FULL' ? 'FULL AUDIT MODE' : 'READY SNAPSHOT MODE'}</span>
                    </div>
                    <div className="text-xs text-slate-400 mt-2 font-mono font-bold select-none">
                      STARTED TIME: {auditData.startedAt ? new Date(auditData.startedAt).toLocaleString('th-TH') : '-'}
                    </div>
                    {auditData?.employee?.name && (
                      <div className="text-xs text-slate-500 mt-1 font-bold">เจ้าหน้าที่ผู้รับผิดชอบรอบตรวจ: <span className="text-slate-800 font-black">{auditData.employee.name}</span></div>
                    )}
                  </div>
                  <Button
                    variant="primary"
                    onClick={() =>
                      navigate(auditData.mode === 'FULL' ? `/${shopSlug}/pos/stock/stock-audit` : `/${shopSlug}/pos/stock/ready-audit`)
                    }
                  >
                    เข้าสู่หน้าจอนับต่อ
                  </Button>
                </div>

                <div className="grid grid-cols-3 gap-4 select-none">
                  <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                    <div className="text-xs text-slate-400 font-black uppercase tracking-wider">เป้าหมายที่คาดไว้</div>
                    <div className="text-lg font-black text-slate-900 mt-1">{auditData.expectedCount ?? 0} ชิ้น</div>
                  </div>
                  <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                    <div className="text-xs text-slate-400 font-black uppercase tracking-wider">ยิงเลเซอร์นับแล้ว</div>
                    <div className="text-lg font-black text-slate-900 mt-1">{auditData.scannedCount ?? 0} ชิ้น</div>
                  </div>
                  <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                    <div className="text-xs text-slate-400 font-black uppercase tracking-wider">ความคืบหน้าภาพรวม</div>
                    <div className="text-lg font-black text-orange-600 mt-1">
                      {auditData.expectedCount > 0
                        ? `${Math.round((auditData.scannedCount / auditData.expectedCount) * 100)}%`
                        : '0%'}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </Section>

      {/* ================= Block C: Risk ================= */}
      <Section
        title="ดัชนีจำแนกกลุ่มความเสี่ยงและสินค้าชำรุด"
        subtitle="ตรวจสอบและพิจารณาทำลายสิทธิ์ตัดจ่ายพัสดุสูญหาย ชำรุด หรือนำไปใช้งานในสาขา"
        right={riskUI.loaded ? (
          <div className="flex items-center gap-2 select-none">
            {riskUI.lastLoadedAt && (
              <span className="text-[11px] text-slate-400 font-mono font-bold">เช็คข้อมูลเมื่อ: {formatTimeAgo(riskUI.lastLoadedAt)}</span>
            )}
            <Button variant="subtle" onClick={() => safeLoad('risk')} disabled={riskUI.loading}>
              {riskUI.loading ? 'กำลังเรียก...' : 'รีเฟรชยอดความเสี่ยง'}
            </Button>
          </div>
        ) : null}
      >
        <ErrorStrip message={riskUI.error} onRetry={() => safeLoad('risk')} retrying={riskUI.loading} />

        {!riskUI.loaded && (
          <EmptyBox
            title="ดัชนีประเมินอัตราเสี่ยงคลังยังไม่ได้โหลดสิทธิ์"
            desc={riskUI.error || 'แตะที่กล่องผืนผ้านี้เพื่อสั่งกระจายยอดความเสี่ยงสต็อกแยกรายประเภทสเตตัส (LOST / DAMAGED / USED / RETURNED)'}
            clickable
            loading={riskUI.loading}
            onClick={() => safeLoad('risk')}
          />
        )}

        {riskUI.loaded && riskCards && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <SummaryCard
              label="พัสดุสูญหาย (LOST)"
              value={riskCards.lost}
              color="rose"
              clickable
              onClick={() => navigate(`/${shopSlug}/pos/stock/items?status=LOST`)}
            />
            <SummaryCard
              label="ชำรุดเสียหาย (DAMAGED)"
              value={riskCards.damaged}
              color="amber"
              clickable
              onClick={() => navigate(`/${shopSlug}/pos/stock/items?status=DAMAGED`)}
            />
            <SummaryCard
              label="ตัดใช้ภายในบูท (USED)"
              value={riskCards.used}
              color="zinc"
              clickable
              onClick={() => navigate(`/${shopSlug}/pos/stock/items?status=USED`)}
            />
            <SummaryCard
              label="ส่งคืนบริษัทแม่ (RETURNED)"
              value={riskCards.returned}
              color="blue"
              clickable
              onClick={() => navigate(`/${shopSlug}/pos/stock/items?status=RETURNED`)}
            />
          </div>
        )}

        {riskUI.loaded && !riskCards && (
          <div className="rounded-3xl border border-slate-200 bg-white p-5 text-sm text-slate-400 font-bold italic text-center select-none animate-fadeIn">
            ✨ บัญชีปลอดภัย ไม่พบความเสี่ยงหรือสินค้าชำรุดในระบบคลังรอบนี้
          </div>
        )}
      </Section>

    </div>
  );
};

export default StockDashboardPage;