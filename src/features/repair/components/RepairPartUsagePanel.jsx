import React from 'react';
import { formatRepairMoney } from '../utils/repairFormat';

const RepairPartUsagePanel = ({ job, draft, submitting, onChange, onSubmit }) => (
  <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <h2 className="text-lg font-black text-slate-950">อะไหล่ที่ใช้</h2>
    <div className="mt-3 space-y-2">
      {(job.partsUsed || []).length ? (
        job.partsUsed.map((part) => (
          <div key={part.id} className="flex items-center justify-between rounded-xl bg-slate-50 p-3 text-sm">
            <div>
              <p className="font-bold text-slate-900">{part.productName || `สินค้า #${part.productId}`}</p>
              <p className="text-slate-500">จำนวน {part.qtyUsed}</p>
            </div>
            <span className="font-black text-slate-800">{formatRepairMoney(part.unitPrice)}</span>
          </div>
        ))
      ) : (
        <p className="text-sm text-slate-500">ยังไม่มีการเบิกอะไหล่</p>
      )}
    </div>

    {!['COMPLETED', 'CANCELLED'].includes(job.status) ? (
      <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_140px_auto]">
        <input
          inputMode="numeric"
          placeholder="Product ID"
          value={draft.productId}
          onChange={(e) => onChange({ ...draft, productId: e.target.value })}
          className="rounded-xl border border-slate-300 px-4 py-3"
        />
        <input
          type="number"
          min="1"
          value={draft.qtyUsed}
          onChange={(e) => onChange({ ...draft, qtyUsed: e.target.value })}
          className="rounded-xl border border-slate-300 px-4 py-3"
        />
        <button
          type="button"
          disabled={submitting}
          onClick={onSubmit}
          className="rounded-xl bg-blue-700 px-5 py-3 font-black text-white disabled:opacity-50"
        >
          เบิกอะไหล่
        </button>
      </div>
    ) : null}
  </section>
);

export default RepairPartUsagePanel;
