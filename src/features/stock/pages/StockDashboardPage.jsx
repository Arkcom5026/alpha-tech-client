// ✅ src/features/stock/pages/StockDashboardPage.jsx
// P1 Style: Operational Overview (ระดับพนักงานสต๊อก)
// เป้าหมาย: โฟกัสเฉพาะ "สิ่งที่เกี่ยวกับสต๊อก" เท่านั้น
// หมายเหตุ: งานรับสินค้า / SN ค้าง → เป็นหน้าที่ฝั่งจัดซื้อ (แยกบทบาทชัดเจน)
// แนวทางโหลดข้อมูล: "กดโหลดทีละบล็อก" เพื่อลดโหลดที่ไม่จำเป็น และลดจำนวนครั้งเรียก API

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// (Optional) ใช้ Store เป็นแหล่งข้อมูลเดียว (ห้ามเรียก API ตรงจากหน้า)
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

const Tile = ({ title, to, desc, color = 'blue' }) => {
  const navigate = useNavigate();

  const colorMap = {
    blue: 'bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-900',
    green: 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-900',
    purple: 'bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-900',
    amber: 'bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-900',
    rose: 'bg-rose-50 hover:bg-rose-100 border-rose-200 text-rose-900',
    zinc: 'bg-zinc-50 hover:bg-zinc-100 border-zinc-200 text-zinc-900',
  };

  return (
    <button
      type="button"
      onClick={() => navigate(to)}
      className={`group w-full rounded-2xl px-5 py-4 text-left transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 border ${colorMap[color]}`}
      aria-label={title}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-semibold leading-tight text-sm tracking-tight">{title}</div>
          {desc && <div className="text-xs mt-1 leading-snug opacity-80">{desc}</div>}
        </div>
        <ArrowRight className="mt-0.5 opacity-60 group-hover:opacity-100 transition" />
      </div>
    </button>
  );
};

const Section = ({ title, subtitle, right, children }) => (
  <section className="mb-10">
    <header className="mb-3 flex items-start justify-between gap-4">
      <div>
        <h2 className="text-sm font-semibold text-zinc-800">{title}</h2>
        {subtitle && <p className="text-xs text-zinc-500 mt-0.5">{subtitle}</p>}
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
    className={`w-full rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm text-left transition ${clickable ? 'hover:shadow-md hover:-translate-y-0.5 cursor-pointer' : 'cursor-default'} ${loading ? 'opacity-70 cursor-wait' : ''}`}
    aria-label={title}
  >
    <div className="text-sm font-semibold text-zinc-800">{title}</div>
    {desc && <div className="text-xs text-zinc-500 mt-1 leading-snug">{desc}</div>}
    {action && <div className="mt-4">{action}</div>}

    {clickable && !action && (
      <div className="mt-4 inline-flex items-center gap-2 text-xs text-zinc-600">
        <span className="rounded-lg bg-zinc-100 px-2 py-1">แตะเพื่อโหลด</span>
        <span className="text-[11px] text-zinc-500">(ไม่โหลดอัตโนมัติ)</span>
      </div>
    )}
  </button>
);

