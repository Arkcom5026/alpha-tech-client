import React from 'react';
import { REPAIR_STATUS_LABELS, REPAIR_TRANSITIONS } from '../utils/repairStatus';

const RepairStatusPanel = ({ job, draft, submitting, onChange, onSubmit }) => {
  const options = REPAIR_TRANSITIONS[job.status] || [];
  if (!options.length) return null;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-black text-slate-950">อัปเดตสถานะงานซ่อม</h2>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <select
          value={draft.status}
          onChange={(e) => onChange({ ...draft, status: e.target.value })}
          className="rounded-xl border border-slate-300 px-4 py-3"
        >
          <option value="">เลือกสถานะถัดไป</option>
          {options.map((status) => (
            <option key={status} value={status}>{REPAIR_STATUS_LABELS[status]}</option>
          ))}
        </select>
        <input
          inputMode="numeric"
          placeholder="รหัสช่าง (ถ้ามี)"
          value={draft.technicianId}
          onChange={(e) => onChange({ ...draft, technicianId: e.target.value })}
          className="rounded-xl border border-slate-300 px-4 py-3"
        />
        <textarea
          rows={3}
          placeholder="บันทึกความคืบหน้า"
          value={draft.technicianNotes}
          onChange={(e) => onChange({ ...draft, technicianNotes: e.target.value })}
          className="rounded-xl border border-slate-300 px-4 py-3 md:col-span-2"
        />
      </div>
      <button
        type="button"
        disabled={submitting || !draft.status}
        onClick={onSubmit}
        className="mt-4 min-h-11 rounded-xl bg-slate-900 px-5 font-black text-white disabled:opacity-40"
      >
        บันทึกสถานะ
      </button>
    </section>
  );
};

export default RepairStatusPanel;
