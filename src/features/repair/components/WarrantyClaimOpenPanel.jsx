import React from 'react';

const WarrantyClaimOpenPanel = ({ job, draft, errors, submitting, onChange, onSubmit }) => {
  const activeClaim = (job.warrantyClaims || []).find(
    (claim) => !['RESOLVED', 'CANCELLED'].includes(claim.status)
  );

  if (activeClaim || !job.stockItemId || ['COMPLETED', 'CANCELLED'].includes(job.status)) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-indigo-200 bg-indigo-50 p-5">
      <h2 className="text-lg font-black text-indigo-950">เปิดเคลมจากใบงานซ่อม</h2>
      <p className="mt-1 text-sm text-indigo-700">
        ระบบจะผูกเคลมกับใบงานนี้และสินค้าโดยอัตโนมัติ
      </p>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <label className="md:col-span-2">
          <span className="text-sm font-bold text-slate-700">เหตุผลในการส่งเคลม</span>
          <textarea
            rows={3}
            value={draft.reason}
            onChange={(e) => onChange({ ...draft, reason: e.target.value })}
            className="mt-1 w-full rounded-xl border border-indigo-200 bg-white px-4 py-3"
          />
          {errors.reason ? <p className="mt-1 text-xs font-bold text-rose-600">{errors.reason}</p> : null}
        </label>
        <input
          inputMode="numeric"
          placeholder="Supplier ID (เว้นว่างเพื่อใช้ต้นทาง)"
          value={draft.supplierId}
          onChange={(e) => onChange({ ...draft, supplierId: e.target.value })}
          className="rounded-xl border border-indigo-200 bg-white px-4 py-3"
        />
        <input
          placeholder="ศูนย์บริการ"
          value={draft.serviceProvider}
          onChange={(e) => onChange({ ...draft, serviceProvider: e.target.value })}
          className="rounded-xl border border-indigo-200 bg-white px-4 py-3"
        />
        <input
          placeholder="เลขอ้างอิงภายนอก"
          value={draft.externalClaimRef}
          onChange={(e) => onChange({ ...draft, externalClaimRef: e.target.value })}
          className="rounded-xl border border-indigo-200 bg-white px-4 py-3"
        />
        <input
          placeholder="Tracking number"
          value={draft.trackingNumber}
          onChange={(e) => onChange({ ...draft, trackingNumber: e.target.value })}
          className="rounded-xl border border-indigo-200 bg-white px-4 py-3"
        />
        <textarea
          rows={2}
          placeholder="หมายเหตุ"
          value={draft.note}
          onChange={(e) => onChange({ ...draft, note: e.target.value })}
          className="rounded-xl border border-indigo-200 bg-white px-4 py-3 md:col-span-2"
        />
      </div>
      <button
        type="button"
        disabled={submitting}
        onClick={onSubmit}
        className="mt-4 min-h-11 rounded-xl bg-indigo-700 px-5 font-black text-white disabled:opacity-50"
      >
        ยืนยันเปิดเคลม
      </button>
    </section>
  );
};

export default WarrantyClaimOpenPanel;
