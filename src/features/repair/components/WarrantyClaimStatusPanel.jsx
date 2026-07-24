import React from 'react';
import {
  CLAIM_RESOLUTION_LABELS,
  CLAIM_STATUS_LABELS,
  CLAIM_TRANSITIONS,
} from '../utils/repairStatus';

const WarrantyClaimStatusPanel = ({ claim, draft, submitting, onChange, onSubmit }) => {
  const options = CLAIM_TRANSITIONS[claim.status] || [];
  if (!options.length) return null;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-black text-slate-950">อัปเดตสถานะเคลม</h2>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <select
          value={draft.status}
          onChange={(e) => onChange({ ...draft, status: e.target.value })}
          className="rounded-xl border border-slate-300 px-4 py-3"
        >
          <option value="">เลือกสถานะถัดไป</option>
          {options.map((status) => (
            <option key={status} value={status}>{CLAIM_STATUS_LABELS[status]}</option>
          ))}
        </select>

        <input
          placeholder="ศูนย์บริการ"
          value={draft.serviceProvider}
          onChange={(e) => onChange({ ...draft, serviceProvider: e.target.value })}
          className="rounded-xl border border-slate-300 px-4 py-3"
        />
        <input
          placeholder="เลขอ้างอิงภายนอก"
          value={draft.externalClaimRef}
          onChange={(e) => onChange({ ...draft, externalClaimRef: e.target.value })}
          className="rounded-xl border border-slate-300 px-4 py-3"
        />
        <input
          placeholder="Tracking number"
          value={draft.trackingNumber}
          onChange={(e) => onChange({ ...draft, trackingNumber: e.target.value })}
          className="rounded-xl border border-slate-300 px-4 py-3"
        />

        {draft.status === 'RESOLVED' ? (
          <>
            <select
              value={draft.resolution}
              onChange={(e) => onChange({ ...draft, resolution: e.target.value })}
              className="rounded-xl border border-slate-300 px-4 py-3"
            >
              <option value="">เลือกผลการเคลม</option>
              {Object.entries(CLAIM_RESOLUTION_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            <input
              inputMode="numeric"
              placeholder="Replacement StockItem ID"
              value={draft.replacementStockItemId}
              onChange={(e) => onChange({ ...draft, replacementStockItemId: e.target.value })}
              className="rounded-xl border border-slate-300 px-4 py-3"
            />
            <input
              type="number"
              min="0"
              placeholder="Credit amount"
              value={draft.creditAmount}
              onChange={(e) => onChange({ ...draft, creditAmount: e.target.value })}
              className="rounded-xl border border-slate-300 px-4 py-3"
            />
            <textarea
              rows={2}
              placeholder="รายละเอียดผลการเคลม"
              value={draft.resolutionNote}
              onChange={(e) => onChange({ ...draft, resolutionNote: e.target.value })}
              className="rounded-xl border border-slate-300 px-4 py-3 md:col-span-2"
            />
          </>
        ) : null}

        <textarea
          rows={3}
          placeholder="หมายเหตุการเปลี่ยนสถานะ"
          value={draft.note}
          onChange={(e) => onChange({ ...draft, note: e.target.value })}
          className="rounded-xl border border-slate-300 px-4 py-3 md:col-span-2"
        />
      </div>
      <button
        type="button"
        disabled={submitting || !draft.status}
        onClick={onSubmit}
        className="mt-4 min-h-11 rounded-xl bg-indigo-700 px-5 font-black text-white disabled:opacity-40"
      >
        บันทึกสถานะเคลม
      </button>
    </section>
  );
};

export default WarrantyClaimStatusPanel;
