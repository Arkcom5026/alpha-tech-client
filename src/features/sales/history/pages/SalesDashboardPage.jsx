import React, { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSalesDashboardWorkflow } from '../dashboard';
import SalesWorkspaceButton from '../components/workspace/SalesWorkspaceButton';
import SalesWorkspaceHeader from '../components/workspace/SalesWorkspaceHeader';
import SalesWorkspaceSection from '../components/workspace/SalesWorkspaceSection';
import SalesMetricCard from '../components/workspace/SalesMetricCard';
import SalesStatusPanel from '../components/workspace/SalesStatusPanel';
import SalesEmptyState from '../components/workspace/SalesEmptyState';
import SalesErrorState from '../components/workspace/SalesErrorState';

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

const SalesDashboardPage = () => {
  const navigate = useNavigate();
  const { shopSlug } = useParams();
  const dashboard = useSalesDashboardWorkflow({ navigate, shopSlug });

  const formatNumber = (value) => Number(value || 0).toLocaleString('th-TH');
  const overview = dashboard.overview || {};
  const todayAmount = dashboard.loaded ? Number(overview.todaySalesAmount || 0) : null;
  const todayCount = dashboard.loaded ? Number(overview.todaySalesCount || 0) : null;
  const unpaidCount = dashboard.loaded ? Number(overview.unpaidCount || 0) : null;
  const monthAmount = dashboard.loaded ? Number(overview.monthSalesAmount || 0) : null;

  const health = useMemo(() => {
    const current = dashboard.health || {};
    return {
      tone: current.tone || 'neutral',
      title: current.title || 'ยังไม่มีข้อมูลสำหรับสรุปสถานะงานขาย',
      description: current.subtitle || current.description || 'โหลดข้อมูลล่าสุดเพื่อดูยอดขาย จำนวนบิล และรายการค้างชำระ',
      actionLabel: current.actionLabel || 'โหลดข้อมูล',
      action: current.action || dashboard.actions.loadOverview,
    };
  }, [dashboard.health, dashboard.actions.loadOverview]);

  return (
    <div className="min-h-screen space-y-5 bg-slate-50 p-4 text-slate-800 md:p-6">
      <SalesWorkspaceHeader
        title="ภาพรวมงานขาย"
        description="ติดตามยอดขาย จำนวนบิล และรายการค้างชำระของร้าน"
        meta={dashboard.lastLoadedAt ? `อัปเดตล่าสุด ${formatTimeAgo(dashboard.lastLoadedAt)}` : null}
        actions={(
          <>
            <SalesWorkspaceButton variant="primary" onClick={() => navigate(`/${shopSlug}/pos/sales/quick`)}>
              เปิดหน้าขายสินค้า
            </SalesWorkspaceButton>
            <SalesWorkspaceButton onClick={dashboard.actions.loadAll} disabled={dashboard.loading}>
              {dashboard.loading ? 'กำลังโหลดข้อมูล...' : 'โหลดข้อมูลทั้งหมด'}
            </SalesWorkspaceButton>
          </>
        )}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SalesMetricCard
          label="ยอดขายวันนี้"
          value={todayAmount === null ? '—' : `฿${formatNumber(todayAmount)}`}
          hint={dashboard.loaded ? overview.todaySalesAmountHint : 'โหลดข้อมูลเพื่อดูยอดล่าสุด'}
          tone={todayAmount > 0 ? 'good' : 'neutral'}
        />
        <SalesMetricCard
          label="จำนวนบิลวันนี้"
          value={todayCount === null ? '—' : `${formatNumber(todayCount)} บิล`}
          tone={todayCount > 0 ? 'info' : 'neutral'}
        />
        <SalesMetricCard
          label="รายการค้างชำระ"
          value={unpaidCount === null ? '—' : `${formatNumber(unpaidCount)} รายการ`}
          tone={unpaidCount > 0 ? 'warn' : 'neutral'}
        />
        <SalesMetricCard
          label="ยอดขายเดือนนี้"
          value={monthAmount === null ? '—' : `฿${formatNumber(monthAmount)}`}
          tone={monthAmount > 0 ? 'good' : 'neutral'}
        />
      </div>

      <SalesStatusPanel
        tone={health.tone}
        title={health.title}
        description={health.description}
        actionLabel={health.actionLabel}
        onAction={health.action}
      />

      <SalesWorkspaceSection
        title="สถานการณ์หน้าเคาน์เตอร์"
        description="สรุปยอดขายและรายการที่ต้องติดตามจากข้อมูลล่าสุด"
        action={dashboard.loaded ? (
          <SalesWorkspaceButton onClick={dashboard.actions.loadOverview} disabled={dashboard.loading}>
            {dashboard.loading ? 'กำลังรีเฟรช...' : 'รีเฟรชข้อมูล'}
          </SalesWorkspaceButton>
        ) : null}
      >
        <SalesErrorState message={dashboard.error} onRetry={dashboard.actions.loadOverview} retrying={dashboard.loading} />

        {!dashboard.loaded ? (
          <SalesEmptyState
            title="ยังไม่ได้โหลดข้อมูลภาพรวมการขาย"
            description="โหลดข้อมูลล่าสุดเพื่อดูยอดขาย จำนวนบิล และรายการค้างชำระ"
            onAction={dashboard.actions.loadOverview}
            loading={dashboard.loading}
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <SalesMetricCard label="ยอดขายวันนี้" value={`฿${formatNumber(overview.todaySalesAmount)}`} tone="good" />
            <SalesMetricCard label="จำนวนบิลวันนี้" value={`${formatNumber(overview.todaySalesCount)} บิล`} tone="info" />
            <SalesMetricCard label="รายการรอติดตามการชำระ" value={`${formatNumber(overview.unpaidCount)} รายการ`} tone={Number(overview.unpaidCount || 0) > 0 ? 'warn' : 'neutral'} />
          </div>
        )}
      </SalesWorkspaceSection>

      <SalesWorkspaceSection
        title="ข้อมูลวิเคราะห์การขาย"
        description="พื้นที่สำหรับข้อมูลแนวโน้มรายเดือน สินค้าขายดี และช่องทางการขาย"
      >
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-semibold text-slate-950">แนวโน้มยอดขายรายเดือน</p>
            <p className="mt-1 text-sm leading-6 text-slate-600">โครงสร้างหน้าจอพร้อมแล้ว แต่ยังไม่มีแหล่งข้อมูลรายเดือนเชื่อมต่อกับ Workflow ปัจจุบัน</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-semibold text-slate-950">สินค้าขายดีและช่องทางการขาย</p>
            <p className="mt-1 text-sm leading-6 text-slate-600">ระบบจะไม่สร้างอันดับหรือข้อมูลจำลอง จนกว่าจะมีข้อมูลจริงจาก API รองรับ</p>
          </div>
        </div>
      </SalesWorkspaceSection>
    </div>
  );
};

export { formatTimeAgo };
export default SalesDashboardPage;
