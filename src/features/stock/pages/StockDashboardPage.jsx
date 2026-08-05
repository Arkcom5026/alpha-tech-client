import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useStockStore from '@/features/stock/store/stockStore';
import StockValuationSummary from '@/features/stock/components/StockValuationSummary';

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

const Button = ({ children, onClick, disabled, variant = 'primary' }) => {
  const variants = {
    primary: 'border-teal-700 bg-teal-700 text-white hover:border-teal-800 hover:bg-teal-800',
    secondary: 'border-slate-300 bg-white text-slate-800 hover:border-teal-300 hover:bg-teal-50 hover:text-teal-900',
    danger: 'border-rose-700 bg-rose-700 text-white hover:bg-rose-800',
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${variants[variant] || variants.primary}`}
    >
      {children}
    </button>
  );
};

const Section = ({ title, subtitle, right, children }) => (
  <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
    <header className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
        {subtitle && <p className="mt-1 text-sm leading-6 text-slate-500">{subtitle}</p>}
      </div>
      {right}
    </header>
    {children}
  </section>
);

const EmptyState = ({ title, description, onClick, loading = false }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={loading}
    className="w-full rounded-2xl border border-dashed border-teal-200 bg-teal-50/60 p-6 text-left transition-colors hover:border-teal-300 hover:bg-teal-50 disabled:cursor-wait disabled:opacity-60"
  >
    <p className="text-sm font-semibold text-slate-950">{title}</p>
    <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p>
    <span className="mt-4 inline-flex rounded-lg border border-teal-200 bg-white px-3 py-1.5 text-sm font-semibold text-teal-800">
      {loading ? 'กำลังโหลดข้อมูล...' : 'โหลดข้อมูลส่วนนี้'}
    </span>
  </button>
);

const MetricCard = ({ label, value, tone = 'neutral', onClick, hint }) => {
  const tones = {
    emerald: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    blue: 'border-blue-200 bg-blue-50 text-blue-800',
    rose: 'border-rose-200 bg-rose-50 text-rose-800',
    amber: 'border-amber-200 bg-amber-50 text-amber-900',
    neutral: 'border-slate-200 bg-slate-50 text-slate-700',
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-sm ${tones[tone] || tones.neutral}`}
    >
      <p className="text-xs font-semibold">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-950">{value}</p>
      {hint && <p className="mt-2 text-xs text-slate-600">{hint}</p>}
    </button>
  );
};

const ErrorStrip = ({ message, onRetry, retrying = false }) => {
  if (!message) return null;
  return (
    <div className="mb-4 flex flex-col gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-semibold text-rose-900">โหลดข้อมูลไม่สำเร็จ</p>
        <p className="mt-1 text-sm text-rose-700">{String(message)}</p>
      </div>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry} disabled={retrying}>
          {retrying ? 'กำลังลองใหม่...' : 'ลองใหม่'}
        </Button>
      )}
    </div>
  );
};

