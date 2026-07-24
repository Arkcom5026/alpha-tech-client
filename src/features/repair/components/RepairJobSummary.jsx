import React from 'react';
import StatusBadge from './StatusBadge';
import { formatRepairDateTime, formatRepairMoney } from '../utils/repairFormat';

const Item = ({ label, value }) => (
  <div className="rounded-xl bg-slate-50 p-3">
    <p className="text-xs font-bold text-slate-500">{label}</p>
    <p className="mt-1 font-black text-slate-900">{value ?? '-'}</p>
  </div>
);

const RepairJobSummary = ({ job }) => (
  <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
      <div>
        <p className="text-xs font-black uppercase tracking-widest text-blue-600">Repair Job</p>
        <h2 className="mt-1 text-2xl font-black text-slate-950">{job.jobNo}</h2>
        <p className="mt-1 text-sm text-slate-500">{job.deviceModel}</p>
      </div>
      <StatusBadge status={job.status} />
    </div>

    <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <Item label="ลูกค้า" value={job.customerName || job.customerId} />
      <Item label="ช่าง" value={job.technician?.name || 'ยังไม่มอบหมาย'} />
      <Item label="รับเครื่องเมื่อ" value={formatRepairDateTime(job.createdAt)} />
      <Item label="อัปเดตล่าสุด" value={formatRepairDateTime(job.updatedAt)} />
      <Item label="มัดจำ" value={formatRepairMoney(job.depositPaid)} />
      <Item label="ราคาประเมิน" value={formatRepairMoney(job.estimatedCost)} />
      <Item label="บาร์โค้ด" value={job.stockItem?.barcode} />
      <Item label="Serial" value={job.stockItem?.serialNumber} />
    </div>

    <div className="mt-4 rounded-xl border border-slate-200 p-4">
      <p className="text-xs font-black uppercase tracking-wide text-slate-500">อาการที่แจ้ง</p>
      <p className="mt-2 whitespace-pre-wrap text-sm text-slate-800">{job.reportedSymptoms}</p>
    </div>

    {job.technicianNotes ? (
      <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
        <p className="text-xs font-black uppercase tracking-wide text-amber-700">บันทึกช่าง</p>
        <p className="mt-2 whitespace-pre-wrap text-sm text-amber-900">{job.technicianNotes}</p>
      </div>
    ) : null}
  </section>
);

export default RepairJobSummary;
