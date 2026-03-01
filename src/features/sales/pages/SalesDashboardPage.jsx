// 📁 FILE: src/features/sales/pages/SalesDashboardPage.jsx

import React, { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import useSalesStore from '@/features/sales/store/salesStore';

// ============================================================
// ✅ SalesDashboardPage (Executive Overview)
// - ไม่ใช้ dialog alert (แสดงข้อความบนหน้า)
// - manual load + ปุ่มโหลดทั้งหมด/รีเฟรช
// - Insights เป็น placeholder ได้ (Task ถัดไปค่อยทำ aggregation)
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
  const base =
    'inline-flex items-center justify-center rounded-xl px-3 py-2 text-xs font-medium transition border shadow-sm';
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
    className={`w-full rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm text-left transition ${
      clickable ? 'hover:shadow-md hover:-translate-y-0.5 cursor-pointer' : 'cursor-default'
    } ${loading ? 'opacity-70 cursor-wait' : ''}`}
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
      className={`w-full rounded-2xl border px-4 py-3 text-left shadow-sm transition hover:shadow-md hover:-translate-y-0.5 ${
        toneMap[tone] || toneMap.neutral
      }`}
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
            <div className="text-xs font-semibold text-zinc-800">Sales Health</div>
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

const SummaryCard = ({ label, value, clickable = false, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={!clickable}
    className={`w-full rounded-2xl border border-zinc-200 bg-white px-5 py-4 shadow-sm text-left transition ${
      clickable ? 'hover:shadow-md hover:-translate-y-0.5 cursor-pointer' : 'cursor-default'
    }`}
    aria-label={label}
  >
    <div className="text-xs text-zinc-500">{label}</div>
    <div className="text-xl font-semibold text-zinc-900 mt-1">{value}</div>
    {clickable && <div className="text-[11px] mt-2 text-zinc-500">แตะเพื่อดูรายการ</div>}
  </button>
);

const SalesDashboardPage = () => {
  const navigate = useNavigate();

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

    if (!fetchSalesDashboardOverviewAction) {
      return;
    }

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
        action: () => navigate('/pos/sales/bills?status=unpaid'),
      };
    }

    return {
      tone: 'good',
      title: 'การขายปกติ ไม่มีรายการค้างชำระ',
      subtitle: 'ภาพรวมสุขภาพการขายอยู่ในระดับดี',
      actionLabel: 'ไปขายสินค้า',
      action: () => navigate('/pos/sales/quick'),
    };
  }, [overviewUI.loaded, overviewUI.data, navigate, safeLoadOverview]);

  const fmtMoney = (n) => {
    const v = Number(n || 0);
    return v.toLocaleString('th-TH');
  };

  const todayAmount = overviewUI.loaded ? Number(overviewUI.data?.todaySalesAmount || 0) : null;
  const todayCount = overviewUI.loaded ? Number(overviewUI.data?.todaySalesCount || 0) : null;
  const unpaidCount = overviewUI.loaded ? Number(overviewUI.data?.unpaidCount || 0) : null;
  const monthAmount = overviewUI.loaded ? Number(overviewUI.data?.monthSalesAmount || 0) : null;

  const monthAmountHint = overviewUI.loaded
    ? overviewUI.data?.monthSalesAmountHint || 'ยอดสะสมเดือนนี้ (placeholder หากยังไม่มี aggregation)'
    : '';

  return (
    <div className="p-8 w-full flex flex-col items-center bg-gradient-to-b from-white to-zinc-50 min-h-screen">
      <div className="w-full max-w-6xl">
        {/* ================= Header ================= */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="min-w-0">
            <h1 className="text-xl font-semibold text-zinc-800">หน้าหลักการขาย</h1>
            <p className="text-xs text-zinc-500 mt-1">
              Executive Overview
              <span className="sr-only">Manual load only • No dialog alerts</span>
            </p>
            {salesOverviewLastLoadedAt && (
              <div className="text-[11px] text-zinc-500 mt-2">
                updated {formatTimeAgo(salesOverviewLastLoadedAt)}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button variant="subtle" onClick={() => navigate('/pos/sales/quick')}>
              ขายสินค้า
            </Button>
            <Button variant="subtle" onClick={() => navigate('/pos/sales/orders')}>
              ค้นหาออเดอร์
            </Button>
            <Button variant="subtle" onClick={loadAllAction} disabled={salesOverviewLoading}>
              {salesOverviewLoading ? 'กำลังโหลด...' : 'โหลดทั้งหมด'}
            </Button>
          </div>
        </div>

        {/* ================= Layer 1: Executive Summary ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <KPIBarItem
                label="ยอดขายวันนี้"
                value={todayAmount === null ? '—' : `฿${fmtMoney(todayAmount)}`}
                tone={todayAmount !== null && todayAmount > 0 ? 'good' : 'neutral'}
                hint={
                  overviewUI.loaded
                    ? overviewUI.data?.todaySalesAmountHint || 'ยอดรวมจากบิลที่ปิดแล้ว'
                    : 'แตะ “โหลดทั้งหมด” เพื่อดึงข้อมูล'
                }
                onClick={() => navigate('/pos/sales/reports?range=today')}
              />
              <KPIBarItem
                label="จำนวนรายการขาย"
                value={todayCount === null ? '—' : `${fmtMoney(todayCount)} รายการ`}
                tone="neutral"
                hint={overviewUI.loaded ? overviewUI.data?.todaySalesCountHint || 'จำนวนบิล/รายการตามระบบ' : ''}
                onClick={() => navigate('/pos/sales/reports?range=today')}
              />
              <KPIBarItem
                label="ยอดที่ยังไม่ชำระ"
                value={unpaidCount === null ? '—' : `${fmtMoney(unpaidCount)} รายการ`}
                tone={unpaidCount !== null && unpaidCount > 0 ? 'warn' : 'neutral'}
                hint={overviewUI.loaded ? overviewUI.data?.unpaidHint || 'ต้องติดตาม/ปิดบิล' : ''}
                onClick={() => navigate('/pos/sales/bills?status=unpaid')}
              />
              <KPIBarItem
                label="ยอดขายเดือนนี้"
                value={monthAmount === null ? '—' : `฿${fmtMoney(monthAmount)}`}
                tone={monthAmount !== null && monthAmount > 0 ? 'good' : 'neutral'}
                hint={monthAmountHint}
                onClick={() => navigate('/pos/sales/reports?range=month')}
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

          {/* Action shortcuts (Executive) */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
            <div className="text-sm font-semibold text-zinc-800">Action Shortcuts</div>
            <div className="text-xs text-zinc-500 mt-0.5">ทางลัดเพื่อการตัดสินใจ</div>

            <div className="grid grid-cols-1 gap-3 mt-3">
              <Button variant="subtle" onClick={() => navigate('/pos/sales/quick')}>
                ⚡ ขายสินค้า
              </Button>
              <Button variant="subtle" onClick={() => navigate('/pos/sales/bills?status=unpaid')}>
                🔔 ดูบิลค้างชำระ
              </Button>
              <Button variant="subtle" onClick={() => navigate('/pos/sales/prints')}>
                🧾 พิมพ์เอกสารย้อนหลัง
              </Button>
            </div>

            <div className="mt-3">
              <ErrorStrip
                message={
                  salesOverviewError ||
                  (!fetchSalesDashboardOverviewAction
                    ? 'ยังไม่พบ action: fetchSalesDashboardOverviewAction (ตรวจ path import / store export)'
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
                      ? 'ยังไม่พบ action: fetchSalesDashboardOverviewAction'
                      : 'แตะเพื่อโหลด KPI สำคัญของการขาย')
                  }
                  clickable
                  loading={salesOverviewLoading}
                  onClick={safeLoadOverview}
                />
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-zinc-200/60 pt-6 mt-2" />

        {/* ================= Layer 2: Operational Snapshot ================= */}
        <div className="mb-6">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div>
              <h2 className="text-sm font-semibold text-zinc-800">Operational Snapshot</h2>
              <p className="text-xs text-zinc-500 mt-0.5">สรุปสถานะงานขายที่ต้องดูเป็นอันดับแรก</p>
            </div>

            {overviewUI.loaded ? (
              <div className="flex items-center gap-2">
                {salesOverviewLastLoadedAt && (
                  <span className="text-[11px] text-zinc-500">updated {formatTimeAgo(salesOverviewLastLoadedAt)}</span>
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
                onClick={() => navigate('/pos/sales/reports?range=today')}
              />
              <SummaryCard
                label="จำนวนรายการขาย"
                value={`${fmtMoney(overviewUI.data?.todaySalesCount || 0)} รายการ`}
                clickable
                onClick={() => navigate('/pos/sales/reports?range=today')}
              />
              <SummaryCard
                label="ค้างชำระ"
                value={`${fmtMoney(overviewUI.data?.unpaidCount || 0)} รายการ`}
                clickable
                onClick={() => navigate('/pos/sales/bills?status=unpaid')}
              />
            </div>
          ) : (
            <Card>
              <CardContent className="p-4">
                <div className="text-sm font-semibold text-zinc-800">ยังไม่มีข้อมูล snapshot</div>
                <div className="text-xs text-zinc-500 mt-1">กด “โหลดทั้งหมด” เพื่อเริ่มต้น</div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="border-t border-zinc-200/60 pt-6 mt-4" />

        {/* ================= Layer 3: Insights (placeholder) ================= */}
        <div className="mb-2">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div>
              <h2 className="text-sm font-semibold text-zinc-800">Insights</h2>
              <p className="text-xs text-zinc-500 mt-0.5">กราฟรายเดือน + ช่องทาง/สินค้า Top (placeholder)</p>
            </div>
            <div className="text-[11px] text-zinc-500">toggle: 30 วัน / 90 วัน / ปีนี้ (coming soon)</div>
          </div>
        </div>

        <Tabs defaultValue="monthly">
          <TabsList>
            <TabsTrigger value="monthly">ยอดขายรายเดือน</TabsTrigger>
            <TabsTrigger value="top">Top สินค้า/ช่องทาง</TabsTrigger>
          </TabsList>

          <TabsContent value="monthly">
            <div className="mt-4">
              {!insightUI.loaded ? (
                <EmptyBox
                  title="ยังไม่ได้โหลด Insights"
                  desc="Task นี้เน้น executive layer ให้ครบก่อน — กราฟจริงจะเชื่อม aggregation ใน Task ถัดไป"
                  clickable
                  loading={insightUI.loading}
                  onClick={() => setInsightUI((prev) => ({ ...prev, loaded: true, lastLoadedAt: new Date() }))}
                />
              ) : (
                <Card>
                  <CardContent className="p-4">
                    <div className="text-sm font-semibold text-zinc-800">กราฟยอดขายรายเดือน</div>
                    <div className="text-xs text-zinc-500 mt-1">
                      (placeholder) — จะเพิ่มจำนวนบิล + มูลค่ารวม + toggle 30/90/ปีนี้
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="top">
            <div className="mt-4">
              <Card>
                <CardContent className="p-4">
                  <div className="text-sm font-semibold text-zinc-800">Top สินค้า/ช่องทาง</div>
                  <div className="text-xs text-zinc-500 mt-1">(placeholder) — รอ data aggregation ใน Task ถัดไป</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SalesDashboardPage;