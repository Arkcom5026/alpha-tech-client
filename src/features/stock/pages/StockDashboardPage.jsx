// src/features/stock/pages/StockDashboardPage.jsx
// P1 Style: Operational Overview (ระดับพนักงานสต๊อก)
// 🎨 Minimal Platinum Light Mode Edition (User Feedback Optimized — High Contrast Layout)

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useStockStore from '@/features/stock/store/stockStore';
import StockValuationSummary from '@/features/stock/components/StockValuationSummary';

const ArrowRight = (props) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
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
  return `${Math.floor(hr / 24)}d ago`;
};

const Button = ({ children, onClick, disabled, variant = 'primary' }) => {
  const base = 'inline-flex items-center justify-center rounded-xl px-4 py-2 text-xs font-black transition-all border shadow-sm duration-150 select-none';
  const variants = {
    primary: 'bg-gradient-to-b from-orange-500 to-amber-500 text-white border-orange-600/20 hover:from-orange-600 hover:to-amber-600 shadow-orange-500/10 active:scale-95 transform',
    subtle: 'bg-slate-800 text-slate-100 border-slate-900 hover:bg-slate-900 active:scale-95 transform',
  };
  return <button type="button" onClick={onClick} disabled={disabled} className={`${base} ${variants[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>{children}</button>;
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

const EmptyBox = ({ title, desc, onClick, clickable = false, loading = false }) => (
  <button type="button" onClick={onClick} disabled={!clickable || loading} className={`w-full rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-6 shadow-inner text-left transition-all duration-200 ${clickable ? 'hover:border-orange-500/40 hover:bg-white hover:-translate-y-0.5 cursor-pointer' : 'cursor-default'} ${loading ? 'opacity-70 cursor-wait' : ''}`}>
    <div className="text-sm font-black text-slate-900">{title}</div>
    {desc && <div className="text-xs text-slate-500 mt-1.5 leading-snug font-bold">{desc}</div>}
  </button>
);

const SummaryCard = ({ label, value, color, onClick, hint }) => {
  const colorMap = {
    green: 'border-emerald-500/20 hover:border-emerald-500/40',
    blue: 'border-blue-500/20 hover:border-blue-500/40',
    amber: 'border-orange-500/20 hover:border-orange-500/40',
    zinc: 'border-slate-200 hover:border-slate-400',
  };
  return (
    <button type="button" onClick={onClick} className={`w-full rounded-2xl border bg-white px-5 py-4 shadow-[0_4px_20px_rgba(0,0,0,0.01)] text-left transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${colorMap[color]}`}>
      <div className="text-[11px] font-black uppercase tracking-wider text-slate-400">{label}</div>
      <div className="text-xl font-black mt-1.5 tracking-tight text-slate-900">{value}</div>
      <div className="text-[11px] mt-2 font-black text-orange-600 opacity-90">{hint}</div>
    </button>
  );
};

const ErrorStrip = ({ message, onRetry, retrying }) => {
  if (!message) return null;
  return (
    <div className="mb-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div><div className="font-black text-sm text-rose-700">โหลดข้อมูลไม่สำเร็จ</div><div className="mt-0.5 text-xs font-bold text-rose-700">{String(message)}</div></div>
        <Button variant="subtle" onClick={onRetry} disabled={retrying}>{retrying ? 'กำลังลองใหม่...' : 'ลองใหม่'}</Button>
      </div>
    </div>
  );
};

const StockDashboardPage = () => {
  const navigate = useNavigate();
  const { shopSlug } = useParams();
  const loadOverviewAction = useStockStore((s) => s?.loadDashboardOverviewAction);
  const overviewState = useStockStore((s) => s?.dashboardOverview);
  const [overviewUI, setOverviewUI] = useState({ loaded: Boolean(overviewState?.data), loading: false, error: null, lastLoadedAt: overviewState?.lastLoadedAt ?? null, data: overviewState?.data ?? null });

  useEffect(() => {
    if (!overviewState) return;
    setOverviewUI((prev) => ({ ...prev, loaded: Boolean(overviewState?.data), data: overviewState?.data ?? null, lastLoadedAt: overviewState?.lastLoadedAt ?? prev.lastLoadedAt, error: overviewState?.error ?? prev.error, loading: Boolean(overviewState?.loading) }));
  }, [overviewState]);

  const loadOverview = useCallback(async () => {
    try {
      setOverviewUI((prev) => ({ ...prev, loading: true, error: null }));
      await loadOverviewAction();
    } catch (error) {
      setOverviewUI((prev) => ({ ...prev, loading: false, error: error?.message || 'โหลดข้อมูลไม่สำเร็จ' }));
    }
  }, [loadOverviewAction]);

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

  return (
    <div className="space-y-6 animate-fadeIn p-4 md:p-6 bg-slate-50 min-h-screen text-slate-800 font-sans">
      <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-[0_4px_25px_rgba(0,0,0,0.01)] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">ภาพรวมระบบคลังสินค้า</h1>
          <p className="text-xs text-slate-400 font-bold mt-0.5">สรุปปริมาณและมูลค่าสินค้าของร้านปัจจุบันเท่านั้น</p>
          {overviewUI.lastLoadedAt && <div className="text-[10px] font-mono text-slate-400 font-black mt-1.5">อัปเดตล่าสุด: {formatTimeAgo(overviewUI.lastLoadedAt)}</div>}
        </div>
        <Button variant="subtle" onClick={loadOverview} disabled={overviewUI.loading}>{overviewUI.loading ? 'กำลังโหลด...' : 'โหลดข้อมูลล่าสุด'}</Button>
      </div>

      <ErrorStrip message={overviewUI.error} onRetry={loadOverview} retrying={overviewUI.loading} />

      {!overviewUI.loaded && (
        <EmptyBox title="ยังไม่ได้โหลดข้อมูลสต๊อก" desc="กดเพื่อดึงจำนวนสินค้า มูลค่าสต๊อก และคุณภาพข้อมูลของร้านปัจจุบัน" clickable loading={overviewUI.loading} onClick={loadOverview} />
      )}

      {overviewUI.loaded && overviewUI.data && <StockValuationSummary data={overviewUI.data} />}

      {overviewUI.loaded && overviewCards && (
        <Section title="ภาพรวมปริมาณสต๊อก" subtitle="จำนวนสินค้า Structured และสถานะสำคัญของร้านปัจจุบัน">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <SummaryCard label="IN_STOCK" value={overviewCards.inStock} color="green" onClick={() => navigate(`/${shopSlug}/pos/stock/items?status=IN_STOCK`)} hint="ดูสินค้าพร้อมขาย" />
            <SummaryCard label="CLAIMED" value={overviewCards.claimed} color="blue" onClick={() => navigate(`/${shopSlug}/pos/stock/items?status=CLAIMED`)} hint="ดูสินค้าที่ถูกจอง" />
            <SummaryCard label="SOLD TODAY" value={overviewCards.soldToday} color="zinc" onClick={() => navigate(`/${shopSlug}/pos/stock/items?status=SOLD&date=today`)} hint="ดูรายการขายวันนี้" />
            <SummaryCard label="MISSING REVIEW" value={overviewCards.missingPendingReview} color="amber" onClick={() => navigate(`/${shopSlug}/pos/stock/items?status=MISSING_PENDING_REVIEW`)} hint="ดูรายการที่ต้องตรวจสอบ" />
          </div>
        </Section>
      )}
    </div>
  );
};

export default StockDashboardPage;
