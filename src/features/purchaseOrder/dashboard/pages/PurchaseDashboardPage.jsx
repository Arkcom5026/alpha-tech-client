import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { usePurchaseOrderStore } from '../../store/purchaseOrderStore';
import PurchaseAgingSummary from '../components/workspace/PurchaseAgingSummary';
import PurchaseEmptyState from '../components/workspace/PurchaseEmptyState';
import PurchaseErrorState from '../components/workspace/PurchaseErrorState';
import PurchaseInsightPlaceholder from '../components/workspace/PurchaseInsightPlaceholder';
import PurchaseMetricCard from '../components/workspace/PurchaseMetricCard';
import PurchaseStatusPanel from '../components/workspace/PurchaseStatusPanel';
import PurchaseWorkspaceButton from '../components/workspace/PurchaseWorkspaceButton';
import PurchaseWorkspaceHeader from '../components/workspace/PurchaseWorkspaceHeader';
import PurchaseWorkspaceSection from '../components/workspace/PurchaseWorkspaceSection';

const formatTimeAgo = (value) => {
  if (!value) return '';
  const date = typeof value === 'string' || typeof value === 'number' ? new Date(value) : value;
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return '';

  const seconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
  if (seconds < 60) return `${seconds} วินาทีที่แล้ว`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} นาทีที่แล้ว`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ชั่วโมงที่แล้ว`;
  return `${Math.floor(hours / 24)} วันที่แล้ว`;
};

