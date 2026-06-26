// src/features/stock/pages/StockDashboardPage.jsx
// P1 Style: Operational Overview (ระดับพนักงานสต๊อก)

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom'; // 🟢 ดึง useParams มาเพื่อแกะชื่อร้านพาร์ตเนอร์
import useStockStore from '@/features/stock/store/stockStore';

// 🟢 [CLEANED] ถอนโครงสร้าง HeaderPos และ SidebarLoader ตัวในออกเพื่อสยบบั๊กเมนูซ้อนเบิ้ล

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

// 🟢 NEW STYLE BUTTON: ปรับโทนปุ่มกดให้คมชัดและพรีเมียมในเลเยอร์สีมืด
const Button = ({ children, onClick, disabled, variant = 'primary' }) => {
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

const Section = ({ title, subtitle, right, children }) => (
  <section className="mb-10">
    <header className="mb-4 flex items-start justify-between gap-4">
      <div>
        <h2 className="text-base font-black text-white">{title}</h2>
        {subtitle && <p className="text-xs text-zinc-400 font-medium mt-0.5">{subtitle}</p>}
      </div>
      {right}
    </header>
    {children}
  </section>
);

// 🟢 NEW STYLE EMPTY BOX: กล่องลายเส้นประสีมืดรับดีไซน์สองเลเยอร์
const EmptyBox = ({ title, desc, action, onClick, clickable = false, loading = false }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={!clickable || loading}
    className={`w-full rounded-2xl border border-dashed border-zinc-800 bg-zinc-900 p-6 shadow-sm text-left transition-all duration-200 ${clickable ? 'hover:border-amber-500/40 hover:bg-zinc-800/40 hover:-translate-y-0.5 cursor-pointer' : 'cursor-default'} ${loading ? 'opacity-70 cursor-wait' : ''}`}
    aria-label={title}
  >
    <div className="text-sm font-bold text-white">{title}</div>
    {desc && <div className="text-xs text-zinc-400 mt-1.5 leading-snug font-medium">{desc}</div>}
    {action && <div className="mt-4">{action}</div>}

    {clickable && !action && (
      <div className="mt-4 inline-flex items-center gap-2 text-xs text-amber-400">
        <span className="rounded-lg bg-amber-500/10 border border-amber-500/20 px-2 py-1 font-bold">แตะเพื่อโหลด</span>
        <span className="text-[11px] text-zinc-500 font-bold">(ไม่โหลดอัตโนมัติ)</span>
      </div>
    )}
  </button>
);

// 🟢 NEW STYLE SUMMARY CARD: ย้อมสีใหม่ให้ออกแนวดาร์กโหมดพรีเมียมทั้งหมด แยกเฉดด้วยสีเส้นและป้ายอักษร
const SummaryCard = ({ label, value, color, onClick, clickable = false, hint }) => {
  const colorMap = {
    green: 'border-emerald-500/20 bg-zinc-900/60 text-white hover:border-emerald-500/40',
    blue: 'border-blue-500/20 bg-zinc-900/60 text-white hover:border-blue-500/40',
    rose: 'border-rose-500/20 bg-zinc-900/60 text-white hover:border-rose-500/40',
    amber: 'border-amber-500/20 bg-zinc-900/60 text-white hover:border-amber-500/40',
    zinc: 'border-zinc-800 bg-zinc-900/60 text-white hover:border-zinc-700',
  };

  const labelTone = {
    green: 'text-emerald-400',
    blue: 'text-blue-400',
    rose: 'text-rose-400',
    amber: 'text-amber-400',
    zinc: 'text-zinc-400',
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!clickable}
      className={`w-full rounded-2xl border px-5 py-4 shadow-sm text-left transition-all duration-200 ${colorMap[color]} ${clickable ? 'hover:shadow-xl hover:-translate-y-0.5 cursor-pointer' : 'cursor-default'}`}
      aria-label={label}
    >
      <div className={`text-[11px] font-black uppercase tracking-wider ${labelTone[color] || 'text-zinc-400'}`}>{label}</div>
      <div className="text-xl font-black mt-1.5 tracking-tight text-white">{value}</div>
      {clickable && (
        <div className="text-[11px] mt-2 font-bold text-amber-400 opacity-90">
          {hint || 'แตะเพื่อดูรายการ'}
        </div>
      )}
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

const MiniChip = ({ label, value, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="inline-flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/60 px-3 py-1.5 text-xs text-zinc-300 shadow-sm hover:bg-zinc-800 hover:text-white transition"
  >
    <span className="opacity-70 font-medium">{label}</span>
    <span className="font-black text-amber-400">{value}</span>
  </button>
);

// =============================
// Executive UI (signal + actions)
// =============================

const HealthBadge = ({ tone = 'neutral', title, subtitle }) => {
  const toneMap = {
    good: 'border-emerald-500/20 bg-emerald-500/5 text-white',
    warn: 'border-amber-500/20 bg-amber-500/5 text-white',
    critical: 'border-rose-500/20 bg-rose-500/5 text-white',
    neutral: 'border-zinc-800 bg-zinc-900/60 text-white',
  };

  const dotMap = {
    good: 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.4)]',
    warn: 'bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.4)]',
    critical: 'bg-rose-400 shadow-[0_0_10px_rgba(248,113,113,0.4)]',
    neutral: 'bg-zinc-500',
  };

  return (
    <div className={`w-full rounded-2xl border px-5 py-4 shadow-sm ${toneMap[tone] || toneMap.neutral}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${dotMap[tone] || dotMap.neutral} animate-pulse`} />
            <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Stock Health</div>
          </div>
          <div className="text-base font-black mt-1.5 leading-tight text-white">{title}</div>
          {subtitle && <div className="text-xs mt-1 text-zinc-400 font-medium leading-snug">{subtitle}</div>}
        </div>
        <div className="hidden sm:flex flex-col items-end gap-2">
          <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded-md border border-zinc-700">Executive Summary</div>
        </div>
      </div>
    </div>
  );
};

const ActionItem = ({ title, desc, tone = 'neutral', ctaLabel = 'ไปดู', onClick, disabled = false }) => {
  const toneMap = {
    critical: 'border-rose-500/20 bg-rose-500/5',
    warn: 'border-amber-500/20 bg-amber-500/5',
    neutral: 'border-zinc-800 bg-zinc-900/60',
  };

  return (
    <div className={`rounded-2xl border p-4 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 transition-all duration-200 hover:shadow-md ${toneMap[tone] || toneMap.neutral}`}>
      <div className="min-w-0">
        <div className="text-sm font-bold text-white truncate">{title}</div>
        {desc && <div className="text-xs text-zinc-400 mt-0.5 font-medium leading-snug">{desc}</div>}
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
      return { tone: 'critical', title: 'CRITICAL', subtitle: parts.join(' • ') };
    }

    if (flags.missing || flags.risk || flags.audit || flags.claimedHigh) {
      const parts = [];
      if (flags.missing) parts.push(`ต้องตรวจสอบ ${missing} รายการ`);
      if (flags.risk) parts.push(`ความเสี่ยง ${rt} รายการ`);
      if (flags.audit) parts.push('มีรอบตรวจนับที่กำลังทำอยู่');
      if (flags.claimedHigh) parts.push(`CLAIMED สูง (${claimed})`);
      return { tone: 'warn', title: 'WARNING', subtitle: parts.join(' • ') };
    }

    return null; // 🟢 สภาพปกติ = ส่งค่า null ตัดกล่องซ้อนทับออกทันที
  }, [overviewCards, riskCards, riskTotal, auditData, auditUI.loaded]);

  const loadAllAction = useCallback(async () => {
    await safeLoad('overview');
    await safeLoad('audit');
    await safeLoad('risk');
  }, [safeLoad]);

  // 🟢 [DYNAMIC PATH FIX] ปรับแต่งท่อทางเดินรถให้สืบทอดค่าชื่อสาขาร้านค้า (shopSlug) เสมอ
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
    // 🟢 FIXED: เปลี่ยนพื้นหลังรากฐานเป็น bg-slate-900 และคง p-6 ไว้เพื่อสร้างมิติตัดขอบการ์ดลอยแบบ Layered Depth ที่ต้องการ
    <div className="space-y-6 animate-fadeIn p-6 bg-slate-900 min-h-screen text-white">
      
      {/* ส่วนหัวภาพรวมของแผงควบคุม */}
      <div className="bg-zinc-900 border border-zinc-800/80 p-6 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-black text-white">ภาพรวมระบบคลังสินค้า</h1>
            {overviewUI.loaded && !health && (
              <span className="text-[9px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider flex items-center gap-1 select-none">
                <span className="h-1 w-1 rounded-full bg-emerald-400 animate-pulse" /> Status Normal
              </span>
            )}
          </div>
          <p className="text-xs text-zinc-400 mt-0.5 font-medium">โฟกัสงานคลังและสต๊อกหน้าร้าน (งานรับสินค้า/ยิง SN ค้าง จะแยกอยู่เมนูจัดซื้อ)</p>
          {lastUpdatedAll && (
            <div className="text-[10px] font-mono text-zinc-500 mt-1.5">UPDATED: {formatTimeAgo(lastUpdatedAll)}</div>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button variant="subtle" onClick={loadAllAction} disabled={overviewUI.loading || auditUI.loading || riskUI.loading}>
            {(overviewUI.loading || auditUI.loading || riskUI.loading) ? 'กำลังโหลด...' : 'โหลดทั้งหมด'}
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
      <Section title="Immediate Actions" subtitle="สิ่งที่ควรทำตอนนี้ (เพื่อให้สต๊อกนิ่ง + ลดความเสี่ยงทุจริตหรือสูญหาย)">
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

      {/* ================= Block A: Overview (manual load) ================= */}
      <Section
        title="ภาพรวมงานสต๊อกสินค้า"
        subtitle="แกนวัดปริมาณสินค้าคงคลัง ข้อมูลพร้อมขาย และยอดจองสินค้าแปรผันตามประเภทไอเทม"
        right={overviewUI.loaded ? (
          <div className="flex items-center gap-2">
            {overviewUI.lastLoadedAt && (
              <span className="text-[11px] text-zinc-500 font-mono">UPDATED: {formatTimeAgo(overviewUI.lastLoadedAt)}</span>
            )}
            <Button variant="subtle" onClick={() => safeLoad('overview')} disabled={overviewUI.loading}>
              {overviewUI.loading ? 'กำลังโหลด...' : 'รีเฟรช'}
            </Button>
          </div>
        ) : null}
      >
        <ErrorStrip message={overviewUI.error} onRetry={() => safeLoad('overview')} retrying={overviewUI.loading} />

        {!overviewUI.loaded && (
          <EmptyBox
            title="ยังไม่ได้โหลดข้อมูลภาพรวม"
            desc={overviewUI.error || 'แตะที่บล็อกนี้เพื่อโหลดตัวเลขภาพรวมคงคลังสถิติล่าสุด'}
            clickable
            loading={overviewUI.loading}
            onClick={() => safeLoad('overview')}
          />
        )}

        {overviewUI.loaded && overviewCards && (
          <div className="space-y-4">
            {(overviewExtras?.hasStructuredTotal || overviewExtras?.hasSimpleNetAvailable) && (
              <div className="flex flex-wrap items-center gap-2">
                {overviewExtras?.hasSimpleNetAvailable && (
                  <MiniChip
                    label="พร้อมขายแบบไม่ยิง SN (SIMPLE)"
                    value={overviewExtras.simpleNetAvailable}
                    onClick={() => navigate(`/${shopSlug}/pos/stock/simple`)}
                  />
                )}
                {overviewExtras?.hasStructuredTotal && (
                  <MiniChip
                    label="จำนวน StockItem ทั้งหมด (STRUCTURED)"
                    value={overviewExtras.structuredTotal}
                    onClick={() => navigate(`/${shopSlug}/pos/stock/items`)}
                  />
                )}
              </div>
            )}

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <SummaryCard
                label="สินค้าพร้อมขาย (IN_STOCK)"
                value={overviewCards.inStock}
                color="green"
                clickable
                onClick={() => navigate(`/${shopSlug}/pos/stock/items?status=IN_STOCK`)}
                hint="ดูรายการพร้อมขาย"
              />
              <SummaryCard
                label="สินค้าถูกจอง (CLAIMED)"
                value={overviewCards.claimed}
                color="blue"
                clickable
                onClick={() => navigate(`/${shopSlug}/pos/stock/items?status=CLAIMED`)}
                hint="ดูรายการที่ถูกจอง"
              />
              <SummaryCard
                label="ขายวันนี้ (SOLD Today)"
                value={overviewCards.soldToday}
                color="zinc"
                clickable
                onClick={() => navigate(`/${shopSlug}/pos/stock/items?status=SOLD&date=today`)}
                hint="ขายวันนี้ (อิง soldAt)"
              />
              <SummaryCard
                label="ต้องตรวจสอบ (MISSING_PENDING_REVIEW)"
                value={overviewCards.missingPendingReview}
                color="amber"
                clickable
                onClick={() => navigate(`/${shopSlug}/pos/stock/items?status=MISSING_PENDING_REVIEW`)}
                hint="ดูรายการที่ต้องตรวจสอบ"
              />
            </div>
          </div>
        )}
      </Section>

      {/* ================= Block B: Audit In Progress ================= */}
      <Section
        title="การตรวจนับสต๊อกที่กำลังดำเนินการค้างอยู่"
        subtitle="ตรวจสอบรอบนับสต๊อกสินค้าหน้าร้านเพื่อทำการ Re-reconcile บัญชีให้ตรงบิลคงเหลือ"
        right={auditUI.loaded ? (
          <div className="flex items-center gap-2">
            {auditUI.lastLoadedAt && (
              <span className="text-[11px] text-zinc-500 font-mono">UPDATED: {formatTimeAgo(auditUI.lastLoadedAt)}</span>
            )}
            <Button variant="subtle" onClick={() => safeLoad('audit')} disabled={auditUI.loading}>
              {auditUI.loading ? 'กำลังโหลด...' : 'รีเฟรช'}
            </Button>
          </div>
        ) : null}
      >
        <ErrorStrip message={auditUI.error} onRetry={() => safeLoad('audit')} retrying={auditUI.loading} />

        {!auditUI.loaded && (
          <EmptyBox
            title="ยังไม่ได้โหลดข้อมูลการตรวจนับ"
            desc={auditUI.error || 'แตะที่บล็อกนี้เพื่อดึงประวัติงานบันทึกตรวจนับค้างรอบปัจจุบัน'}
            clickable
            loading={auditUI.loading}
            onClick={() => safeLoad('audit')}
          />
        )}

        {auditUI.loaded && (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 shadow-sm">
            {!auditData ? (
              <div className="text-sm text-zinc-400 font-medium py-2">👍 ไม่พบรอบตรวจนับสินค้าค้างดำเนินการในระบบขณะนี้</div>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-sm font-black text-white">
                      โหมดการตรวจสอบรอบ: <span className="text-amber-400">{auditData.mode === 'FULL' ? 'FULL AUDIT' : 'READY SNAPSHOT'}</span>
                    </div>
                    <div className="text-xs text-zinc-500 mt-1 font-mono">
                      STARTED AT: {auditData.startedAt ? new Date(auditData.startedAt).toLocaleString('th-TH') : '-'}
                    </div>
                    {auditData?.employee?.name && (
                      <div className="text-xs text-zinc-400 mt-1 font-medium">เจ้าหน้าที่ผู้รับผิดชอบ: {auditData.employee.name}</div>
                    )}
                  </div>
                  <Button
                    variant="primary"
                    onClick={() =>
                      navigate(auditData.mode === 'FULL' ? `/${shopSlug}/pos/stock/stock-audit` : `/${shopSlug}/pos/stock/ready-audit`)
                    }
                  >
                    ทำต่อเลย
                  </Button>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-4">
                    <div className="text-xs text-zinc-500 font-black uppercase tracking-wider">คาดว่าจะตรวจ</div>
                    <div className="text-lg font-black text-white mt-1">{auditData.expectedCount ?? 0}</div>
                  </div>
                  <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-4">
                    <div className="text-xs text-zinc-500 font-black uppercase tracking-wider">สแกนแล้ว</div>
                    <div className="text-lg font-black text-white mt-1">{auditData.scannedCount ?? 0}</div>
                  </div>
                  <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-4">
                    <div className="text-xs text-zinc-500 font-black uppercase tracking-wider">ความคืบหน้า</div>
                    <div className="text-lg font-black text-amber-400 mt-1">
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

      {/* ================= Block C: Risk (manual load) ================= */}
      <Section
        title="ดัชนีชี้วัดความเสี่ยงและความเสียหายในคลัง"
        subtitle="ตรวจสอบและอนุมัติตัดจ่ายสินค้าตกเกรด สูญหาย ชำรุด หรือตัดใช้สอยภายในบูท"
        right={riskUI.loaded ? (
          <div className="flex items-center gap-2">
            {riskUI.lastLoadedAt && (
              <span className="text-[11px] text-zinc-500 font-mono">UPDATED: {formatTimeAgo(riskUI.lastLoadedAt)}</span>
            )}
            <Button variant="subtle" onClick={() => safeLoad('risk')} disabled={riskUI.loading}>
              {riskUI.loading ? 'กำลังโหลด...' : 'รีเฟรช'}
            </Button>
          </div>
        ) : null}
      >
        <ErrorStrip message={riskUI.error} onRetry={() => safeLoad('risk')} retrying={riskUI.loading} />

        {!riskUI.loaded && (
          <EmptyBox
            title="ยังไม่ได้โหลดข้อมูลความเสี่ยงสต๊อก"
            desc={riskUI.error || 'แตะที่บล็อกนี้เพื่อโหลดสรุปจำแนกสถานะกลุ่มสินค้าความเสี่ยง (LOST / DAMAGED / USED / RETURNED)'}
            clickable
            loading={riskUI.loading}
            onClick={() => safeLoad('risk')}
          />
        )}

        {riskUI.loaded && riskCards && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <SummaryCard
              label="สูญหาย (LOST)"
              value={riskCards.lost}
              color="rose"
              clickable
              onClick={() => navigate(`/${shopSlug}/pos/stock/items?status=LOST`)}
            />
            <SummaryCard
              label="เสียหาย (DAMAGED)"
              value={riskCards.damaged}
              color="amber"
              clickable
              onClick={() => navigate(`/${shopSlug}/pos/stock/items?status=DAMAGED`)}
            />
            <SummaryCard
              label="ใช้ภายใน (USED)"
              value={riskCards.used}
              color="zinc"
              clickable
              onClick={() => navigate(`/${shopSlug}/pos/stock/items?status=USED`)}
            />
            <SummaryCard
              label="คืนสินค้า (RETURNED)"
              value={riskCards.returned}
              color="blue"
              clickable
              onClick={() => navigate(`/${shopSlug}/pos/stock/items?status=RETURNED`)}
            />
          </div>
        )}

        {riskUI.loaded && !riskCards && (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 text-sm text-zinc-400 font-medium">
            ไม่พบข้อมูลความเสี่ยงในระบบรอบนี้
          </div>
        )}
      </Section>

    </div>
  );
};

export default StockDashboardPage;