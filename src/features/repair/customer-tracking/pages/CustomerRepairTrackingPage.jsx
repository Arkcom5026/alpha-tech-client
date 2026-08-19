import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import TrackingTimeline from '../components/TrackingTimeline';
import { getPublicRepairTracking } from '../api/repairTrackingPublicApi';
import EstimateDecisionCard from '../components/EstimateDecisionCard';
import PickupConfirmationCard from '../components/PickupConfirmationCard';

const money = (value) =>
  new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 2,
  }).format(Number(value || 0));

const formatDateTime = (value) => {
  if (!value) return '-';
  return new Intl.DateTimeFormat('th-TH', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
};

const getCustomerFacingStatus = (status = {}, handover = null) => {
  if (handover?.status === 'DELIVERED') {
    return {
      ...status,
      code: 'DELIVERED',
      label: 'ส่งมอบอุปกรณ์เรียบร้อยแล้ว',
      description: 'ร้านส่งมอบอุปกรณ์คืนให้ผู้รับเรียบร้อยแล้ว',
      stage: 4,
    };
  }

  if (handover?.customerConfirmedAt) {
    return {
      ...status,
      code: 'PICKUP_CONFIRMED',
      label: 'ยืนยันรับอุปกรณ์แล้ว',
      description: 'ร้านกำลังตรวจสอบและยืนยันการส่งมอบขั้นสุดท้าย',
      stage: 4,
    };
  }

  return status;
};

const getCustomerHeadline = ({ status, handover, timeline, fallbackUpdatedAt }) => {
  const resolvedStatus = getCustomerFacingStatus(status, handover);
  const handoverOwnsHeadline = handover?.status === 'DELIVERED' || Boolean(handover?.customerConfirmedAt);
  const latestVisibleEvent = timeline.length ? timeline[timeline.length - 1] : null;

  if (!latestVisibleEvent || handoverOwnsHeadline) {
    return {
      ...resolvedStatus,
      updatedAt: fallbackUpdatedAt,
    };
  }

  return {
    ...resolvedStatus,
    label: latestVisibleEvent.title || resolvedStatus.label,
    description: latestVisibleEvent.description || resolvedStatus.description,
    updatedAt: latestVisibleEvent.occurredAt || fallbackUpdatedAt,
  };
};

const ACCESSORY_LABELS = {
  CHARGER: 'ที่ชาร์จ',
  POWER_ADAPTER: 'อะแดปเตอร์',
  CABLE: 'สายเชื่อมต่อ',
  BATTERY: 'แบตเตอรี่',
  BAG_CASE: 'กระเป๋า/เคส',
  SIM_CARD: 'ซิมการ์ด',
  MEMORY_CARD: 'เมมโมรีการ์ด',
  OTHER: 'อื่น ๆ',
};

const CustomerRepairTrackingPage = () => {
  const { token } = useParams();
  const [tracking, setTracking] = useState(null);
  const [state, setState] = useState({ loading: true, error: null });

  useEffect(() => {
    let active = true;
    setState({ loading: true, error: null });
    getPublicRepairTracking(token)
      .then((payload) => {
        if (!active) return;
        setTracking(payload);
        setState({ loading: false, error: null });
      })
      .catch((error) => {
        if (!active) return;
        setTracking(null);
        setState({
          loading: false,
          error:
            error?.status === 404
              ? 'ลิงก์นี้ไม่ถูกต้อง ถูกยกเลิก หรือหมดอายุแล้ว'
              : error?.message || 'ไม่สามารถโหลดสถานะงานซ่อมได้',
        });
      });
    return () => {
      active = false;
    };
  }, [token]);

  if (state.loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-emerald-100 border-t-emerald-600" />
          <p className="mt-4 font-bold text-slate-600">กำลังโหลดสถานะงานซ่อม</p>
        </div>
      </main>
    );
  }

  if (state.error || !tracking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5">
        <section className="w-full max-w-md rounded-3xl border border-red-100 bg-white p-7 text-center shadow-sm">
          <div className="text-4xl">🔒</div>
          <h1 className="mt-4 text-xl font-black text-slate-950">ไม่สามารถเปิดสถานะงานได้</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">{state.error}</p>
          <p className="mt-5 text-xs text-slate-400">กรุณาติดต่อร้านเพื่อขอลิงก์ติดตามงานใหม่</p>
        </section>
      </main>
    );
  }

  const repair = tracking.repair;
  const repairAsset = repair.repairAsset || {};
  const timeline = repair.timeline || [];
  const headline = getCustomerHeadline({
    status: repair.status || {},
    handover: repair.handover,
    timeline,
    fallbackUpdatedAt: repair.lastUpdatedAt,
  });
  const stage = Number(headline.stage || 0);
  const recentTimeline = [...timeline].slice(-3).reverse();
  const olderTimeline = timeline.length > 3 ? timeline.slice(0, -3) : [];
  const estimate = repair.estimate || {};
  const hasMeaningfulEstimate = [estimate.amount, estimate.depositPaid, estimate.estimatedBalance]
    .some((value) => Number(value || 0) > 0);

  const deviceSummary = [repairAsset.brand, repairAsset.model, repairAsset.category]
    .filter(Boolean)
    .join(' • ');

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-4 sm:px-6 sm:py-8">
      <div className="mx-auto w-full max-w-2xl space-y-3">
        <header className="rounded-3xl border border-emerald-100 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">Repair Tracking</p>
              <h1 className="mt-1 text-xl font-black text-slate-950 sm:text-2xl">ติดตามงานซ่อม</h1>
            </div>
            <div className="min-w-0 rounded-2xl bg-slate-50 px-3 py-2 text-right">
              <p className="text-[10px] font-black text-slate-400">เลขที่งาน</p>
              <p className="mt-0.5 max-w-[180px] truncate text-xs font-black text-slate-700 sm:text-sm">{repair.jobNo}</p>
            </div>
          </div>

          <section className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 sm:px-5">
            <p className="text-xs font-black text-emerald-700">ตอนนี้งานของคุณ</p>
            <p className="mt-1 text-2xl font-black text-slate-950">{headline.label}</p>
            <p className="mt-1 text-sm leading-6 text-slate-600">{headline.description}</p>
            <p className="mt-3 text-xs font-bold text-emerald-800/70">
              อัปเดตล่าสุด {formatDateTime(headline.updatedAt)}
            </p>
          </section>

          {stage > 0 ? (
            <div className="mt-4 grid grid-cols-4 gap-2">
              {['รับเครื่อง', 'ดำเนินการ', 'รออะไหล่', 'พร้อมรับ'].map((label, index) => {
                const step = index + 1;
                const reached = stage >= step;
                const current = stage === step;
                return (
                  <div key={label} className="text-center">
                    <div
                      className={`mx-auto h-2 rounded-full ${
                        reached ? 'bg-emerald-500' : 'bg-slate-200'
                      } ${current ? 'ring-2 ring-emerald-100 ring-offset-1' : ''}`}
                    />
                    <p className={`mt-2 text-[10px] font-black sm:text-xs ${reached ? 'text-emerald-700' : 'text-slate-400'}`}>
                      {label}
                    </p>
                  </div>
                );
              })}
            </div>
          ) : null}
        </header>

        <EstimateDecisionCard
          token={token}
          approval={repair.estimateApproval}
          onChanged={(approval) =>
            setTracking((current) => ({
              ...current,
              repair: {
                ...current.repair,
                estimateApproval: approval,
              },
            }))
          }
        />
        <PickupConfirmationCard
          token={token}
          status={headline}
          handover={repair.handover}
          defaultReceiverName={repair.pickupDefaults?.receiverName || ''}
          onChanged={(handover) =>
            setTracking((current) => ({
              ...current,
              repair: { ...current.repair, handover },
            }))
          }
        />

        {repair.claim ? (
          <section className="rounded-3xl border border-violet-200 bg-violet-50 p-5">
            <p className="text-xs font-black uppercase tracking-[0.15em] text-violet-700">สถานะเคลม</p>
            <h2 className="mt-1 font-black text-violet-950">{repair.claim.label}</h2>
            <p className="mt-2 text-sm text-violet-800">เลขที่เคลม {repair.claim.claimNo}</p>
            {repair.claim.serviceProvider ? (
              <p className="mt-1 text-sm text-violet-700">ผู้ดำเนินการ: {repair.claim.serviceProvider}</p>
            ) : null}
          </section>
        ) : null}

        {recentTimeline.length ? (
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black text-emerald-700">อัปเดตล่าสุด</p>
                <h2 className="mt-1 text-lg font-black text-slate-950">ความคืบหน้าของงาน</h2>
              </div>
              <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-black text-emerald-700">
                ล่าสุด {recentTimeline.length} รายการ
              </span>
            </div>
            <div className="mt-5">
              <TrackingTimeline items={recentTimeline} />
            </div>

            {olderTimeline.length ? (
              <details className="mt-4 border-t border-slate-100 pt-4">
                <summary className="cursor-pointer text-sm font-black text-slate-500">
                  ดูประวัติก่อนหน้าอีก {olderTimeline.length} รายการ
                </summary>
                <div className="mt-4">
                  <TrackingTimeline items={[...olderTimeline].reverse()} />
                </div>
              </details>
            ) : null}
          </section>
        ) : null}

        <details className="rounded-3xl border border-slate-200 bg-white shadow-sm">
          <summary className="cursor-pointer list-none px-5 py-4">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-xs font-black text-slate-400">รายละเอียดงาน</p>
                <p className="mt-1 truncate font-black text-slate-800">{repairAsset.displayName || repair.jobNo}</p>
              </div>
              <span className="shrink-0 text-sm font-black text-emerald-700">ดูรายละเอียด</span>
            </div>
          </summary>

          <div className="border-t border-slate-100 px-5 pb-5 pt-4">
            {deviceSummary ? <p className="text-sm font-bold text-slate-500">{deviceSummary}</p> : null}

            <div className="mt-3 rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-black text-slate-500">อาการที่แจ้ง</p>
              <p className="mt-1 text-sm leading-6 text-slate-800">{repair.reportedSymptoms || '-'}</p>
            </div>

            {repair.accessories?.length ? (
              <div className="mt-4">
                <p className="text-xs font-black text-slate-500">อุปกรณ์ที่ฝากไว้กับร้าน</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {repair.accessories.map((item, index) => (
                    <span key={`${item.type}-${index}`} className="rounded-full bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700">
                      {ACCESSORY_LABELS[item.type] || item.type} × {item.quantity}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            {repairAsset.serialNumber || repairAsset.imei || repairAsset.barcode ? (
              <div className="mt-4 space-y-1 text-xs text-slate-500">
                {repairAsset.serialNumber ? <p><span className="font-black">Serial:</span> {repairAsset.serialNumber}</p> : null}
                {repairAsset.imei ? <p><span className="font-black">IMEI:</span> {repairAsset.imei}</p> : null}
                {repairAsset.barcode ? <p><span className="font-black">Barcode:</span> {repairAsset.barcode}</p> : null}
              </div>
            ) : null}

            {hasMeaningfulEstimate ? (
              <div className="mt-5 border-t border-slate-100 pt-4">
                <p className="font-black text-slate-950">ค่าใช้จ่ายโดยประมาณ</p>
                <div className="mt-3 space-y-2 text-sm">
                  <MoneyRow label="ราคาประเมิน" value={estimate.amount} />
                  <MoneyRow label="มัดจำแล้ว" value={estimate.depositPaid} />
                  <MoneyRow label="ยอดคงเหลือโดยประมาณ" value={estimate.estimatedBalance} strong />
                </div>
              </div>
            ) : null}
          </div>
        </details>

        <section className="rounded-3xl border border-emerald-100 bg-emerald-50 p-5">
          <p className="text-xs font-black text-emerald-700">ร้านที่รับผิดชอบ</p>
          <h2 className="mt-1 font-black text-slate-950">{tracking.branch?.name || '-'}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">{tracking.branch?.address || ''}</p>
          {tracking.branch?.phone ? (
            <a href={`tel:${tracking.branch.phone}`} className="mt-4 flex min-h-12 items-center justify-center rounded-2xl bg-emerald-600 px-5 font-black text-white shadow-sm">
              โทร {tracking.branch.phone}
            </a>
          ) : null}
        </section>

        <footer className="pb-4 text-center text-xs text-slate-400">
          ลิงก์นี้ใช้ติดตามสถานะงานล่าสุดได้โดยไม่ต้องโทรสอบถามร้าน
        </footer>
      </div>
    </main>
  );
};

const MoneyRow = ({ label, value, strong = false }) => (
  <div className={`flex items-center justify-between gap-4 ${strong ? 'border-t border-slate-200 pt-3 text-base font-black' : ''}`}>
    <span className="text-slate-600">{label}</span>
    <span className={strong ? 'text-emerald-700' : 'font-bold text-slate-900'}>{money(value)}</span>
  </div>
);

export default CustomerRepairTrackingPage;