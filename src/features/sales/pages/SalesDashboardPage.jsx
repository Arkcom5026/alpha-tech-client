// src/features/sales/pages/SalesDashboardPage.jsx
// 🏛️ Clean Architecture Multi-Tenant Sales Dashboard Hub
// 🎨 Minimal Platinum Light Mode Edition (User Feedback Optimized — Clear Reading Text)

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
    className={`w-full rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-6 shadow-inner text-left transition-all duration-200 ${
      clickable ? 'hover:border-orange-500/40 hover:bg-white hover:-translate-y-0.5 cursor-pointer' : 'cursor-default'
    } ${loading ? 'opacity-70 cursor-wait' : ''}`}
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
      className={`w-full rounded-2xl border px-4 py-3 text-left shadow-[0_4px_20px_rgba(0,0,0,0.01)] transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${
        toneMap[tone] || toneMap.neutral
      }`}
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
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sales Health Status</div>
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

const SummaryCard = ({ label, value, clickable = false, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={!clickable}
    className={`w-full rounded-2xl border border-slate-200 bg-slate-50/60 px-5 py-4 shadow-sm text-left transition-all duration-200 ${
      clickable ? 'hover:border-orange-500/40 hover:bg-white hover:shadow-md hover:-translate-y-0.5 cursor-pointer' : 'cursor-default'
    }`}
    aria-label={label}
  >
    <div className="text-xs text-slate-400 font-black uppercase tracking-wide">{label}</div>
    <div className="text-xl font-black text-slate-900 mt-1.5 tracking-tight">{value}</div>
    {clickable && <div className="text-[11px] mt-2 text-orange-600 font-black">แตะเพื่อเรียกดูตาราง</div>}
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
        title: 'ยังไม่ได้เรียกข้อมูลภาพรวมการขาย',
        subtitle: 'กรุณากดคำสั่ง “โหลดทั้งหมด” เพื่อดึงสถิติประมวลผลดุลธุรกรรมล่าสุด',
        actionLabel: 'ดึงข้อมูลภาพรวม',
        action: safeLoadOverview,
      };
    }

    const unpaid = Number(overviewUI.data?.unpaidCount || 0);
    if (unpaid > 0) {
      return {
        tone: 'warn',
        title: `🚨 ตรวจพบรายการค้างชำระสะสม ${unpaid} บิล`,
        subtitle: 'แนะนำให้ไล่เก็บเงินหรือเร่งปิดสิทธิ์บิลเพื่อไม่ให้เกิดหนี้สูญค้างงวด',
        actionLabel: 'ตรวจสอบบิลค้าง',
        action: () => navigate(`/${shopSlug}/pos/sales/bills?status=unpaid`),
      };
    }

    return {
      tone: 'good',
      title: '✨ ข้อมูลธุรกรรมปกติ ไม่มีรายการค้างชำระในงวดงาน',
      subtitle: 'ภาพรวมสุขภาพและสภาพคล่องทางการขายหน้าร้านอยู่ในเกณฑ์ยอดเยี่ยม',
      actionLabel: 'เปิดหน้าจอขายด่วน',
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
    ? overviewUI.data?.monthSalesAmountHint || 'ยอดสะสมรวมในเดือนบัญชีปัจจุบัน'
    : '';

  return (
    // 🟢 PLATINUM LIGHT MODE OVERHAUL: ล้างความมืดทึมออก เปลี่ยนเฉดสว่าง คลีน ตัวหนังสืออ่านง่ายชัดเจน
    <div className="space-y-6 animate-fadeIn p-4 md:p-6 bg-slate-50 min-h-screen text-slate-800 font-sans">
      
      {/* ================= 🟦 1. ส่วนหัวบอร์ดสไตล์ Glassmorphism คลีนแพลทินัม ================= */}
      <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-[0_4px_25px_rgba(0,0,0,0.01)] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 transition-all select-none">
        <div className="min-w-0">
          <h1 className="text-xl font-black text-slate-900 tracking-tight">หน้าหลักควบคุมงานขาย (Sales Dashboard)</h1>
          <p className="text-xs text-slate-400 mt-0.5 font-bold tracking-wide">Executive Multi-Tenant Revenue & Storefront Sales Hub</p>
          {salesOverviewLastLoadedAt && (
            <div className="text-[10px] font-mono text-slate-400 font-black mt-1.5">
              🔄 อัปเดตล่าสุด: {formatTimeAgo(salesOverviewLastLoadedAt)}
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Button variant="primary" onClick={() => navigate(`/${shopSlug}/pos/sales/quick`)}>เปิดหน้าขายสินค้า</Button>
          <Button variant="subtle" onClick={() => navigate(`/${shopSlug}/pos/sales/orders`)}>ค้นหาตรวจสอบออเดอร์</Button>
          <Button variant="subtle" onClick={loadAllAction} disabled={salesOverviewLoading}>
            {salesOverviewLoading ? 'กำลังสตรีม...' : 'โหลดข้อมูลทั้งหมด'}
          </Button>
        </div>
      </div>

      {/* ================= Layer 2: KPI & Balance Summary ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* คุมพื้นที่ฝั่งซ้าย 8 ช่องสำหรับกลุ่ม KPI และ แบนเนอร์สุขภาพการขาย */}
        <div className="lg:col-span-8 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 select-none">
            <KPIBarItem
              label="ยอดเงินขายวันนี้"
              value={todayAmount === null ? '—' : `฿${fmtMoney(todayAmount)}`}
              tone={todayAmount !== null && todayAmount > 0 ? 'good' : 'neutral'}
              hint={overviewUI.loaded ? overviewUI.data?.todaySalesAmountHint || 'รวมยอดจากบิลที่ปิดเสร็จสิ้น' : 'แตะ “โหลดทั้งหมด”'}
              onClick={() => navigate(`/${shopSlug}/pos/sales/reports?range=today`)}
            />
            <KPIBarItem
              label="จำนวนบิลปิดการขาย"
              value={todayCount === null ? '—' : `${fmtMoney(todayCount)} บิล`}
              tone="neutral"
              hint={overviewUI.loaded ? overviewUI.data?.todaySalesCountHint || 'จำนวนตั๋วแผ่นในระบบ' : ''}
              onClick={() => navigate(`/${shopSlug}/pos/sales/reports?range=today`)}
            />
            <KPIBarItem
              label="ยอดหนี้ค้างชำระหน้าร้าน"
              value={unpaidCount === null ? '—' : `${fmtMoney(unpaidCount)} รายการ`}
              tone={unpaidCount !== null && unpaidCount > 0 ? 'warn' : 'neutral'}
              hint={overviewUI.loaded ? overviewUI.data?.unpaidHint || 'ต้องเร่งรัดติดตามปิดงวดบิล' : ''}
              onClick={() => navigate(`/${shopSlug}/pos/sales/bills?status=unpaid`)}
            />
            <KPIBarItem
              label="ยอดรวมสะสมเดือนนี้"
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

        {/* คุมพื้นที่ฝั่งขวา 4 ช่องสำหรับแผงปุ่มลัดคำสั่งและตัวกรองวิเคราะห์เออเร่อ */}
        <div className="lg:col-span-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_4px_25px_rgba(0,0,0,0.01)] space-y-4 flex flex-col justify-between">
          <div className="select-none">
            <div className="text-sm font-black text-slate-900">แผงทางลัดด่วน (Action Shortcuts)</div>
            <div className="text-xs text-slate-400 mt-0.5 font-bold">ปุ่มเมนูลัดเพื่อความคล่องตัวในการบริการลูกค้า</div>
          </div>

          <div className="grid grid-cols-1 gap-3 my-2 select-none">
            <Button variant="subtle" onClick={() => navigate(`/${shopSlug}/pos/sales/quick`)}>⚡ เริ่มต้นขายสินค้าด่วน</Button>
            <Button variant="subtle" onClick={() => navigate(`/${shopSlug}/pos/sales/bills?status=unpaid`)}>🔔 ไล่ตรวจบิลค้างชำระ</Button>
            <Button variant="subtle" onClick={() => navigate(`/${shopSlug}/pos/sales/prints`)}>🧾 พิมพ์ใบเสร็จย้อนหลัง</Button>
          </div>

          <div>
            <ErrorStrip
              message={
                salesOverviewError ||
                (!fetchSalesDashboardOverviewAction
                  ? 'ระบบไม่พบหน่วยสั่งการ: fetchSalesDashboardOverviewAction'
                  : null)
              }
              onRetry={safeLoadOverview}
              retrying={salesOverviewLoading}
            />

            {!overviewUI.loaded && (
              <EmptyBox
                title="สถิติภาพรวมยังไม่ได้โหลดสิทธิ์"
                desc={
                  salesOverviewError ||
                  (!fetchSalesDashboardOverviewAction
                    ? 'ไม่พบโมดูลหลังบ้าน'
                    : 'แตะตรงนี้เพื่อ Query ดึงค่าตัวเลขสำคัญ')
                }
                clickable
                loading={salesOverviewLoading}
                onClick={safeLoadOverview}
              />
            )}
          </div>
        </div>
      </div>

      {/* ================= Layer 3: Document Flow Snapshot ================= */}
      <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-[0_4px_25px_rgba(0,0,0,0.01)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 select-none">
          <div>
            <h2 className="text-base font-black text-slate-900">สรุปสถานการณ์หน้าเคาน์เตอร์ (Operational Snapshot)</h2>
            <p className="text-xs text-slate-400 font-bold mt-0.5">รายการสรุปตัวเลขอัตราการปิดยอดขายหน้าร้านรายวันแบบสรุปความเร็วสูง</p>
          </div>

          {overviewUI.loaded ? (
            <div className="flex items-center gap-3">
              {salesOverviewLastLoadedAt && (
                <span className="text-[11px] text-slate-400 font-mono font-bold">เช็คข้อมูลเมื่อ: {formatTimeAgo(salesOverviewLastLoadedAt)}</span>
              )}
              <Button variant="subtle" onClick={safeLoadOverview} disabled={salesOverviewLoading}>
                {salesOverviewLoading ? 'กำลังสตรีม...' : 'รีเฟรชยอดขาย'}
              </Button>
            </div>
          ) : null}
        </div>

        {overviewUI.loaded && overviewUI.data ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SummaryCard
              label="รวมเม็ดเงินขายวันนี้"
              value={`฿${fmtMoney(overviewUI.data?.todaySalesAmount || 0)}`}
              clickable
              onClick={() => navigate(`/${shopSlug}/pos/sales/reports?range=today`)}
            />
            <SummaryCard
              label="รวมจำนวนตั๋วบิลขาย"
              value={`${fmtMoney(overviewUI.data?.todaySalesCount || 0)} รายการ`}
              clickable
              onClick={() => navigate(`/${shopSlug}/pos/sales/reports?range=today`)}
            />
            <SummaryCard
              label="รายการรอตามเก็บเงิน"
              value={`${fmtMoney(overviewUI.data?.unpaidCount || 0)} บิล`}
              clickable
              onClick={() => navigate(`/${shopSlug}/pos/sales/bills?status=unpaid`)}
            />
          </div>
        ) : (
          <Card className="border border-slate-200 bg-slate-50/50 rounded-2xl shadow-none">
            <CardContent className="p-5">
              <div className="text-sm font-black text-slate-900">ยังไม่มีข้อมูล Snapshot ในสารบบสิทธิ์คลัง</div>
              <div className="text-xs text-slate-400 mt-1 font-bold">กรุณากดคำสั่ง “โหลดทั้งหมด” ด้านบนเพื่อคำนวณและดีดเรดาร์โครงสร้างขึ้นตาราง</div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* ================= Layer 4: Deep Insights & Analytics ================= */}
      <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-[0_4px_25px_rgba(0,0,0,0.01)] space-y-4">
        <div className="flex items-center justify-between gap-4 select-none">
          <div>
            <h2 className="text-base font-black text-slate-900">Sales Real-time Insights & Analytics</h2>
            <p className="text-xs text-slate-400 font-bold mt-0.5">แผนภูมิตัดกรอกอัตราส่วนแบ่งทางการตลาดและหมวดหมู่ผลิตภัณฑ์ไอทีทำเงินสูงสุด</p>
          </div>
          <div className="text-[10px] font-black bg-slate-100 text-slate-500 px-2.5 py-1 rounded-lg border border-slate-200 uppercase tracking-wide">
            Coming Soon Matrix
          </div>
        </div>

        <Tabs defaultValue="monthly" className="w-full">
          <TabsList className="bg-slate-100 p-1 rounded-2xl border border-slate-200/60 w-fit select-none">
            <TabsTrigger value="monthly" className="rounded-xl text-xs font-black px-5 py-2 data-[state=active]:bg-slate-900 data-[state=active]:text-white text-slate-500 transition-all duration-200">
              วิเคราะห์ยอดรายเดือน
            </TabsTrigger>
            <TabsTrigger value="top" className="rounded-xl text-xs font-black px-5 py-2 data-[state=active]:bg-slate-900 data-[state=active]:text-white text-slate-500 transition-all duration-200">
              อันดับสินค้า / ช่องทางขายดี
            </TabsTrigger>
          </TabsList>

          <TabsContent value="monthly" className="outline-none pt-2 animate-fadeIn">
            {!insightUI.loaded ? (
              <EmptyBox
                title="ดัชนีกราฟเชิงลึกรายเดือนยังไม่ได้เปิดสิทธิ์"
                desc="โครงสร้างสแตนด์บายของ Agent กลางคลังข้อมูลพร้อมทำงาน — แตะเพื่อจำลองมุมมองข้อมูลในรอบบัญชีถัดไป"
                clickable
                loading={insightUI.loading}
                onClick={() => setInsightUI((prev) => ({ ...prev, loaded: true, lastLoadedAt: new Date() }))}
              />
            ) : (
              <Card className="border border-slate-200 bg-slate-50/50 rounded-2xl shadow-none">
                <CardContent className="p-5">
                  <div className="text-sm font-black text-slate-900">แผนภูมิสรุปยอดเม็ดเงินปันผลสุทธิรายเดือน</div>
                  <div className="text-xs text-slate-500 mt-1.5 leading-relaxed font-bold">
                    (📊 แผงวิเคราะห์เสมือน) — ในขั้นตอนอัปเกรดระบบลำดับถัดไป จะทำการเชื่อมพอร์ตแสดงแผนภูมิกราฟแท่งเปรียบเทียบกำไรขั้นต้น ผลประกอบการรายสาขา และช่วงเวลาคัดกรอง 30 วัน, 90 วัน หรือรอบงบปีปัจจุบันให้เห็นแบบละเอียดยิบ
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="top" className="outline-none pt-2 animate-fadeIn">
            <Card className="border border-slate-200 bg-slate-50/50 rounded-2xl shadow-none">
              <CardContent className="p-5">
                <div className="text-sm font-black text-slate-900">อันดับช่องทางทำเงินสูงสุดและสินค้าขายดีอันดับหนึ่ง (Product Share)</div>
                <div className="text-xs text-slate-500 mt-1.5 leading-relaxed font-bold">
                  (📊 แผงวิเคราะห์เสมือน) — โมดูล Data Aggregator แสตนด์บายรองรับคำสั่งเพื่อประมวลผลดักสัญญาณ Real-time หาพฤติกรรมการซื้อหน้าร้านและการจ่ายเงินโอน เพื่อช่วยจัดหมวดหมู่กลุ่มแบรนด์พัสดุไอทีที่เคลื่อนไหวเร็วที่สุดในร้านค้า
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