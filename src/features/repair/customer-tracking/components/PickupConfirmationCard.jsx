import React, { useState } from 'react';
import { confirmPublicRepairPickup } from '../api/repairTrackingPublicApi';

const PickupConfirmationCard = ({ token, status, handover, onChanged }) => {
  const [form, setForm] = useState({ receiverName: '', receiverPhone: '', note: '' });
  const [state, setState] = useState({ loading: false, error: null });

  if (handover?.status === 'DELIVERED') {
    return (
      <section className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5">
        <p className="text-xs font-black uppercase tracking-[0.15em] text-emerald-700">ส่งมอบสำเร็จ</p>
        <h2 className="mt-2 text-lg font-black text-emerald-950">ร้านส่งมอบเครื่องคืนเรียบร้อยแล้ว</h2>
        <p className="mt-2 text-sm text-emerald-800">ผู้รับ: {handover.customerConfirmedBy}</p>
      </section>
    );
  }
  if (handover?.customerConfirmedAt) {
    return (
      <section className="rounded-3xl border border-amber-200 bg-amber-50 p-5">
        <p className="text-xs font-black uppercase tracking-[0.15em] text-amber-700">รอพนักงานส่งมอบ</p>
        <h2 className="mt-2 text-lg font-black text-amber-950">คุณยืนยันรับเครื่องแล้ว</h2>
        <p className="mt-2 text-sm leading-6 text-amber-800">พนักงานจะตรวจสอบการชำระเงิน เครื่อง และอุปกรณ์ที่ฝากไว้ก่อนปิดการส่งมอบ</p>
      </section>
    );
  }
  if (status?.code !== 'READY') return null;

  const submit = async () => {
    setState({ loading: true, error: null });
    try {
      onChanged(await confirmPublicRepairPickup(token, form));
      setState({ loading: false, error: null });
    } catch (error) {
      setState({ loading: false, error: error.message });
    }
  };

  return (
    <section className="rounded-3xl border border-blue-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-black uppercase tracking-[0.15em] text-blue-600">Digital Pickup</p>
      <h2 className="mt-2 text-lg font-black text-slate-950">ยืนยันว่าคุณมารับเครื่อง</h2>
      <p className="mt-1 text-sm leading-6 text-slate-600">การกดปุ่มนี้เป็นเพียงการยืนยันตัวผู้รับ พนักงานยังต้องตรวจสอบและส่งมอบขั้นสุดท้าย</p>
      <div className="mt-4 space-y-3">
        <input
          value={form.receiverName}
          onChange={(e) => setForm((v) => ({ ...v, receiverName: e.target.value }))}
          placeholder="ชื่อผู้รับเครื่อง *"
          className="min-h-12 w-full rounded-2xl border border-slate-300 px-4"
        />
        <input
          value={form.receiverPhone}
          onChange={(e) => setForm((v) => ({ ...v, receiverPhone: e.target.value }))}
          placeholder="เบอร์โทร (ถ้ามี)"
          inputMode="tel"
          className="min-h-12 w-full rounded-2xl border border-slate-300 px-4"
        />
        <textarea
          value={form.note}
          onChange={(e) => setForm((v) => ({ ...v, note: e.target.value }))}
          placeholder="หมายเหตุ (ถ้ามี)"
          rows={2}
          className="w-full rounded-2xl border border-slate-300 px-4 py-3"
        />
      </div>
      {state.error ? <p className="mt-3 text-sm font-bold text-red-600">{state.error}</p> : null}
      <button
        type="button"
        disabled={state.loading || form.receiverName.trim().length < 2}
        onClick={submit}
        className="mt-4 min-h-12 w-full rounded-2xl bg-blue-700 px-5 font-black text-white disabled:opacity-40"
      >
        {state.loading ? 'กำลังยืนยัน...' : 'ยืนยันรับเครื่อง'}
      </button>
    </section>
  );
};

export default PickupConfirmationCard;
