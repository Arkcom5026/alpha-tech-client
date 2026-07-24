import React from 'react';

const FieldError = ({ message }) =>
  message ? <p className="mt-1 text-xs font-bold text-rose-600">{message}</p> : null;

const RepairCreateForm = ({ draft, errors, submitting, onChange, onCancel, onSubmit }) => (
  <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="flex items-center justify-between gap-3">
      <div>
        <p className="text-xs font-black uppercase tracking-widest text-blue-600">Create Repair Job</p>
        <h2 className="mt-1 text-xl font-black text-slate-950">เปิดใบรับซ่อม</h2>
      </div>
      <button type="button" onClick={onCancel} className="rounded-lg px-3 py-2 text-sm font-bold text-slate-500">
        ปิด
      </button>
    </div>

    <div className="mt-5 grid gap-4 md:grid-cols-2">
      <label className="block">
        <span className="text-sm font-bold text-slate-700">รหัสลูกค้า</span>
        <input
          inputMode="numeric"
          value={draft.customerId}
          onChange={(e) => onChange({ customerId: e.target.value })}
          className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3"
        />
        <FieldError message={errors.customerId} />
      </label>

      <label className="block">
        <span className="text-sm font-bold text-slate-700">รหัสสินค้าในสต็อก</span>
        <input
          inputMode="numeric"
          value={draft.stockItemId}
          onChange={(e) => onChange({ stockItemId: e.target.value })}
          className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3"
        />
      </label>

      <label className="block md:col-span-2">
        <span className="text-sm font-bold text-slate-700">รุ่นหรือรายละเอียดอุปกรณ์</span>
        <input
          value={draft.deviceModel}
          onChange={(e) => onChange({ deviceModel: e.target.value })}
          className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3"
        />
        <FieldError message={errors.deviceModel} />
      </label>

      <label className="block md:col-span-2">
        <span className="text-sm font-bold text-slate-700">อาการที่ลูกค้าแจ้ง</span>
        <textarea
          rows={4}
          value={draft.reportedSymptoms}
          onChange={(e) => onChange({ reportedSymptoms: e.target.value })}
          className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3"
        />
        <FieldError message={errors.reportedSymptoms} />
      </label>

      <label className="block">
        <span className="text-sm font-bold text-slate-700">มัดจำ</span>
        <input
          type="number"
          min="0"
          value={draft.depositPaid}
          onChange={(e) => onChange({ depositPaid: e.target.value })}
          className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3"
        />
      </label>

      <label className="block">
        <span className="text-sm font-bold text-slate-700">ราคาประเมิน</span>
        <input
          type="number"
          min="0"
          value={draft.estimatedCost}
          onChange={(e) => onChange({ estimatedCost: e.target.value })}
          className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3"
        />
      </label>

      <label className="block">
        <span className="text-sm font-bold text-slate-700">รหัสช่าง (ถ้ามี)</span>
        <input
          inputMode="numeric"
          value={draft.technicianId}
          onChange={(e) => onChange({ technicianId: e.target.value })}
          className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3"
        />
      </label>

      <label className="block">
        <span className="text-sm font-bold text-slate-700">บันทึกภายใน</span>
        <input
          value={draft.technicianNotes}
          onChange={(e) => onChange({ technicianNotes: e.target.value })}
          className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3"
        />
      </label>
    </div>

    <button
      type="button"
      disabled={submitting}
      onClick={onSubmit}
      className="mt-5 min-h-12 w-full rounded-xl bg-blue-700 px-5 font-black text-white disabled:opacity-50"
    >
      {submitting ? 'กำลังเปิดใบรับซ่อม...' : 'ยืนยันเปิดใบรับซ่อม'}
    </button>
  </section>
);

export default RepairCreateForm;
