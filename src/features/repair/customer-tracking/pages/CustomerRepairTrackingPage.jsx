import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import TrackingTimeline from '../components/TrackingTimeline';
import { getPublicRepairTracking } from '../api/repairTrackingPublicApi';
import EstimateDecisionCard from '../components/EstimateDecisionCard';

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
  const device = repair.device || {};
  const status = repair.status || {};
  const stage = Number(status.stage || 0);

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 via-slate-50 to-white px-4 py-5 sm:px-6 sm:py-10">
      <div className="mx-auto w-full max-w-2xl space-y-4">
        <header className="rounded-3xl bg-slate-950 p-6 text-white shadow-lg">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-300">Repair Tracking</p>
          <h1 className="mt-2 text-2xl font-black">ติดตามงานซ่อม</h1>
          <p className="mt-1 text-sm text-slate-300">เลขที่งาน {repair.jobNo}</p>
          <div className="mt-5 rounded-2xl bg-white/10 p-4">
            <p className="text-xs font-bold text-blue-200">สถานะปัจจุบัน</p>
            <p className="mt-1 text-xl font-black">{status.label}</p>
            <p className="mt-1 text-sm leading-6 text-slate-300">{status.description}</p>
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
          <p className="text-xs font-black uppercase tracking-[0.15em] text-blue-600">อุปกรณ์</p>
          <h2 className="mt-2 text-xl font-black text-slate-950">{device.displayName || device.model || '-'}</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Info label="รุ่น" value={device.model} />
            <Info label="ประเภท" value={device.type} />
            <Info label="Serial Number" value={device.serialNumber} />
            <Info label="Barcode ร้าน" value={device.barcode} />
          </div>
          <div className="mt-3 rounded-2xl bg-slate-50 p-4">
            <p className="text-xs font-black text-slate-500">อาการที่แจ้ง</p>
            <p className="mt-1 text-sm leading-6 text-slate-800">{repair.reportedSymptoms || '-'}</p>
          </div>
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

const Info = ({ label, value }) => (
  <div className="rounded-2xl bg-slate-50 px-4 py-3">
    <p className="text-xs font-black text-slate-400">{label}</p>
    <p className="mt-1 break-all font-bold text-slate-800">{value || '-'}</p>
  </div>
);

const MoneyRow = ({ label, value, strong = false }) => (
  <div className={`flex items-center justify-between gap-4 ${strong ? 'border-t border-slate-200 pt-3 text-base font-black' : ''}`}>
    <span className="text-slate-600">{label}</span>
    <span className={strong ? 'text-blue-700' : 'font-bold text-slate-900'}>{money(value)}</span>
  </div>
);

export default CustomerRepairTrackingPage;