const PurchaseDashboardPage = () => {
  const navigate = useNavigate();
  const { shopSlug } = useParams();
  const fetchAllPurchaseOrdersAction = usePurchaseOrderStore((state) => state.fetchAllPurchaseOrdersAction);
  const storeError = usePurchaseOrderStore((state) => state.error);

  const [overviewUI, setOverviewUI] = useState({ loaded: false, loading: false, error: null, lastLoadedAt: null, data: null });
  const [monthlyUI, setMonthlyUI] = useState({ loaded: false, loading: false, error: null, lastLoadedAt: null, data: null });
  const [supplierUI, setSupplierUI] = useState({ loaded: false, loading: false, error: null, lastLoadedAt: null, data: null });
  const [activeInsight, setActiveInsight] = useState('monthly');

  useEffect(() => {
    if (!storeError) return;
    setOverviewUI((current) => ({ ...current, error: current.error || storeError }));
  }, [storeError]);

  const computeOverview = useCallback((list) => {
    const items = Array.isArray(list) ? list : [];
    const getStatus = (purchaseOrder) => String(purchaseOrder?.status || purchaseOrder?.purchaseOrderStatus || '').toUpperCase();
    const pickDate = (purchaseOrder) => {
      const value = purchaseOrder?.date || purchaseOrder?.poDate || purchaseOrder?.orderedAt || purchaseOrder?.createdAt || purchaseOrder?.updatedAt;
      const date = value ? new Date(value) : null;
      return date && !Number.isNaN(date.getTime()) ? date : null;
    };

    const now = new Date();
    const thisMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const previousMonthKey = `${previousMonth.getFullYear()}-${String(previousMonth.getMonth() + 1).padStart(2, '0')}`;
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - 7);
    const previousWeekStart = new Date(now);
    previousWeekStart.setDate(previousWeekStart.getDate() - 14);

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
      [previousMonthKey]: { openPO: 0, completed: 0 },
    };
    const weekly = { last7: { openPO: 0 }, previous7: { openPO: 0 } };

    for (const purchaseOrder of items) {
      const status = getStatus(purchaseOrder);
      const date = pickDate(purchaseOrder);

      if (status === 'CANCELLED') {
        counts.cancelled += 1;
        continue;
      }

      if (status === 'COMPLETED') {
        counts.completed += 1;
        if (date) {
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          if (monthKey === thisMonthKey) counts.completedThisMonth += 1;
          if (monthly[monthKey]) monthly[monthKey].completed += 1;
        }
        continue;
      }

      const isInProgress = ['PENDING', 'PARTIALLY_RECEIVED', 'RECEIVED', 'PAID'].includes(status);
      if (isInProgress) {
        counts.inProgress += 1;

        if (status === 'PENDING') {
          counts.pending += 1;
          counts.openPO += 1;
          if (date) {
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            if (monthly[monthKey]) monthly[monthKey].openPO += 1;
            if (date >= weekStart) weekly.last7.openPO += 1;
            else if (date >= previousWeekStart && date < weekStart) weekly.previous7.openPO += 1;
          }
        }

        if (status === 'PARTIALLY_RECEIVED' || status === 'RECEIVED') counts.awaitingReceipt += 1;
        if (status === 'PAID') counts.readyToClose += 1;

        if (date) {
          const ageDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
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

    const percentageChange = (current, previous) => {
      const currentValue = Number(current || 0);
      const previousValue = Number(previous || 0);
      if (previousValue <= 0) return currentValue === 0 ? '0%' : `+${currentValue}`;
      const value = Math.round(((currentValue - previousValue) / previousValue) * 100);
      if (value === 0) return '0%';
      return value > 0 ? `+${value}%` : `${value}%`;
    };

    counts.trend.openPO_month = percentageChange(monthly[thisMonthKey].openPO, monthly[previousMonthKey].openPO);
    counts.trend.completed_month = percentageChange(monthly[thisMonthKey].completed, monthly[previousMonthKey].completed);
    counts.trend.openPO_week = (() => {
      const current = Number(weekly.last7.openPO || 0);
      const previous = Number(weekly.previous7.openPO || 0);
      if (previous <= 0) return current === 0 ? '0' : `+${current}`;
      const value = current - previous;
      return value === 0 ? '0' : value > 0 ? `+${value}` : `${value}`;
    })();

    return counts;
  }, []);

  const safeLoadOverview = useCallback(async () => {
    if (!fetchAllPurchaseOrdersAction) {
      setOverviewUI((current) => ({ ...current, error: 'ยังไม่เชื่อมการโหลดรายการใบสั่งซื้อ' }));
      return;
    }

    try {
      setOverviewUI((current) => ({ ...current, loading: true, error: null }));
      const list = await fetchAllPurchaseOrdersAction({ search: '', status: 'all' });
      setOverviewUI({ loaded: true, loading: false, error: null, lastLoadedAt: new Date(), data: computeOverview(list) });
    } catch (error) {
      setOverviewUI((current) => ({ ...current, loading: false, error: error?.message || 'โหลดข้อมูลไม่สำเร็จ' }));
    }
  }, [fetchAllPurchaseOrdersAction, computeOverview]);

  const loadAllAction = useCallback(async () => {
    await safeLoadOverview();
    const loadedAt = new Date();
    setMonthlyUI((current) => ({ ...current, loaded: true, lastLoadedAt: current.lastLoadedAt || loadedAt }));
    setSupplierUI((current) => ({ ...current, loaded: true, lastLoadedAt: current.lastLoadedAt || loadedAt }));
  }, [safeLoadOverview]);

  const lastUpdatedAll = useMemo(() => {
    const dates = [overviewUI.lastLoadedAt, monthlyUI.lastLoadedAt, supplierUI.lastLoadedAt]
      .filter(Boolean)
      .map((value) => (typeof value === 'string' || typeof value === 'number' ? new Date(value) : value))
      .filter((date) => date instanceof Date && !Number.isNaN(date.getTime()));
    if (!dates.length) return null;
    return new Date(Math.max(...dates.map((date) => date.getTime())));
  }, [overviewUI.lastLoadedAt, monthlyUI.lastLoadedAt, supplierUI.lastLoadedAt]);

  const health = useMemo(() => {
    if (!overviewUI.loaded || !overviewUI.data) {
      return {
        tone: 'neutral',
        title: 'ยังไม่มีข้อมูลสำหรับสรุปสถานะงานจัดซื้อ',
        description: 'โหลดข้อมูลเพื่อดูใบสั่งซื้อค้าง งานรอตรวจรับ และรายการที่พร้อมปิดงาน',
        actionLabel: 'โหลดภาพรวม',
        action: safeLoadOverview,
      };
    }

    const data = overviewUI.data;
    const inProgress = Number(data.inProgress || 0);
    const oldOver15 = Number(data.oldOver15 || 0);
    const oldOver7 = Number(data.oldOver7 || 0);

    if (oldOver15 > 0) {
      return {
        tone: 'critical',
        title: `มีใบสั่งซื้อค้างเกิน 15 วัน ${oldOver15} รายการ`,
        description: `มีงานอยู่ระหว่างดำเนินการรวม ${inProgress} ใบ ควรติดตามผู้ขายและตรวจสถานะการรับสินค้า`,
        actionLabel: 'ดูงานค้าง',
        action: () => navigate(`/${shopSlug}/pos/purchases/list?status=pending,partially_received,received,paid`),
      };
    }

    if (oldOver7 > 0) {
      return {
        tone: 'warn',
        title: `มีใบสั่งซื้อค้างเกิน 7 วัน ${oldOver7} รายการ`,
        description: `มีงานอยู่ระหว่างดำเนินการรวม ${inProgress} ใบ ควรตรวจสอบก่อนเข้าสู่รอบบัญชีถัดไป`,
        actionLabel: 'ดูงานค้าง',
        action: () => navigate(`/${shopSlug}/pos/purchases/list?status=pending,partially_received,received,paid`),
      };
    }

    if (inProgress > 0) {
      return {
        tone: 'warn',
        title: `มีงานจัดซื้ออยู่ระหว่างดำเนินการ ${inProgress} รายการ`,
        description: 'ตรวจสถานะการส่งของ การตรวจรับ และการปิดใบสั่งซื้อให้ครบถ้วน',
        actionLabel: 'ดูรายการ',
        action: () => navigate(`/${shopSlug}/pos/purchases/list?status=pending,partially_received,received,paid`),
      };
    }

    return {
      tone: 'good',
      title: 'ไม่พบใบสั่งซื้อที่ค้างดำเนินการ',
      description: `มีเอกสารจัดซื้อในประวัติทั้งหมด ${Number(data.total || 0)} รายการ`,
      actionLabel: 'ดูประวัติ',
      action: () => navigate(`/${shopSlug}/pos/purchases/list`),
    };
  }, [overviewUI.loaded, overviewUI.data, safeLoadOverview, navigate, shopSlug]);

  const data = overviewUI.data;
  const openPurchaseOrdersPath = `/${shopSlug}/pos/purchases/list?status=pending,partially_received,received,paid`;

  return (
    <div className="min-h-screen bg-slate-50 p-4 text-slate-800 md:p-6">
      <div className="mx-auto max-w-[1440px] space-y-5">
        <PurchaseWorkspaceHeader
          title="ภาพรวมงานจัดซื้อ"
          description="ติดตามใบสั่งซื้อ การตรวจรับสินค้า งานค้าง และสถานะการปิดเอกสาร"
          meta={lastUpdatedAll ? `อัปเดตล่าสุด ${formatTimeAgo(lastUpdatedAll)}` : null}
          actions={(
            <>
              <PurchaseWorkspaceButton variant="primary" onClick={() => navigate(`/${shopSlug}/pos/purchases/create`)}>สร้างใบสั่งซื้อ</PurchaseWorkspaceButton>
              <PurchaseWorkspaceButton onClick={() => navigate(openPurchaseOrdersPath)}>ดูงานค้าง</PurchaseWorkspaceButton>
              <PurchaseWorkspaceButton onClick={loadAllAction} disabled={overviewUI.loading}>
                {overviewUI.loading ? 'กำลังโหลด...' : 'โหลดข้อมูลทั้งหมด'}
              </PurchaseWorkspaceButton>
            </>
          )}
        />

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
          <div className="space-y-5 xl:col-span-8">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <PurchaseMetricCard
                label="ใบสั่งซื้อที่รอส่งของ"
                value={data ? `${data.openPO} ใบ` : '—'}
                tone={data?.openPO > 0 ? 'warn' : 'neutral'}
                hint={data ? `เทียบ 7 วันก่อน ${data.trend.openPO_week}` : null}
                onClick={() => navigate(`/${shopSlug}/pos/purchases/list?status=pending`)}
              />
              <PurchaseMetricCard
                label="รอตรวจรับสินค้า"
                value={data ? `${data.awaitingReceipt} ใบ` : '—'}
                tone={data?.awaitingReceipt > 0 ? 'warn' : 'neutral'}
                hint="รับบางส่วนหรือรับสินค้าแล้ว"
                onClick={() => navigate(`/${shopSlug}/pos/purchases/list?status=partially_received,received`)}
              />
              <PurchaseMetricCard
                label="ชำระแล้วรอปิดงาน"
                value={data ? `${data.readyToClose} ใบ` : '—'}
                tone={data?.readyToClose > 0 ? 'good' : 'neutral'}
                hint="เอกสารสถานะชำระแล้ว"
                onClick={() => navigate(`/${shopSlug}/pos/purchases/list?status=paid`)}
              />
              <PurchaseMetricCard
                label="ปิดงานเดือนนี้"
                value={data ? `${data.completedThisMonth} ใบ` : '—'}
                tone={data?.completedThisMonth > 0 ? 'good' : 'neutral'}
                hint={data ? `เทียบเดือนก่อน ${data.trend.completed_month}` : null}
                onClick={() => navigate(`/${shopSlug}/pos/purchases/list?status=completed`)}
              />
            </div>

            <PurchaseStatusPanel
              tone={health.tone}
              title={health.title}
              description={health.description}
              actionLabel={health.actionLabel}
              onAction={health.action}
            />
          </div>

          <div className="xl:col-span-4">
            <PurchaseAgingSummary buckets={data?.aging} onClick={() => navigate(openPurchaseOrdersPath)} />
          </div>
        </div>

        <PurchaseWorkspaceSection
          title="สถานะเอกสารจัดซื้อ"
          description="ดูจำนวนเอกสารในแต่ละขั้นตอนของกระบวนการจัดซื้อ"
          action={overviewUI.loaded ? (
            <PurchaseWorkspaceButton onClick={safeLoadOverview} disabled={overviewUI.loading}>
              {overviewUI.loading ? 'กำลังรีเฟรช...' : 'รีเฟรชข้อมูล'}
            </PurchaseWorkspaceButton>
          ) : null}
        >
          <PurchaseErrorState message={overviewUI.error} onRetry={safeLoadOverview} retrying={overviewUI.loading} />

          {!overviewUI.loaded && (
            <PurchaseEmptyState
              title="ยังไม่ได้โหลดข้อมูลเอกสารจัดซื้อ"
              description="โหลดข้อมูลเพื่อดูใบสั่งซื้อที่รอส่งของ รอตรวจรับ ชำระแล้ว และปิดงาน"
              onAction={safeLoadOverview}
              loading={overviewUI.loading}
            />
          )}

          {overviewUI.loaded && data && (
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
              <PurchaseMetricCard label="รอส่งของ" value={`${data.openPO} ใบ`} tone="warn" onClick={() => navigate(`/${shopSlug}/pos/purchases/list?status=pending`)} />
              <PurchaseMetricCard label="รอตรวจรับ" value={`${data.awaitingReceipt} ใบ`} tone="info" onClick={() => navigate(`/${shopSlug}/pos/purchases/list?status=partially_received,received`)} />
              <PurchaseMetricCard label="ชำระแล้ว" value={`${data.readyToClose} ใบ`} tone="good" onClick={() => navigate(`/${shopSlug}/pos/purchases/list?status=paid`)} />
              <PurchaseMetricCard label="เสร็จสมบูรณ์" value={`${data.completed} ใบ`} tone="good" onClick={() => navigate(`/${shopSlug}/pos/purchases/list?status=completed`)} />
              <PurchaseMetricCard label="ยกเลิก" value={`${data.cancelled} ใบ`} tone="critical" onClick={() => navigate(`/${shopSlug}/pos/purchases/list?status=cancelled`)} />
            </div>
          )}
        </PurchaseWorkspaceSection>

        <PurchaseWorkspaceSection
          title="ข้อมูลวิเคราะห์งานจัดซื้อ"
          description="พื้นที่สำหรับวิเคราะห์แนวโน้มยอดจัดซื้อและการกระจายคำสั่งซื้อระหว่างผู้ขาย"
          action={(
            <div className="flex rounded-xl bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => setActiveInsight('monthly')}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${activeInsight === 'monthly' ? 'bg-white text-teal-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
              >
                แนวโน้มรายเดือน
              </button>
              <button
                type="button"
                onClick={() => setActiveInsight('suppliers')}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${activeInsight === 'suppliers' ? 'bg-white text-teal-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
              >
                ผู้ขายหลัก
              </button>
            </div>
          )}
        >
          {activeInsight === 'monthly' && (
            !monthlyUI.loaded ? (
              <PurchaseEmptyState
                title="ยังไม่มีข้อมูลแนวโน้มยอดจัดซื้อรายเดือน"
                description="ส่วนนี้ยังไม่มีข้อมูลสรุปจาก API จึงแสดงเป็นพื้นที่เตรียมพร้อมโดยไม่สร้างข้อมูลจำลอง"
                actionLabel="เปิดพื้นที่วิเคราะห์"
                onAction={() => setMonthlyUI((current) => ({ ...current, loaded: true, lastLoadedAt: new Date() }))}
                loading={monthlyUI.loading}
              />
            ) : (
              <PurchaseInsightPlaceholder
                title="แนวโน้มยอดจัดซื้อรายเดือน"
                description="โครงสร้างหน้าจอพร้อมแล้ว แต่แหล่งข้อมูลสำหรับยอดสุทธิรายเดือนและช่วงเวลาเปรียบเทียบยังไม่ได้เชื่อมต่อในหน้าปัจจุบัน"
              />
            )
          )}

          {activeInsight === 'suppliers' && (
            !supplierUI.loaded ? (
              <PurchaseEmptyState
                title="ยังไม่มีข้อมูลสัดส่วนการจัดซื้อตามผู้ขาย"
                description="ส่วนนี้ยังไม่มีข้อมูลสรุปจาก API จึงไม่แสดงอันดับหรือมูลค่าที่คาดเดาขึ้นเอง"
                actionLabel="เปิดพื้นที่วิเคราะห์"
                onAction={() => setSupplierUI((current) => ({ ...current, loaded: true, lastLoadedAt: new Date() }))}
                loading={supplierUI.loading}
              />
            ) : (
              <PurchaseInsightPlaceholder
                title="สัดส่วนการจัดซื้อตามผู้ขาย"
                description="โครงสร้างหน้าจอพร้อมแล้ว แต่ข้อมูลยอดรวมและสัดส่วนรายผู้ขายยังไม่ได้เชื่อมต่อในหน้าปัจจุบัน"
              />
            )
          )}
        </PurchaseWorkspaceSection>
      </div>
    </div>
  );
};

export { formatTimeAgo };
export default PurchaseDashboardPage;
