import React, { useEffect, useState } from 'react';
import repairApi from '../api/repairApi';

const RepairHandoverPanel = ({ repairJobId, jobStatus }) => {
  const [handover, setHandover] = useState(null);
  const [checks, setChecks] = useState({
    paymentConfirmed: false, deviceReturned: false, accessoriesReturned: false, note: '',
  });
  const [state, setState] = useState({ loading: true, saving: false, error: null });

  const load = () => {
    setState((v) => ({ ...v, loading: true, error: null }));
    repairApi.getHandover(repairJobId)
      .then((data) => { setHandover(data); setState({ loading: false, saving: false, error: null }); })
      .catch((error) => setState({ loading: false, saving: false, error: error.message }));
  };
  useEffect(load, [repairJobId]);

  const finalize = async () => {
    setState((v) => ({ ...v, saving: true, error: null }));
    try {
      setHandover(await repairApi.finalizeHandover(repairJobId, checks));
      setState({ loading: false, saving: false, error: null });
    } catch (error) {
      setState({ loading: false, saving: false, error: error.message });
    }
  };

  return (
    <section className="rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">Digital Handover</p>
      <h3 className="mt-1 text-lg font-black text-slate-950">ส่งมอบเครื่องคืนลูกค้า</h3>
      {state.loading ? <p className="mt-3 text-sm text-slate-500">กำลังโหลด...</p> : null}
      {!state.loading && handover?.status === 'DELIVERED' ? (
        <div className="mt-4 rounded-2xl bg-emerald-50 p-4 font-bold text-emerald-800">
          ส่งมอบเสร็จแล้ว — ผู้รับ {handover.customerConfirmedBy}
        </div>
      ) : null}
      {!state.loading && handover?.status !== 'DELIVERED' ? (
        <>
          <div className={`mt-4 rounded-2xl p-4 ${handover?.customerConfirmedAt ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'}`}>
            {handover?.customerConfirmedAt
              ? `ลูกค้ายืนยันแล้ว: ${handover.customerConfirmedBy}`
              : jobStatus === 'COMPLETED' ? 'รอลูกค้ากดยืนยันรับเครื่องจากลิงก์ติดตาม' : 'งานยังไม่อยู่ในสถานะพร้อมรับ'}
          </div>
          {handover?.customerConfirmedAt ? (
            <div className="mt-4 space-y-3">
              {[
                ['paymentConfirmed', 'ตรวจสอบการชำระเงินแล้ว'],
                ['deviceReturned', 'ตรวจสอบและส่งคืนตัวเครื่องแล้ว'],
                ['accessoriesReturned', 'คืนอุปกรณ์ที่ฝากไว้ครบแล้ว'],
              ].map(([key, label]) => (
                <label key={key} className="flex min-h-12 items-center gap-3 rounded-xl border border-slate-200 px-4 font-bold">
                  <input type="checkbox" checked={checks[key]} onChange={(e) => setChecks((v) => ({ ...v, [key]: e.target.checked }))} className="h-5 w-5" />
                  {label}
                </label>
              ))}
              <textarea value={checks.note} onChange={(e) => setChecks((v) => ({ ...v, note: e.target.value }))} rows={2} placeholder="หมายเหตุการส่งมอบ" className="w-full rounded-xl border border-slate-300 px-4 py-3" />
              <button
                type="button"
                disabled={state.saving || !checks.paymentConfirmed || !checks.deviceReturned || !checks.accessoriesReturned}
                onClick={finalize}
                className="min-h-12 w-full rounded-xl bg-emerald-700 px-5 font-black text-white disabled:opacity-40"
              >
                {state.saving ? 'กำลังปิดการส่งมอบ...' : 'ยืนยันส่งมอบขั้นสุดท้าย'}
              </button>
            </div>
          ) : null}
        </>
      ) : null}
      {state.error ? <p className="mt-3 text-sm font-bold text-red-600">{state.error}</p> : null}
    </section>
  );
};

export default RepairHandoverPanel;
