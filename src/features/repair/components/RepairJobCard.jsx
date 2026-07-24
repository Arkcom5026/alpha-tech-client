import React from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import { formatRepairDateTime, formatRepairMoney } from '../utils/repairFormat';

const RepairJobCard = ({ job }) => (
  <Link
    to={`/advancetech/pos/service/repairs/${job.id}`}
    className="block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md"
  >
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="font-black text-slate-950">{job.jobNo}</p>
        <p className="mt-1 text-sm text-slate-500">{job.deviceModel}</p>
      </div>
      <StatusBadge status={job.status} />
    </div>
    <p className="mt-4 line-clamp-2 text-sm text-slate-700">{job.reportedSymptoms}</p>
    <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-slate-500">
      <span>ลูกค้า: {job.customerName || job.customerId}</span>
      <span>รับเมื่อ: {formatRepairDateTime(job.createdAt)}</span>
      <span>มัดจำ: {formatRepairMoney(job.depositPaid)}</span>
      <span>ราคาประเมิน: {formatRepairMoney(job.estimatedCost)}</span>
    </div>
  </Link>
);

export default RepairJobCard;
