import React from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import { formatRepairDateTime } from '../utils/repairFormat';

const WarrantyClaimCard = ({ claim }) => (
  <Link
    to={`/advancetech/pos/service/warranty-claims/${claim.id}`}
    className="block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-indigo-300 hover:shadow-md"
  >
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="font-black text-slate-950">{claim.claimNo}</p>
        <p className="mt-1 text-sm text-slate-500">{claim.stockItem?.product?.name || `Stock #${claim.stockItemId}`}</p>
      </div>
      <StatusBadge status={claim.status} type="claim" />
    </div>
    <p className="mt-4 line-clamp-2 text-sm text-slate-700">{claim.reason}</p>
    <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-slate-500">
      <span>ผู้จำหน่าย: {claim.supplier?.name || '-'}</span>
      <span>เปิดเมื่อ: {formatRepairDateTime(claim.openedAt)}</span>
      <span>ใบซ่อม: {claim.repairJob?.jobNo || '-'}</span>
      <span>Tracking: {claim.trackingNumber || '-'}</span>
    </div>
  </Link>
);

export default WarrantyClaimCard;
