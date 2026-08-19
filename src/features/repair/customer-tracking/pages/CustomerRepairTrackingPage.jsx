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
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
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
  const status = getCustomerFacingStatus(repair.status || {}, repair.handover);
  const stage = Number(status.stage || 0);

  const deviceSummary = [repairAsset.brand, repairAsset.model, repairAsset.category]
    .filter(Boolean)
    .join(' • ');

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-5 sm:px-6 sm:py-8">
      <div className="mx-auto w-full max-w-2xl space-y-4">
        <header className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">Repair Tracking</p>
              <h1 className="mt-1 text-2xl font-black text-slate-950">ติดตามงานซ่อม</h1>
            </div>
            <div className="rounded-2xl bg-slate-50 px-3 py-2 sm:text-right">
              <p className="text-[11px] font-black text-slate-400">เลขที่งาน</p>
              <p className="mt-0.5 break-all text-sm font-black text-slate-800">{repair.jobNo}</p>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3.5">
            <p className="text-xs font-black text-blue-600">สถานะปัจจุบัน</p>
            <p className="mt-1 text-lg font-black text-slate-950">{status.label}</p>
            <p className="mt-1 text-sm leading-6 text-slate-600">{status.description}</p>
          </div>
        </header>

        {stage > 0 ? (
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="grid grid-cols-4 gap-2">
              {['รับเครื่อง', 'ดำเนินการ', 'รออะไหล่', 'พร้อมรับ'].map((label, index) => {
                const step = index + 1;
                const reached = stage >= step;
                return (
                  <div key={label} className="text-center">
                    <div className={`mx-auto h-2 rounded-full ${reached ? 'bg-blue-600' : 'bg-slate-200'}`} />
                    <p className={`mt-2 text-[10px] font-black sm:text-xs ${reached ? 'text-blue-700' : 'text-slate-400'}`}>
                      {label}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>
        ) : null}

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.15em] text-blue-600">รายการซ่อม</p>
          <h2 className="mt-2 text-xl font-black text-slate-950">{repairAsset.displayName || '-'}</h2>
          {deviceSummary ? (
            <p className="mt-1 text-sm font-bold text-slate-500">{deviceSummary}</p>
          ) : null}

          <div className="mt-4 rounded-2xl bg-slate-50 p-4">
            <p className="text-xs font-black text-slate-500">อาการที่แจ้ง</p>
            <p className="mt-1 text-sm leading-6 text-slate-800">{repair.reportedSymptoms || '-'}</p>
          </div>

          {repairAsset.serialNumber ? (
            <details className="mt-3 rounded-2xl border border-slate-100 bg-white px-4 py-3">
              <summary className="cursor-pointer text-xs font-black text-slate-500">ดูข้อมูลอุปกรณ์เพิ่มเติม</summary>
              <div className="mt-3 space-y-2 text-sm text-slate-600">
                <p><span className="font-black text-slate-500">Serial Number:</span> {repairAsset.serialNumber}</p>
                {repairAsset.imei ? <p><span className="font-black text-slate-500">IMEI:</span> {repairAsset.imei}</p> : null}
                {repairAsset.barcode ? <p><span className="font-black text-slate-500">Barcode:</span> {repairAsset.barcode}</p> : null}
              </div>
            </details>
          ) : null}
        </section>

        {repair.accessories?.length ? (
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-black text-slate-950">อุปกรณ์ที่ฝากไว้กับร้าน</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {repair.accessories.map((item, index) => (
                <span key={`${item.type}-${index}`} className="rounded-full bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700">
                  {ACCESSORY_LABELS[item.type] || item.type} × {item.quantity}
                </span>
              ))}
            </div>
          </section>
        ) : null}

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-black text-slate-950">ค่าใช้จ่ายโดยประมาณ</h2>
          <div className="mt-3 space-y-2 text-sm">
            <MoneyRow label="ราคาประเมิน" value={repair.estimate?.amount} />
            <MoneyRow label="มัดจำแล้ว" value={repair.estimate?.depositPaid} />
            <MoneyRow label="ยอดคงเหลือโดยประมาณ" value={repair.estimate?.estimatedBalance} strong />
          </div>
          <p className="mt-3 text-xs leading-5 text-slate-400">ยอดจริงอาจเปลี่ยนแปลงตามผลตรวจสอบและการยืนยันของลูกค้า</p>
        </section>

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
          status={status}
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
            <p className="text-xs font-black uppercase tracking-[0.15em] text-violet-700">Warranty Claim</p>
            <h2 className="mt-1 font-black text-violet-950">{repair.claim.label}</h2>
            <p className="mt-2 text-sm text-violet-800">เลขที่เคลม {repair.claim.claimNo}</p>
            {repair.claim.serviceProvider ? (
              <p className="mt-1 text-sm text-violet-700">ผู้ดำเนินการ: {repair.claim.serviceProvider}</p>
            ) : null}
          </section>
        ) : null}

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-black text-slate-950">ความคืบหน้า</h2>
          <div className="mt-5">
            <TrackingTimeline items={repair.timeline || []} />
          </div>
        </section>

        <section className="rounded-3xl border border-blue-100 bg-blue-50 p-5">
          <p className="text-xs font-black text-blue-700">ร้านที่รับผิดชอบ</p>
          <h2 className="mt-1 font-black text-blue-950">{tracking.branch?.name || '-'}</h2>
          <p className="mt-2 text-sm leading-6 text-blue-800">{tracking.branch?.address || ''}</p>
          {tracking.branch?.phone ? (
            <a href={`tel:${tracking.branch.phone}`} className="mt-4 flex min-h-12 items-center justify-center rounded-2xl bg-blue-700 px-5 font-black text-white">
              โทร {tracking.branch.phone}
            </a>
          ) : null}
        </section>

        <footer className="pb-4 text-center text-xs text-slate-400">
          อัปเดตล่าสุด {formatDateTime(repair.lastUpdatedAt)}
        </footer>
      </div>
    </main>
  );
};

const MoneyRow = ({ label, value, strong = false }) => (
  <div className={`flex items-center justify-between gap-4 ${strong ? 'border-t border-slate-200 pt-3 text-base font-black' : ''}`}>
    <span className="text-slate-600">{label}</span>
    <span className={strong ? 'text-blue-700' : 'font-bold text-slate-900'}>{money(value)}</span>
  </div>
);

export default CustomerRepairTrackingPage;