const MiniChip = ({ label, value, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 transition hover:border-teal-300 hover:bg-teal-50"
  >
    <span>{label}</span>
    <span className="font-semibold text-teal-800">{value}</span>
  </button>
);

const HealthPanel = ({ tone = 'neutral', title, subtitle }) => {
  const tones = {
    critical: 'border-rose-200 bg-rose-50',
    warn: 'border-amber-200 bg-amber-50',
    neutral: 'border-slate-200 bg-white',
  };
  const dots = {
    critical: 'bg-rose-500',
    warn: 'bg-amber-500',
    neutral: 'bg-slate-400',
  };

  return (
    <div className={`rounded-2xl border p-5 ${tones[tone] || tones.neutral}`}>
      <div className="flex items-start gap-3">
        <span className={`mt-1.5 h-2.5 w-2.5 rounded-full ${dots[tone] || dots.neutral}`} />
        <div>
          <p className="text-sm font-semibold text-slate-950">{title}</p>
          {subtitle && <p className="mt-1 text-sm leading-6 text-slate-600">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
};

const ActionItem = ({ title, description, tone = 'neutral', ctaLabel = 'เปิดดู', onClick, disabled = false }) => {
  const tones = {
    critical: 'border-rose-200 bg-rose-50',
    warn: 'border-amber-200 bg-amber-50',
    neutral: 'border-slate-200 bg-white',
  };

  return (
    <div className={`flex flex-col gap-4 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between ${tones[tone] || tones.neutral}`}>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-slate-950">{title}</p>
        {description && <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p>}
      </div>
      <Button variant="secondary" onClick={onClick} disabled={disabled}>
        {ctaLabel}
        <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  );
};

const StockDashboardPage = () => {
  const navigate = useNavigate();
  const { shopSlug } = useParams();

  const loadOverviewAction = useStockStore((state) => state?.loadDashboardOverviewAction);
  const loadAuditInProgressAction = useStockStore((state) => state?.loadDashboardAuditInProgressAction);
  const loadRiskAction = useStockStore((state) => state?.loadDashboardRiskAction);

  const overviewState = useStockStore((state) => state?.dashboardOverview);
  const auditState = useStockStore((state) => state?.dashboardAuditInProgress);
  const riskState = useStockStore((state) => state?.dashboardRisk);

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

  useEffect(() => {
    if (!overviewState) return;
    setOverviewUI((current) => ({
      ...current,
      loaded: Boolean(overviewState?.data),
      data: overviewState?.data ?? null,
      lastLoadedAt: overviewState?.lastLoadedAt ?? current.lastLoadedAt,
      error: overviewState?.error ?? current.error,
      loading: Boolean(overviewState?.loading),
    }));
  }, [overviewState]);

  useEffect(() => {
    if (!auditState) return;
    setAuditUI((current) => ({
      ...current,
      loaded: Boolean(auditState?.data),
      data: auditState?.data ?? null,
      lastLoadedAt: auditState?.lastLoadedAt ?? current.lastLoadedAt,
      error: auditState?.error ?? current.error,
      loading: Boolean(auditState?.loading),
    }));
  }, [auditState]);

  useEffect(() => {
    if (!riskState) return;
    setRiskUI((current) => ({
      ...current,
      loaded: Boolean(riskState?.data),
      data: riskState?.data ?? null,
      lastLoadedAt: riskState?.lastLoadedAt ?? current.lastLoadedAt,
      error: riskState?.error ?? current.error,
      loading: Boolean(riskState?.loading),
    }));
  }, [riskState]);

  const safeLoad = useCallback(async (blockKey) => {
    const setters = { overview: setOverviewUI, audit: setAuditUI, risk: setRiskUI };
    const actions = { overview: loadOverviewAction, audit: loadAuditInProgressAction, risk: loadRiskAction };
    const storeKeys = { overview: 'dashboardOverview', audit: 'dashboardAuditInProgress', risk: 'dashboardRisk' };

    const setState = setters[blockKey];
    const action = actions[blockKey];
    if (!setState) return;

    if (!action) {
      setState((current) => ({ ...current, loaded: false, loading: false, error: 'ยังไม่เชื่อมการโหลดข้อมูลส่วนนี้' }));
      return;
    }

    try {
      setState((current) => ({ ...current, loading: true, error: null }));
      const result = await action();
      if (result?.ok === false) throw new Error(result.error || 'โหลดข้อมูลไม่สำเร็จ');

      const latest = useStockStore?.getState ? useStockStore.getState() : null;
      const latestBlock = latest?.[storeKeys[blockKey]];
      if (latestBlock?.error) throw new Error(latestBlock.error);

      setState((current) => ({
        ...current,
        loaded: true,
        loading: false,
        error: null,
        lastLoadedAt: new Date(),
      }));
    } catch (error) {
      setState((current) => ({ ...current, loading: false, error: error?.message || 'โหลดข้อมูลไม่สำเร็จ' }));
    }
  }, [loadOverviewAction, loadAuditInProgressAction, loadRiskAction]);

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

  const riskTotal = useMemo(() => {
    if (!riskCards) return null;
    return riskCards.lost + riskCards.damaged + riskCards.used + riskCards.returned;
  }, [riskCards]);

  const lastUpdatedAll = useMemo(() => {
    const dates = [overviewUI.lastLoadedAt, auditUI.lastLoadedAt, riskUI.lastLoadedAt]
      .filter(Boolean)
      .map((value) => (typeof value === 'string' || typeof value === 'number' ? new Date(value) : value))
      .filter((date) => date instanceof Date && !Number.isNaN(date.getTime()));
    if (!dates.length) return null;
    return new Date(Math.max(...dates.map((date) => date.getTime())));
  }, [overviewUI.lastLoadedAt, auditUI.lastLoadedAt, riskUI.lastLoadedAt]);

  const health = useMemo(() => {
    if (!overviewCards && !riskCards && !auditUI.loaded) {
      return {
        tone: 'neutral',
        title: 'ยังไม่มีข้อมูลสำหรับสรุปสถานะสต๊อก',
        subtitle: 'โหลดข้อมูลทั้งหมดเพื่อดูภาพรวม งานตรวจนับ และความเสี่ยงในครั้งเดียว',
      };
    }

    const missing = overviewCards?.missingPendingReview ?? 0;
    const claimed = overviewCards?.claimed ?? 0;
    const inStock = overviewCards?.inStock ?? null;
    const hasAudit = Boolean(auditData);
    const totalRisk = typeof riskTotal === 'number' ? riskTotal : 0;

    if (missing >= 5 || totalRisk >= 5 || (inStock === 0 && (missing > 0 || totalRisk > 0))) {
      return {
        tone: 'critical',
        title: 'มีรายการสต๊อกที่ต้องเร่งตรวจสอบ',
        subtitle: [missing > 0 && `รอตรวจสอบ ${missing} รายการ`, totalRisk > 0 && `ความเสี่ยง ${totalRisk} รายการ`, inStock === 0 && 'ไม่มีสินค้าพร้อมขาย', hasAudit && 'มีรอบตรวจนับค้าง'].filter(Boolean).join(' • '),
      };
    }

    if (missing > 0 || totalRisk > 0 || hasAudit || claimed >= 10) {
      return {
        tone: 'warn',
        title: 'มีงานสต๊อกที่ควรติดตาม',
        subtitle: [missing > 0 && `รอตรวจสอบ ${missing} รายการ`, totalRisk > 0 && `ความเสี่ยง ${totalRisk} รายการ`, hasAudit && 'มีรอบตรวจนับค้าง', claimed >= 10 && `สินค้าถูกจอง ${claimed} รายการ`].filter(Boolean).join(' • '),
      };
    }

    return null;
  }, [overviewCards, riskCards, riskTotal, auditData, auditUI.loaded]);

  const loadAllAction = useCallback(async () => {
    await safeLoad('overview');
    await safeLoad('audit');
    await safeLoad('risk');
  }, [safeLoad]);

  const immediateActions = useMemo(() => {
    const items = [];

    if (!overviewUI.loaded) items.push({ title: 'โหลดภาพรวมสต๊อก', description: 'ตรวจจำนวนพร้อมขาย สินค้าถูกจอง ยอดขายวันนี้ และรายการรอตรวจสอบ', ctaLabel: overviewUI.loading ? 'กำลังโหลด...' : 'โหลด', onClick: () => safeLoad('overview'), disabled: overviewUI.loading });
    if (!auditUI.loaded) items.push({ title: 'ตรวจรอบตรวจนับที่ยังไม่เสร็จ', description: 'ค้นหารอบตรวจนับที่สามารถกลับไปทำต่อได้', ctaLabel: auditUI.loading ? 'กำลังโหลด...' : 'โหลด', onClick: () => safeLoad('audit'), disabled: auditUI.loading });
    if (!riskUI.loaded) items.push({ title: 'โหลดสถานะความเสี่ยง', description: 'ตรวจสินค้าสูญหาย ชำรุด ใช้ภายใน และส่งคืน', ctaLabel: riskUI.loading ? 'กำลังโหลด...' : 'โหลด', onClick: () => safeLoad('risk'), disabled: riskUI.loading });

    if ((overviewCards?.missingPendingReview || 0) > 0) items.push({ tone: 'critical', title: `มีรายการรอตรวจสอบ ${overviewCards.missingPendingReview} รายการ`, description: 'ตรวจและแก้สถานะให้ชัดเจนเพื่อลดความคลาดเคลื่อนของสต๊อก', ctaLabel: 'ตรวจสอบ', onClick: () => navigate(`/${shopSlug}/pos/stock/items?status=MISSING_PENDING_REVIEW`) });
    if ((overviewCards?.claimed || 0) > 0) items.push({ tone: 'warn', title: `สินค้าถูกจอง ${overviewCards.claimed} รายการ`, description: 'ตรวจสอบรายการจองค้างและสถานะการขาย', ctaLabel: 'ดูรายการ', onClick: () => navigate(`/${shopSlug}/pos/stock/items?status=CLAIMED`) });
    if ((overviewCards?.inStock || 0) <= 0 && overviewCards) items.push({ tone: 'warn', title: 'ไม่มีสินค้าพร้อมขาย', description: 'ตรวจสอบการรับเข้าและสถานะสินค้าที่อาจค้างอยู่', ctaLabel: 'ดูทั้งหมด', onClick: () => navigate(`/${shopSlug}/pos/stock/items`) });
    if (auditData) items.push({ tone: 'warn', title: 'มีรอบตรวจนับที่กำลังทำอยู่', description: 'กลับไปดำเนินการต่อให้รอบตรวจนับเสร็จสมบูรณ์', ctaLabel: 'ทำต่อ', onClick: () => navigate(auditData.mode === 'FULL' ? `/${shopSlug}/pos/stock/stock-audit` : `/${shopSlug}/pos/stock/ready-audit`) });
    if (riskCards && riskTotal > 0) items.push({ tone: riskTotal >= 5 ? 'critical' : 'warn', title: `พบความเสี่ยง ${riskTotal} รายการ`, description: 'ตรวจสินค้าสูญหาย ชำรุด ใช้ภายใน และส่งคืนให้ชัดเจน', ctaLabel: 'ดูความเสี่ยง', onClick: () => navigate(`/${shopSlug}/pos/stock/items?status=LOST`) });

    if (!items.length) items.push({ title: 'ไม่มีงานเร่งด่วนในสต๊อก', description: 'ข้อมูลปัจจุบันไม่พบรายการที่ต้องดำเนินการทันที', ctaLabel: 'รีเฟรช', onClick: loadAllAction });
    return items.slice(0, 5);
  }, [overviewUI.loaded, overviewUI.loading, auditUI.loaded, auditUI.loading, riskUI.loaded, riskUI.loading, overviewCards, auditData, riskCards, riskTotal, navigate, safeLoad, loadAllAction, shopSlug]);

  const anyLoading = overviewUI.loading || auditUI.loading || riskUI.loading;

  return (
    <div className="min-h-screen bg-slate-50 p-4 text-slate-800 md:p-6">
      <div className="mx-auto max-w-[1440px] space-y-5">
        <section className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between md:p-6">
          <div>
            <h1 className="text-2xl font-semibold text-slate-950">ภาพรวมสต๊อก</h1>
            <p className="mt-1 text-sm text-slate-500">ตรวจสินค้าพร้อมขาย งานตรวจนับ และรายการที่ต้องติดตาม</p>
            {lastUpdatedAll && <p className="mt-2 text-xs text-slate-500">อัปเดตล่าสุด {formatTimeAgo(lastUpdatedAll)}</p>}
          </div>
          <Button onClick={loadAllAction} disabled={anyLoading}>
            {anyLoading ? 'กำลังโหลดข้อมูล...' : 'โหลดข้อมูลทั้งหมด'}
          </Button>
        </section>

        {health && <HealthPanel tone={health.tone} title={health.title} subtitle={health.subtitle} />}

        <Section title="งานที่ควรดำเนินการ" subtitle="รายการสำคัญที่ช่วยให้ข้อมูลสต๊อกถูกต้องและพร้อมใช้งาน">
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            {immediateActions.map((item, index) => (
              <ActionItem
                key={`${item.title}-${index}`}
                tone={item.tone}
                title={item.title}
                description={item.description}
                ctaLabel={item.ctaLabel}
                onClick={item.onClick}
                disabled={item.disabled}
              />
            ))}
          </div>
        </Section>

        <Section
          title="จำนวนสินค้าและสถานะพร้อมขาย"
          subtitle="ดูจำนวนสินค้าคงคลัง สินค้าถูกจอง และรายการที่ต้องตรวจสอบ"
          right={overviewUI.loaded ? (
            <Button variant="secondary" onClick={() => safeLoad('overview')} disabled={overviewUI.loading}>
              {overviewUI.loading ? 'กำลังรีเฟรช...' : 'รีเฟรชข้อมูล'}
            </Button>
          ) : null}
        >
          <ErrorStrip message={overviewUI.error} onRetry={() => safeLoad('overview')} retrying={overviewUI.loading} />
          {!overviewUI.loaded && (
            <EmptyState
              title="ยังไม่ได้โหลดข้อมูลภาพรวมสต๊อก"
              description="โหลดข้อมูลเพื่อดูจำนวนสินค้าพร้อมขาย สินค้าถูกจอง และรายการรอตรวจสอบ"
              loading={overviewUI.loading}
              onClick={() => safeLoad('overview')}
            />
          )}
          {overviewUI.loaded && overviewUI.data && <StockValuationSummary data={overviewUI.data} />}
          {overviewUI.loaded && overviewCards && (
            <div className="mt-5 space-y-4">
              {(overviewExtras?.hasStructuredTotal || overviewExtras?.hasSimpleNetAvailable) && (
                <div className="flex flex-wrap gap-2">
                  {overviewExtras?.hasSimpleNetAvailable && <MiniChip label="สินค้า Simple พร้อมขาย" value={overviewExtras.simpleNetAvailable} onClick={() => navigate(`/${shopSlug}/pos/stock/simple`)} />}
                  {overviewExtras?.hasStructuredTotal && <MiniChip label="สินค้าที่ติดตามเป็นรายชิ้น" value={overviewExtras.structuredTotal} onClick={() => navigate(`/${shopSlug}/pos/stock/items`)} />}
                </div>
              )}
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <MetricCard label="พร้อมขาย" value={overviewCards.inStock} tone="emerald" hint="ดูสินค้าพร้อมขาย" onClick={() => navigate(`/${shopSlug}/pos/stock/items?status=IN_STOCK`)} />
                <MetricCard label="ถูกจอง" value={overviewCards.claimed} tone="blue" hint="ดูรายการที่ถูกจอง" onClick={() => navigate(`/${shopSlug}/pos/stock/items?status=CLAIMED`)} />
                <MetricCard label="ขายวันนี้" value={overviewCards.soldToday} hint="ดูประวัติการขายวันนี้" onClick={() => navigate(`/${shopSlug}/pos/stock/items?status=SOLD&date=today`)} />
                <MetricCard label="รอตรวจสอบ" value={overviewCards.missingPendingReview} tone="amber" hint="ดูรายการรอตรวจสอบ" onClick={() => navigate(`/${shopSlug}/pos/stock/items?status=MISSING_PENDING_REVIEW`)} />
              </div>
            </div>
          )}
        </Section>

        <Section
          title="รอบตรวจนับที่กำลังดำเนินการ"
          subtitle="ตรวจสถานะและกลับไปทำรอบตรวจนับที่ยังไม่เสร็จ"
          right={auditUI.loaded ? (
            <Button variant="secondary" onClick={() => safeLoad('audit')} disabled={auditUI.loading}>
              {auditUI.loading ? 'กำลังรีเฟรช...' : 'รีเฟรชสถานะ'}
            </Button>
          ) : null}
        >
          <ErrorStrip message={auditUI.error} onRetry={() => safeLoad('audit')} retrying={auditUI.loading} />
          {!auditUI.loaded && (
            <EmptyState
              title="ยังไม่ได้ตรวจรอบตรวจนับค้าง"
              description="โหลดข้อมูลเพื่อดูว่ามีรอบตรวจนับที่สามารถกลับไปทำต่อได้หรือไม่"
              loading={auditUI.loading}
              onClick={() => safeLoad('audit')}
            />
          )}
          {auditUI.loaded && (
            !auditData ? (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-800">ไม่พบรอบตรวจนับที่ค้างอยู่</div>
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-950">{auditData.mode === 'FULL' ? 'ตรวจนับสินค้าทั้งหมด' : 'ตรวจนับสินค้าพร้อมขาย'}</p>
                    <p className="mt-1 text-sm text-slate-600">เริ่มเมื่อ {auditData.startedAt ? new Date(auditData.startedAt).toLocaleString('th-TH') : '-'}</p>
                    {auditData?.employee?.name && <p className="mt-1 text-sm text-slate-600">ผู้รับผิดชอบ: {auditData.employee.name}</p>}
                  </div>
                  <Button onClick={() => navigate(auditData.mode === 'FULL' ? `/${shopSlug}/pos/stock/stock-audit` : `/${shopSlug}/pos/stock/ready-audit`)}>ทำต่อ</Button>
                </div>
                <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <MetricCard label="จำนวนเป้าหมาย" value={`${auditData.expectedCount ?? 0} ชิ้น`} />
                  <MetricCard label="ตรวจแล้ว" value={`${auditData.scannedCount ?? 0} ชิ้น`} tone="blue" />
                  <MetricCard label="ความคืบหน้า" value={auditData.expectedCount > 0 ? `${Math.round((auditData.scannedCount / auditData.expectedCount) * 100)}%` : '0%'} tone="emerald" />
                </div>
              </div>
            )
          )}
        </Section>

        <Section
          title="สินค้าเสี่ยงและสินค้าชำรุด"
          subtitle="ติดตามสินค้าสูญหาย ชำรุด ใช้ภายใน และส่งคืน"
          right={riskUI.loaded ? (
            <Button variant="secondary" onClick={() => safeLoad('risk')} disabled={riskUI.loading}>
              {riskUI.loading ? 'กำลังรีเฟรช...' : 'รีเฟรชข้อมูล'}
            </Button>
          ) : null}
        >
          <ErrorStrip message={riskUI.error} onRetry={() => safeLoad('risk')} retrying={riskUI.loading} />
          {!riskUI.loaded && (
            <EmptyState
              title="ยังไม่ได้โหลดข้อมูลความเสี่ยง"
              description="โหลดข้อมูลเพื่อดูสินค้าสูญหาย ชำรุด ใช้ภายใน และส่งคืน"
              loading={riskUI.loading}
              onClick={() => safeLoad('risk')}
            />
          )}
          {riskUI.loaded && riskCards && (
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <MetricCard label="สูญหาย" value={riskCards.lost} tone="rose" onClick={() => navigate(`/${shopSlug}/pos/stock/items?status=LOST`)} />
              <MetricCard label="ชำรุด" value={riskCards.damaged} tone="amber" onClick={() => navigate(`/${shopSlug}/pos/stock/items?status=DAMAGED`)} />
              <MetricCard label="ใช้ภายใน" value={riskCards.used} onClick={() => navigate(`/${shopSlug}/pos/stock/items?status=USED`)} />
              <MetricCard label="ส่งคืน" value={riskCards.returned} tone="blue" onClick={() => navigate(`/${shopSlug}/pos/stock/items?status=RETURNED`)} />
            </div>
          )}
          {riskUI.loaded && !riskCards && <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-800">ไม่พบสินค้าที่มีสถานะเสี่ยงหรือชำรุด</div>}
        </Section>
      </div>
    </div>
  );
};

export default StockDashboardPage;