const SummaryCard = ({ label, value, color, onClick, clickable = false, hint }) => {
  const colorMap = {
    green: 'bg-emerald-50 border-emerald-200 text-emerald-900',
    blue: 'bg-blue-50 border-blue-200 text-blue-900',
    rose: 'bg-rose-50 border-rose-200 text-rose-900',
    amber: 'bg-amber-50 border-amber-200 text-amber-900',
    zinc: 'bg-zinc-50 border-zinc-200 text-zinc-900',
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!clickable}
      className={`w-full rounded-2xl border px-5 py-4 shadow-sm text-left transition ${colorMap[color]} ${clickable ? 'hover:shadow-md hover:-translate-y-0.5 cursor-pointer' : 'cursor-default'}`}
      aria-label={label}
    >
      <div className="text-xs opacity-70">{label}</div>
      <div className="text-xl font-semibold mt-1">{value}</div>
      {clickable && (
        <div className="text-[11px] mt-2 opacity-70">
          {hint || 'แตะเพื่อดูรายการ'}
        </div>
      )}
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

const MiniChip = ({ label, value, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs text-zinc-700 shadow-sm hover:bg-zinc-50"
  >
    <span className="opacity-70">{label}</span>
    <span className="font-semibold text-zinc-900">{value}</span>
  </button>
);

// =============================
// Executive UI (signal + actions)
// =============================

const HealthBadge = ({ tone = 'neutral', title, subtitle }) => {
  const toneMap = {
    good: 'border-emerald-200 bg-emerald-50 text-emerald-900',
    warn: 'border-amber-200 bg-amber-50 text-amber-900',
    critical: 'border-rose-200 bg-rose-50 text-rose-900',
    neutral: 'border-zinc-200 bg-white text-zinc-900',
  };

  const dotMap = {
    good: 'bg-emerald-500',
    warn: 'bg-amber-500',
    critical: 'bg-rose-500',
    neutral: 'bg-zinc-400',
  };

  return (
    <div className={`w-full rounded-2xl border px-5 py-4 shadow-sm ${toneMap[tone] || toneMap.neutral}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className={`h-2.5 w-2.5 rounded-full ${dotMap[tone] || dotMap.neutral}`} />
            <div className="text-xs font-semibold tracking-wide">Stock Health</div>
          </div>
          <div className="text-lg font-semibold mt-1 leading-tight">{title}</div>
          {subtitle && <div className="text-xs mt-1 opacity-80 leading-snug">{subtitle}</div>}
        </div>
        <div className="hidden sm:flex flex-col items-end gap-2">
          <div className="text-[11px] opacity-70">Executive summary</div>
        </div>
      </div>
    </div>
  );
};

const ActionItem = ({ title, desc, tone = 'neutral', ctaLabel = 'ไปดู', onClick, disabled = false }) => {
  const toneMap = {
    critical: 'border-rose-200 bg-rose-50',
    warn: 'border-amber-200 bg-amber-50',
    neutral: 'border-zinc-200 bg-white',
  };

  return (
    <div className={`rounded-2xl border p-4 shadow-sm ${toneMap[tone] || toneMap.neutral}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sm font-semibold text-zinc-800 truncate">{title}</div>
          {desc && <div className="text-xs text-zinc-600 mt-1 leading-snug">{desc}</div>}
        </div>
        <Button variant="subtle" onClick={onClick} disabled={disabled}>
          {ctaLabel}
          <ArrowRight className="ml-1 opacity-70" />
        </Button>
      </div>
    </div>
  );
};

// =============================
// Page
// =============================

const StockDashboardPage = () => {
  const navigate = useNavigate();

  // -----------------------------
  // Store (selector-based to reduce rerenders)
  // -----------------------------
  const loadOverviewAction = useStockStore((s) => s?.loadDashboardOverviewAction);
  const loadAuditInProgressAction = useStockStore((s) => s?.loadDashboardAuditInProgressAction);
  const loadRiskAction = useStockStore((s) => s?.loadDashboardRiskAction);

  const overviewState = useStockStore((s) => s?.dashboardOverview);
  const auditState = useStockStore((s) => s?.dashboardAuditInProgress);
  const riskState = useStockStore((s) => s?.dashboardRisk);

  // -----------------------------
  // Local UI state (safe fallback)
  // -----------------------------
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

  // keep UI in sync with store if store exists (no auto-load; just reflect)
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

  // -----------------------------
  // Handlers (manual load per block)
  // -----------------------------

  const safeLoad = useCallback(
    async (blockKey) => {
      // blockKey: overview | audit | risk
      const setters = {
        overview: setOverviewUI,
        audit: setAuditUI,
        risk: setRiskUI,
      };

      const actions = {
        overview: loadOverviewAction,
        audit: loadAuditInProgressAction,
        risk: loadRiskAction,
      };

      const storeKeyMap = {
        overview: 'dashboardOverview',
        audit: 'dashboardAuditInProgress',
        risk: 'dashboardRisk',
      };

      const setState = setters[blockKey];
      const action = actions[blockKey];
      const storeKey = storeKeyMap[blockKey];

      if (!setState) return;

      // If store action exists → call it; otherwise fallback is just UI message
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

        // Some stores return { ok, error } instead of throwing
        const result = await action();
        if (result && result.ok === false) {
          throw new Error(result.error || 'โหลดข้อมูลไม่สำเร็จ');
        }

        // Validate from latest store snapshot (prevents false-success when action swallows errors)
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

  // ✅ optional extras (from upgraded BE)
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

  // -----------------------------
  // Executive signals (no extra API; derive from current blocks)
  // -----------------------------

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

  const health = useMemo(() => {
    // If nothing loaded yet → neutral
    if (!overviewCards && !riskCards && !auditUI.loaded) {
      return {
        tone: 'neutral',
        title: 'ยังไม่ได้โหลดข้อมูลพอสำหรับสรุปสุขภาพสต๊อก',
        subtitle: 'กด “โหลดทั้งหมด” เพื่อดูภาพรวม + งานค้าง + ความเสี่ยงในครั้งเดียว (ยังคงไม่โหลดอัตโนมัติ)',
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

    // CRITICAL
    if ((flags.missing && missing >= 5) || (flags.risk && rt >= 5) || (flags.inStockLow && (flags.missing || flags.risk))) {
      const parts = [];
      if (flags.missing) parts.push(`ต้องตรวจสอบ ${missing} รายการ`);
      if (flags.risk) parts.push(`ความเสี่ยง ${rt} รายการ`);
      if (flags.inStockLow) parts.push('ไม่มีสินค้าพร้อมขาย');
      if (flags.audit) parts.push('มีรอบตรวจนับค้าง');
      return {
        tone: 'critical',
        title: 'CRITICAL',
        subtitle: parts.join(' • '),
      };
    }

    // WARNING
    if (flags.missing || flags.risk || flags.audit || flags.claimedHigh) {
      const parts = [];
      if (flags.missing) parts.push(`ต้องตรวจสอบ ${missing} รายการ`);
      if (flags.risk) parts.push(`ความเสี่ยง ${rt} รายการ`);
      if (flags.audit) parts.push('มีรอบตรวจนับที่กำลังทำอยู่');
      if (flags.claimedHigh) parts.push(`CLAIMED สูง (${claimed})`);
      return {
        tone: 'warn',
        title: 'WARNING',
        subtitle: parts.join(' • '),
      };
    }

    // GOOD
    const parts = [];
    if (typeof inStock === 'number') parts.push(`IN_STOCK ${inStock}`);
    if (typeof soldToday === 'number') parts.push(`ขายวันนี้ ${soldToday}`);
    return {
      tone: 'good',
      title: 'GOOD',
      subtitle: parts.join(' • ') || 'สถานะสต๊อกปกติ',
    };
  }, [overviewCards, riskCards, riskTotal, auditData, auditUI.loaded]);

  const loadAllAction = useCallback(async () => {
    // still manual, but one-click for executives
    await safeLoad('overview');
    await safeLoad('audit');
    await safeLoad('risk');
  }, [safeLoad]);

  const immediateActions = useMemo(() => {
    const items = [];

    // If blocks not loaded yet, offer guided actions
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

    // Operational actions (only when data exists)
    if (overviewCards) {
      if ((overviewCards.missingPendingReview || 0) > 0) {
        items.push({
          tone: 'critical',
          title: `ต้องตรวจสอบ (MISSING_PENDING_REVIEW) ${overviewCards.missingPendingReview} รายการ`,
          desc: 'เคลียร์รายการที่ต้องตรวจสอบเพื่อลดความเสี่ยงสต๊อก',
          ctaLabel: 'ตรวจสอบ',
          onClick: () => navigate('/pos/stock/items?status=MISSING_PENDING_REVIEW'),
          disabled: false,
        });
      }

      if ((overviewCards.claimed || 0) > 0) {
        items.push({
          tone: 'warn',
          title: `สินค้าถูกจอง (CLAIMED) ${overviewCards.claimed} รายการ`,
          desc: 'ตรวจสอบว่ามีรายการจองค้าง/เคลียร์สถานะให้ถูกต้อง',
          ctaLabel: 'ดูรายการ',
          onClick: () => navigate('/pos/stock/items?status=CLAIMED'),
          disabled: false,
        });
      }

      if ((overviewCards.inStock || 0) <= 0) {
        items.push({
          tone: 'warn',
          title: 'ไม่มีสินค้าพร้อมขาย (IN_STOCK = 0)',
          desc: 'ตรวจสอบว่ามีการรับเข้าแล้วหรือมีสถานะค้างอยู่',
          ctaLabel: 'ดูทั้งหมด',
          onClick: () => navigate('/pos/stock/items'),
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
        onClick: () => navigate(auditData.mode === 'FULL' ? '/pos/stock/stock-audit' : '/pos/stock/ready-audit'),
        disabled: false,
      });
    }

    if (riskCards && typeof riskTotal === 'number' && riskTotal > 0) {
      items.push({
        tone: riskTotal >= 5 ? 'critical' : 'warn',
        title: `พบความเสี่ยงสต๊อก ${riskTotal} รายการ`,
        desc: 'แนะนำให้เคลียร์ LOST / DAMAGED / USED / RETURNED ให้ชัดเจน',
        ctaLabel: 'ดู Risk',
        onClick: () => navigate('/pos/stock/items?status=LOST'),
        disabled: false,
      });
    }

    // If nothing actionable and already loaded
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

    // cap to avoid noisy UI
    return items.slice(0, 5);
  }, [overviewUI.loaded, overviewUI.loading, auditUI.loaded, auditUI.loading, riskUI.loaded, riskUI.loading, overviewCards, auditData, riskCards, riskTotal, navigate, safeLoad, loadAllAction]);


  return (
    <div className="p-8 w-full flex flex-col items-center bg-gradient-to-b from-white to-zinc-50 min-h-screen">
      <div className="w-full max-w-6xl">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="min-w-0">
            <h1 className="text-xl font-semibold text-zinc-800">หน้าหลักสต๊อก</h1>
            <p className="text-xs text-zinc-500 mt-1">
              โฟกัสงานสต๊อกเท่านั้น (งานรับสินค้า/ยิง SN ค้าง อยู่เมนูจัดซื้อ)
            </p>
            {lastUpdatedAll && (
              <div className="text-[11px] text-zinc-500 mt-2">updated {formatTimeAgo(lastUpdatedAll)}</div>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button variant="subtle" onClick={loadAllAction} disabled={overviewUI.loading || auditUI.loading || riskUI.loading}>
              {(overviewUI.loading || auditUI.loading || riskUI.loading) ? 'กำลังโหลด...' : 'โหลดทั้งหมด'}
            </Button>
          </div>
        </div>

        <div className="mb-6">
          <HealthBadge tone={health.tone} title={health.title} subtitle={health.subtitle} />
        </div>

        <Section
          title="Immediate Actions"
          subtitle="สิ่งที่ควรทำตอนนี้ (เพื่อให้สต๊อกนิ่ง + ลดความเสี่ยง)"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
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
          title="ภาพรวมงานสต๊อก"
          subtitle="แตะที่บล็อกเพื่อโหลดตัวเลขล่าสุด (ไม่โหลดอัตโนมัติ) — โฟกัสงานสต๊อกจริง ๆ"
          right={overviewUI.loaded ? (
            <div className="flex items-center gap-2">
              {overviewUI.lastLoadedAt && (
                <span className="text-[11px] text-zinc-500">updated {formatTimeAgo(overviewUI.lastLoadedAt)}</span>
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
              desc={overviewUI.error || 'แตะที่บล็อกนี้เพื่อโหลดตัวเลขภาพรวมจากระบบ'}
              clickable
              loading={overviewUI.loading}
              onClick={() => safeLoad('overview')}
            />
          )}

          {overviewUI.loaded && overviewCards && (
            <div className="space-y-3">
              {(overviewExtras?.hasStructuredTotal || overviewExtras?.hasSimpleNetAvailable) && (
                <div className="flex flex-wrap items-center gap-2">
                  {overviewExtras?.hasSimpleNetAvailable && (
                    <MiniChip
                      label="พร้อมขายแบบไม่ยิง SN (SIMPLE)"
                      value={overviewExtras.simpleNetAvailable}
                      onClick={() => navigate('/pos/stock/simple')}
                    />
                  )}
                  {overviewExtras?.hasStructuredTotal && (
                    <MiniChip
                      label="จำนวน StockItem ทั้งหมด (STRUCTURED)"
                      value={overviewExtras.structuredTotal}
                      onClick={() => navigate('/pos/stock/items')}
                    />
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <SummaryCard
                  label="สินค้าพร้อมขาย (IN_STOCK)"
                  value={overviewCards.inStock}
                  color="green"
                  clickable
                  onClick={() => navigate('/pos/stock/items?status=IN_STOCK')}
                  hint="ดูรายการพร้อมขาย"
                />
                <SummaryCard
                  label="สินค้าถูกจอง (CLAIMED)"
                  value={overviewCards.claimed}
                  color="blue"
                  clickable
                  onClick={() => navigate('/pos/stock/items?status=CLAIMED')}
                  hint="ดูรายการที่ถูกจอง"
                />
                <SummaryCard
                  label="ขายวันนี้ (SOLD Today)"
                  value={overviewCards.soldToday}
                  color="zinc"
                  clickable
                  onClick={() => navigate('/pos/stock/items?status=SOLD&date=today')}
                  hint="ขายวันนี้ (อิง soldAt)"
                />
                <SummaryCard
                  label="ต้องตรวจสอบ (MISSING_PENDING_REVIEW)"
                  value={overviewCards.missingPendingReview}
                  color="amber"
                  clickable
                  onClick={() => navigate('/pos/stock/items?status=MISSING_PENDING_REVIEW')}
                  hint="ดูรายการที่ต้องตรวจสอบ"
                />
              </div>
            </div>
          )}
        </Section>

        {/* ================= Block B: Audit In Progress (manual load) ================= */}
        <Section
          title="การตรวจนับที่กำลังทำอยู่"
          subtitle="แตะที่บล็อกเพื่อเช็คว่ามีรอบตรวจค้าง และกลับไปทำต่อได้ทันที"
          right={auditUI.loaded ? (
            <div className="flex items-center gap-2">
              {auditUI.lastLoadedAt && (
                <span className="text-[11px] text-zinc-500">updated {formatTimeAgo(auditUI.lastLoadedAt)}</span>
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
              desc={auditUI.error || 'แตะที่บล็อกนี้เพื่อเช็คว่ามีรอบตรวจค้างอยู่หรือไม่'}
              clickable
              loading={auditUI.loading}
              onClick={() => safeLoad('audit')}
            />
          )}

          {auditUI.loaded && (
            <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
              {!auditData ? (
                <div className="text-sm text-zinc-700">ไม่พบรอบตรวจที่กำลังดำเนินการ</div>
              ) : (
                <div className="flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-sm font-semibold text-zinc-800">
                        รอบตรวจ: {auditData.mode === 'FULL' ? 'FULL' : 'READY'}
                      </div>
                      <div className="text-xs text-zinc-500 mt-1">
                        เริ่มเมื่อ: {auditData.startedAt ? new Date(auditData.startedAt).toLocaleString() : '-'}
                      </div>
                      {auditData?.employee?.name && (
                        <div className="text-xs text-zinc-500 mt-1">ผู้เริ่มตรวจ: {auditData.employee.name}</div>
                      )}
                    </div>
                    <Button
                      variant="primary"
                      onClick={() =>
                        navigate(auditData.mode === 'FULL' ? '/pos/stock/stock-audit' : '/pos/stock/ready-audit')
                      }
                    >
                      ทำต่อ
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
                      <div className="text-xs text-zinc-500">คาดว่าจะตรวจ</div>
                      <div className="text-lg font-semibold text-zinc-800 mt-1">{auditData.expectedCount ?? 0}</div>
                    </div>
                    <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
                      <div className="text-xs text-zinc-500">สแกนแล้ว</div>
                      <div className="text-lg font-semibold text-zinc-800 mt-1">{auditData.scannedCount ?? 0}</div>
                    </div>
                    <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
                      <div className="text-xs text-zinc-500">ความคืบหน้า</div>
                      <div className="text-lg font-semibold text-zinc-800 mt-1">
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
          title="ความเสี่ยงสต๊อก"
          subtitle="แตะที่บล็อกเพื่อโหลดสถานะที่ควรเคลียร์ (LOST / DAMAGED / USED / RETURNED)"
          right={riskUI.loaded ? (
            <div className="flex items-center gap-2">
              {riskUI.lastLoadedAt && (
                <span className="text-[11px] text-zinc-500">updated {formatTimeAgo(riskUI.lastLoadedAt)}</span>
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
              title="ยังไม่ได้โหลดข้อมูลความเสี่ยง"
              desc={riskUI.error || 'แตะที่บล็อกนี้เพื่อโหลด LOST / DAMAGED / USED / RETURNED'}
              clickable
              loading={riskUI.loading}
              onClick={() => safeLoad('risk')}
            />
          )}

          {riskUI.loaded && riskCards && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <SummaryCard
                label="สูญหาย (LOST)"
                value={riskCards.lost}
                color="rose"
                clickable
                onClick={() => navigate('/pos/stock/items?status=LOST')}
              />
              <SummaryCard
                label="เสียหาย (DAMAGED)"
                value={riskCards.damaged}
                color="amber"
                clickable
                onClick={() => navigate('/pos/stock/items?status=DAMAGED')}
              />
              <SummaryCard
                label="ใช้ภายใน (USED)"
                value={riskCards.used}
                color="zinc"
                clickable
                onClick={() => navigate('/pos/stock/items?status=USED')}
              />
              <SummaryCard
                label="คืนสินค้า (RETURNED)"
                value={riskCards.returned}
                color="blue"
                clickable
                onClick={() => navigate('/pos/stock/items?status=RETURNED')}
              />
            </div>
          )}

          {riskUI.loaded && !riskCards && (
            <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm text-sm text-zinc-700">
              ไม่พบข้อมูลความเสี่ยง
            </div>
          )}
        </Section>

        {/* Quick links (optional future) */}
        {/*
        <Section
          title="ทางลัด"
          subtitle="เข้าหน้างานที่ใช้บ่อย (ไม่เกี่ยวกับจัดซื้อ)"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Tile title="รายการสินค้าพร้อมขาย" to="/pos/stock/items?status=IN_STOCK" color="green" />
            <Tile title="ตรวจนับสต๊อก (READY)" to="/pos/stock/ready-audit" color="blue" />
            <Tile title="ตรวจนับสต๊อก (FULL)" to="/pos/stock/stock-audit" color="zinc" />
          </div>
        </Section>
        */}
      </div>
    </div>
  );
};

export default StockDashboardPage;
