// src/features/sales/pages/SalesDashboardPage.jsx
// 🏛️ Clean Architecture Multi-Tenant Sales Dashboard Hub

import React, { useCallback, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import useSalesStore from '@/features/sales/store/salesStore';

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
    className={`w-full rounded-2xl border border-dashed border-zinc-800 bg-zinc-900 p-6 shadow-sm text-left transition-all duration-200 ${
      clickable ? 'hover:border-amber-500/40 hover:bg-zinc-800/40 hover:-translate-y-0.5 cursor-pointer' : 'cursor-default'
    } ${loading ? 'opacity-70 cursor-wait' : ''}`}
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
      className={`w-full rounded-2xl border px-4 py-3 text-left shadow-sm transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 ${
        toneMap[tone] || toneMap.neutral
      }`}
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
            <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Sales Health</div>
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

const SummaryCard = ({ label, value, clickable = false, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={!clickable}
    className={`w-full rounded-2xl border border-zinc-800/80 bg-zinc-900/60 px-5 py-4 shadow-sm text-left transition-all duration-200 ${
      clickable ? 'hover:border-amber-500/40 hover:shadow-xl hover:-translate-y-0.5 cursor-pointer' : 'cursor-default'
    }`}
    aria-label={label}
  >
    <div className="text-xs text-zinc-400 font-medium">{label}</div>
    <div className="text-xl font-black text-white mt-1.5 tracking-tight">{value}</div>
    {clickable && <div className="text-[11px] mt-2 text-amber-400 font-bold">แตะเพื่อดูรายการ</div>}
  </button>
);

const SalesDashboardPage = () => {
  const navigate = useNavigate();
  const { shopSlug } = useParams();

  const fetchSalesDashboardOverviewAction = useSalesStore((s) => s.fetchSalesDashboardOverviewAction);
  const salesOverviewLoading = useSalesStore((s) => s.salesOverviewLoading);
  const salesOverviewError = useSalesStore((s) => s.salesOverviewError);
  const salesOverviewLastLoadedAt = useSalesStore((s) => s.salesOverviewLastLoadedAt);
  const clearSalesOverviewErrorAction = useSalesStore((s) => s.clearSalesOverviewErrorAction);

  const [overviewUI, setOverviewUI] = useState({ loaded: false, data: null });
  const [insightUI, setInsightUI] = useState({
    loaded: false,
    loading: false,
    error: null,
    lastLoadedAt: null,
    data: null,
  });

  const safeLoadOverview = useCallback(async () => {
    if (salesOverviewLoading) return;
    if (!fetchSalesDashboardOverviewAction) return;

    try {
      if (clearSalesOverviewErrorAction) clearSalesOverviewErrorAction();
      const data = await fetchSalesDashboardOverviewAction({ scope: 'today' });
      setOverviewUI({ loaded: true, data: data || null });
    } catch (err) {
      setOverviewUI((prev) => ({ ...prev, loaded: prev.loaded || false }));
    }
  }, [salesOverviewLoading, fetchSalesDashboardOverviewAction, clearSalesOverviewErrorAction]);

  const loadAllAction = useCallback(async () => {
    await safeLoadOverview();
    setInsightUI((prev) => ({ ...prev, loaded: true, lastLoadedAt: prev.lastLoadedAt || new Date() }));
  }, [safeLoadOverview]);

  const health = useMemo(() => {
    if (!overviewUI.loaded || !overviewUI.data) {
      return {
        tone: 'neutral',
        title: 'ยังไม่ได้โหลดข้อมูลภาพรวมการขาย',
        subtitle: 'กด “โหลดทั้งหมด” เพื่อดึงตัวเลขล่าสุด (ไม่โหลดอัตโนมัติ)',
        actionLabel: 'โหลดภาพรวม',
        action: safeLoadOverview,
      };
    }

    const unpaid = Number(overviewUI.data?.unpaidCount || 0);
    if (unpaid > 0) {
      return {
        tone: 'warn',
        title: `มีรายการค้างชำระ ${unpaid} รายการ`,
        subtitle: 'แนะนำให้ไล่เก็บเงิน/ปิดบิลให้ครบ เพื่อไม่ให้ยอดค้างสะสม',
        actionLabel: 'ดูค้างชำระ',
        action: () => navigate(`/${shopSlug}/pos/sales/bills?status=unpaid`),
      };
    }

    return {
      tone: 'good',
      title: 'การขายปกติ ไม่มีรายการค้างชำระ',
      subtitle: 'ภาพรวมสุขภาพการขายอยู่ในระดับดี',
      actionLabel: 'ไปขายสินค้า',
      action: () => navigate(`/${shopSlug}/pos/sales/quick`),
    };
  }, [overviewUI.loaded, overviewUI.data, navigate, shopSlug, safeLoadOverview]);

  const fmtMoney = (n) => {
    const v = Number(n || 0);
    return v.toLocaleString('th-TH');
  };

  const todayAmount = overviewUI.loaded ? Number(overviewUI.data?.todaySalesAmount || 0) : null;
  const todayCount = overviewUI.loaded ? Number(overviewUI.data?.todaySalesCount || 0) : null;
  const unpaidCount = overviewUI.loaded ? Number(overviewUI.data?.unpaidCount || 0) : null;
  const monthAmount = overviewUI.loaded ? Number(overviewUI.data?.monthSalesAmount || 0) : null;

  const monthAmountHint = overviewUI.loaded
    ? overviewUI.data?.monthSalesAmountHint || 'ยอดสะสมเดือนนี้ (placeholder)'
    : '';

  return (
    <div className="space-y-6 animate-fadeIn p-6 bg-slate-900 min-h-screen text-white">
      
      {/* ================= Header ================= */}
      <div className="bg-zinc-900 border border-zinc-800/80 p-6 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-xl font-black text-white">หน้าหลักการขาย</h1>
          <p className="text-xs text-zinc-400 mt-0.5 font-medium">Executive Multi-Tenant Sales Hub</p>
          {salesOverviewLastLoadedAt && (
            <div className="text-[10px] font-mono text-zinc-500 mt-1.5">
              UPDATED: {formatTimeAgo(salesOverviewLastLoadedAt)}
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Button variant="primary" onClick={() => navigate(`/${shopSlug}/pos/sales/quick`)}>ขายสินค้า</Button>
          <Button variant="subtle" onClick={() => navigate(`/${shopSlug}/pos/sales/orders`)}>ค้นหาออเดอร์</Button>
          <Button variant="subtle" onClick={loadAllAction} disabled={salesOverviewLoading}>
            {salesOverviewLoading ? 'กำลังโหลด...' : 'โหลดทั้งหมด'}
          </Button>
        </div>
      </div>

      {/* ================= Layer 1: Executive Summary ================= */}
      {/* 🟢 FIXED: เติม grid-cols-12 เพื่อรองรับโครงสร้างการ์ดลอย 2 ฝั่งให้เหมือนหน้าจัดซื้อเป๊ะ ๆ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* 🟢 FIXED: คุมพื้นที่ฝั่งซ้าย 8 ช่องสำหรับกลุ่ม KPI และ HealthBanner */}
        <div className="lg:col-span-8 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPIBarItem
              label="ยอดขายวันนี้"
              value={todayAmount === null ? '—' : `฿${fmtMoney(todayAmount)}`}
              tone={todayAmount !== null && todayAmount > 0 ? 'good' : 'neutral'}
              hint={overviewUI.loaded ? overviewUI.data?.todaySalesAmountHint || 'ยอดรวมจากบิลที่ปิดแล้ว' : 'แตะ “โหลดทั้งหมด”'}
              onClick={() => navigate(`/${shopSlug}/pos/sales/reports?range=today`)}
            />
            <KPIBarItem
              label="จำนวนรายการขาย"
              value={todayCount === null ? '—' : `${fmtMoney(todayCount)} รายการ`}
              tone="neutral"
              hint={overviewUI.loaded ? overviewUI.data?.todaySalesCountHint || 'จำนวนบิลตามระบบ' : ''}
              onClick={() => navigate(`/${shopSlug}/pos/sales/reports?range=today`)}
            />
            <KPIBarItem
              label="ยอดที่ยังไม่ชำระ"
              value={unpaidCount === null ? '—' : `${fmtMoney(unpaidCount)} รายการ`}
              tone={unpaidCount !== null && unpaidCount > 0 ? 'warn' : 'neutral'}
              hint={overviewUI.loaded ? overviewUI.data?.unpaidHint || 'ต้องติดตาม/ปิดบิล' : ''}
              onClick={() => navigate(`/${shopSlug}/pos/sales/bills?status=unpaid`)}
            />
            <KPIBarItem
              label="ยอดขายเดือนนี้"
              value={monthAmount === null ? '—' : `฿${fmtMoney(monthAmount)}`}
              tone={monthAmount !== null && monthAmount > 0 ? 'good' : 'neutral'}
              hint={monthAmountHint}
              onClick={() => navigate(`/${shopSlug}/pos/sales/reports?range=month`)}
            />
          </div>

          <div className="w-full">
            <HealthBanner
              tone={health.tone}
              title={health.title}
              subtitle={health.subtitle}
              actionLabel={health.actionLabel}
              onAction={health.action}
            />
          </div>
        </div>

        {/* 🟢 FIXED: คุมพื้นที่ฝั่งขวา 4 ช่องสำหรับ Action Shortcuts ให้กางสวยงามสมมาตร ไม่บีบเป็นเส้นอีกต่อไป */}
        <div className="lg:col-span-4 rounded-2xl border border-zinc-800 bg-zinc-900 p-5 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="text-sm font-black text-white">Action Shortcuts</div>
            <div className="text-xs text-zinc-400 mt-0.5 font-medium">ทางลัดเพื่อการตัดสินใจเร่งด่วน</div>
          </div>

          <div className="grid grid-cols-1 gap-3 my-2">
            <Button variant="subtle" onClick={() => navigate(`/${shopSlug}/pos/sales/quick`)}>⚡ ขายสินค้า</Button>
            <Button variant="subtle" onClick={() => navigate(`/${shopSlug}/pos/sales/bills?status=unpaid`)}>🔔 ดูบิลค้างชำระ</Button>
            <Button variant="subtle" onClick={() => navigate(`/${shopSlug}/pos/sales/prints`)}>🧾 พิมพ์เอกสารย้อนหลัง</Button>
          </div>

          <div>
            <ErrorStrip
              message={
                salesOverviewError ||
                (!fetchSalesDashboardOverviewAction
                  ? 'ยังไม่พบ action: fetchSalesDashboardOverviewAction'
                  : null)
              }
              onRetry={safeLoadOverview}
              retrying={salesOverviewLoading}
            />

            {!overviewUI.loaded && (
              <EmptyBox
                title="ยังไม่ได้โหลดตัวเลขภาพรวม"
                desc={
                  salesOverviewError ||
                  (!fetchSalesDashboardOverviewAction
                    ? 'ยังไม่พบ action'
                    : 'แตะเพื่อโหลด KPI สำคัญ')
                }
                clickable
                loading={salesOverviewLoading}
                onClick={safeLoadOverview}
              />
            )}
          </div>
        </div>
      </div>

      {/* ================= Layer 2: Operational Snapshot ================= */}
      <div className="bg-zinc-900 border border-zinc-800/80 p-6 rounded-2xl shadow-sm space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-black text-white">Operational Snapshot</h2>
            <p className="text-xs text-zinc-400 mt-0.5 font-medium">สรุปสถานะงานขายที่ต้องดูเป็นอันดับแรก</p>
          </div>

          {overviewUI.loaded ? (
            <div className="flex items-center gap-3">
              {salesOverviewLastLoadedAt && (
                <span className="text-[11px] text-zinc-500 font-mono">UPDATED: {formatTimeAgo(salesOverviewLastLoadedAt)}</span>
              )}
              <Button variant="subtle" onClick={safeLoadOverview} disabled={salesOverviewLoading}>
                {salesOverviewLoading ? 'กำลังโหลด...' : 'รีเฟรช'}
              </Button>
            </div>
          ) : null}
        </div>

        {overviewUI.loaded && overviewUI.data ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SummaryCard
              label="ยอดขายวันนี้"
              value={`฿${fmtMoney(overviewUI.data?.todaySalesAmount || 0)}`}
              clickable
              onClick={() => navigate(`/${shopSlug}/pos/sales/reports?range=today`)}
            />
            <SummaryCard
              label="จำนวนรายการขาย"
              value={`${fmtMoney(overviewUI.data?.todaySalesCount || 0)} รายการ`}
              clickable
              onClick={() => navigate(`/${shopSlug}/pos/sales/reports?range=today`)}
            />
            <SummaryCard
              label="ค้างชำระ"
              value={`${fmtMoney(overviewUI.data?.unpaidCount || 0)} รายการ`}
              clickable
              onClick={() => navigate(`/${shopSlug}/pos/sales/bills?status=unpaid`)}
            />
          </div>
        ) : (
          <Card className="border border-zinc-800 bg-zinc-900/40 rounded-2xl shadow-none">
            <CardContent className="p-5">
              <div className="text-sm font-bold text-zinc-200">ยังไม่มีข้อมูล snapshot</div>
              <div className="text-xs text-zinc-400 mt-1 font-medium">กด “โหลดทั้งหมด” เพื่อเริ่มต้นประมวลผลดัชนีคลังข้อมูล</div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* ================= Layer 3: Insights ================= */}
      <div className="bg-zinc-900 border border-zinc-800/80 p-6 rounded-2xl shadow-sm space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-black text-white">Insights & Analytics</h2>
            <p className="text-xs text-zinc-400 mt-0.5 font-medium">กราฟรายเดือนคัดกรองตามช่องทางจัดจำหน่ายและสินค้าขายดี</p>
          </div>
          <div className="text-[10px] font-black bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-md border border-zinc-700 uppercase tracking-wide">
            Coming Soon
          </div>
        </div>

        <Tabs defaultValue="monthly" className="w-full">
          <TabsList className="bg-zinc-800 p-1 rounded-xl border border-zinc-700/60">
            <TabsTrigger value="monthly" className="rounded-lg text-xs font-bold px-4 py-2 data-[state=active]:bg-gradient-to-b data-[state=active]:from-amber-400 data-[state=active]:to-orange-500 data-[state=active]:text-white text-zinc-400">
              ยอดขายรายเดือน
            </TabsTrigger>
            <TabsTrigger value="top" className="rounded-lg text-xs font-bold px-4 py-2 data-[state=active]:bg-gradient-to-b data-[state=active]:from-amber-400 data-[state=active]:to-orange-500 data-[state=active]:text-white text-zinc-400">
              Top สินค้า/ช่องทาง
            </TabsTrigger>
          </TabsList>

          <TabsContent value="monthly" className="outline-none pt-2">
            {!insightUI.loaded ? (
              <EmptyBox
                title="ยังไม่ได้โหลด Insights"
                desc="Task นี้เน้น executive layer ให้ครบก่อน — กราฟจริงจะเชื่อม aggregation ใน Task ถัดไป"
                clickable
                loading={insightUI.loading}
                onClick={() => setInsightUI((prev) => ({ ...prev, loaded: true, lastLoadedAt: new Date() }))}
              />
            ) : (
              <Card className="border border-zinc-800 bg-zinc-900/40 rounded-2xl shadow-none">
                <CardContent className="p-5">
                  <div className="text-sm font-bold text-zinc-200">กราฟยอดขายรายเดือนสุทธิ</div>
                  <div className="text-xs text-zinc-400 mt-1.5 leading-relaxed font-medium">
                    (Placeholder) — ในเฟสถัดไปจะทำการเชื่อมต่อชุดข้อมูลจำนวนบิลรวม ผลกำไรขาดทุนเบื้องต้น และฟิลเตอร์สลับเงื่อนไขเวลา 30 วัน, 90 วัน หรือรอบปีปัจจุบัน
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="top" className="outline-none pt-2">
            <Card className="border border-zinc-800 bg-zinc-900/40 rounded-2xl shadow-none">
              <CardContent className="p-5">
                <div className="text-sm font-bold text-zinc-200">อันดับสินค้าและช่องทางทำเงินสูงสุด</div>
                <div className="text-xs text-zinc-400 mt-1.5 leading-relaxed font-medium font-sans">
                  (Placeholder) — ระบบ Agent สแตนด์บายรอ data aggregation เพื่อคำนวณสัดส่วนมูลค่าและดีดเรดาร์สรุปพฤติกรรมการสั่งซื้อแบบ Real-time
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

    </div>
  );
};

export default SalesDashboardPage;