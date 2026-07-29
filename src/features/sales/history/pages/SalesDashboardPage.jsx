import React, { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useSalesDashboardWorkflow } from '../dashboard';

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

const Button = ({ children, onClick, disabled, variant = 'subtle' }) => {
  const base = 'inline-flex items-center justify-center rounded-xl px-4 py-2 text-xs font-black transition-all border shadow-sm duration-150 select-none';
  const variants = {
    primary: 'bg-gradient-to-b from-orange-500 to-amber-500 text-white border-orange-600/20 hover:from-orange-600 hover:to-amber-600 shadow-orange-500/10 active:scale-95 transform',
    subtle: 'bg-slate-800 text-slate-100 border-slate-900 hover:bg-slate-900 active:scale-95 transform',
    ghost: 'bg-transparent text-slate-500 border-transparent hover:bg-slate-100 hover:text-slate-900',
  };
  return <button type="button" onClick={onClick} disabled={disabled} className={`${base} ${variants[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>{children}</button>;
};

const ErrorStrip = ({ message, onRetry, retrying = false }) => {
  if (!message) return null;
  return <div className="mb-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 shadow-sm animate-fadeIn"><div className="flex items-start justify-between gap-3"><div className="text-xs text-rose-700 leading-snug font-medium"><div className="font-black text-sm">โหลดข้อมูลไม่สำเร็จ</div><div className="mt-0.5 font-bold opacity-90">{String(message)}</div></div>{onRetry && <Button variant="subtle" onClick={onRetry} disabled={retrying}>{retrying ? 'กำลังลองใหม่...' : 'ลองใหม่'}</Button>}</div></div>;
};

const EmptyBox = ({ title, desc, onClick, clickable = false, loading = false }) => <button type="button" onClick={onClick} disabled={!clickable || loading} className={`w-full rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-6 shadow-inner text-left transition-all duration-200 ${clickable ? 'hover:border-orange-500/40 hover:bg-white hover:-translate-y-0.5 cursor-pointer' : 'cursor-default'} ${loading ? 'opacity-70 cursor-wait' : ''}`} aria-label={title}><div className="text-sm font-black text-slate-900">{title}</div>{desc && <div className="text-xs text-slate-500 mt-1.5 leading-snug font-bold">{desc}</div>}{clickable && <div className="mt-4 inline-flex items-center gap-2 text-xs text-orange-600 font-black select-none"><span className="rounded-lg bg-orange-500/10 border border-orange-500/20 px-2.5 py-1">แตะเพื่อสั่งโหลดข้อมูล</span><span className="text-[11px] text-slate-400 font-bold">(ระบบไม่โหลดอัตโนมัติ)</span></div>}</button>;

const KPIBarItem = ({ label, value, tone = 'neutral', hint, onClick }) => {
  const toneMap = { neutral: 'border-slate-200 bg-white text-slate-900', warn: 'border-orange-500/20 bg-orange-500/5 text-slate-900', good: 'border-emerald-500/20 bg-emerald-500/5 text-slate-900' };
  return <button type="button" onClick={onClick} className={`w-full rounded-2xl border px-4 py-3 text-left shadow-[0_4px_20px_rgba(0,0,0,0.01)] transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${toneMap[tone] || toneMap.neutral}`}><div className="text-[11px] text-slate-400 font-black uppercase tracking-wider">{label}</div><div className="text-lg font-black mt-1 leading-none text-slate-900 tracking-tight">{value}</div>{hint && <div className="text-[11px] mt-1.5 font-black text-slate-400">{hint}</div>}</button>;
};

const HealthBanner = ({ tone = 'neutral', title, subtitle, actionLabel, onAction }) => <div className="w-full rounded-2xl border px-5 py-4 bg-white"><div className="flex items-center justify-between gap-3"><div><div className="text-base font-black text-slate-900">{title}</div>{subtitle && <div className="text-xs text-slate-500 mt-0.5 font-bold">{subtitle}</div>}</div>{onAction && <Button variant="subtle" onClick={onAction}>{actionLabel || 'ดูรายการ'}</Button>}</div></div>;
const SummaryCard = ({ label, value, onClick }) => <button type="button" onClick={onClick} className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 px-5 py-4 shadow-sm text-left"><div className="text-xs text-slate-400 font-black uppercase tracking-wide">{label}</div><div className="text-xl font-black text-slate-900 mt-1.5">{value}</div></button>;

const SalesDashboardPage = () => {
  const navigate = useNavigate();
  const { shopSlug } = useParams();
  const dashboard = useSalesDashboardWorkflow({ navigate, shopSlug });
  const fmtMoney = (value) => Number(value || 0).toLocaleString('th-TH');
  const todayAmount = dashboard.loaded ? Number(dashboard.overview?.todaySalesAmount || 0) : null;
  const todayCount = dashboard.loaded ? Number(dashboard.overview?.todaySalesCount || 0) : null;
  const unpaidCount = dashboard.loaded ? Number(dashboard.overview?.unpaidCount || 0) : null;
  const monthAmount = dashboard.loaded ? Number(dashboard.overview?.monthSalesAmount || 0) : null;
  const insightLoaded = dashboard.insightUI.loaded;
  const health = useMemo(() => dashboard.health, [dashboard.health]);

  return <div className="space-y-6 animate-fadeIn p-4 md:p-6 bg-slate-50 min-h-screen text-slate-800 font-sans">
    <div className="bg-white border border-slate-200/80 p-6 rounded-3xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div><h1 className="text-xl font-black text-slate-900">หน้าหลักควบคุมงานขาย (Sales Dashboard)</h1>{dashboard.lastLoadedAt && <div className="text-[10px] text-slate-400 mt-1.5">อัปเดตล่าสุด: {formatTimeAgo(dashboard.lastLoadedAt)}</div>}</div>
      <div className="flex flex-wrap items-center gap-2"><Button variant="primary" onClick={() => navigate(`/${shopSlug}/pos/sales/quick`)}>เปิดหน้าขายสินค้า</Button><Button variant="subtle" onClick={dashboard.actions.loadAll} disabled={dashboard.loading}>{dashboard.loading ? 'กำลังสตรีม...' : 'โหลดข้อมูลทั้งหมด'}</Button></div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-8 space-y-4"><div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"><KPIBarItem label="ยอดเงินขายวันนี้" value={todayAmount === null ? '—' : `฿${fmtMoney(todayAmount)}`} tone={todayAmount > 0 ? 'good' : 'neutral'} hint={dashboard.loaded ? dashboard.overview?.todaySalesAmountHint : 'แตะ “โหลดทั้งหมด”'} /><KPIBarItem label="จำนวนบิลปิดการขาย" value={todayCount === null ? '—' : `${fmtMoney(todayCount)} บิล`} /><KPIBarItem label="ยอดหนี้ค้างชำระหน้าร้าน" value={unpaidCount === null ? '—' : `${fmtMoney(unpaidCount)} รายการ`} tone={unpaidCount > 0 ? 'warn' : 'neutral'} /><KPIBarItem label="ยอดรวมสะสมเดือนนี้" value={monthAmount === null ? '—' : `฿${fmtMoney(monthAmount)}`} tone={monthAmount > 0 ? 'good' : 'neutral'} /></div><HealthBanner {...health} onAction={health.action} /></div>
      <div className="lg:col-span-4 rounded-2xl border border-slate-200 bg-white p-5"><ErrorStrip message={dashboard.error} onRetry={dashboard.actions.loadOverview} retrying={dashboard.loading} />{!dashboard.loaded && <EmptyBox title="สถิติภาพรวมยังไม่ได้โหลดสิทธิ์" desc={dashboard.error || 'แตะตรงนี้เพื่อ Query ดึงค่าตัวเลขสำคัญ'} clickable loading={dashboard.loading} onClick={dashboard.actions.loadOverview} />}</div>
    </div>

    <div className="bg-white border border-slate-200/80 p-6 rounded-3xl space-y-4"><div className="flex items-center justify-between"><h2 className="text-base font-black text-slate-900">สรุปสถานการณ์หน้าเคาน์เตอร์</h2>{dashboard.loaded && <Button variant="subtle" onClick={dashboard.actions.loadOverview} disabled={dashboard.loading}>รีเฟรชยอดขาย</Button>}</div>{dashboard.loaded && dashboard.overview ? <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><SummaryCard label="รวมเม็ดเงินขายวันนี้" value={`฿${fmtMoney(dashboard.overview.todaySalesAmount)}`} /><SummaryCard label="รวมจำนวนตั๋วบิลขาย" value={`${fmtMoney(dashboard.overview.todaySalesCount)} รายการ`} /><SummaryCard label="รายการรอตามเก็บเงิน" value={`${fmtMoney(dashboard.overview.unpaidCount)} บิล`} /></div> : <Card><CardContent className="p-5">ยังไม่มีข้อมูล Snapshot</CardContent></Card>}</div>

    <div className="bg-white border border-slate-200/80 p-6 rounded-3xl"><Tabs defaultValue="monthly"><TabsList><TabsTrigger value="monthly">วิเคราะห์ยอดรายเดือน</TabsTrigger><TabsTrigger value="top">อันดับสินค้า / ช่องทางขายดี</TabsTrigger></TabsList><TabsContent value="monthly">{!insightLoaded ? <EmptyBox title="ดัชนีกราฟเชิงลึกยังไม่ได้เปิดสิทธิ์" desc="Coming Soon" /> : <Card><CardContent className="p-5">Coming Soon</CardContent></Card>}</TabsContent><TabsContent value="top"><Card><CardContent className="p-5">Coming Soon</CardContent></Card></TabsContent></Tabs></div>
  </div>;
};

export default SalesDashboardPage;
