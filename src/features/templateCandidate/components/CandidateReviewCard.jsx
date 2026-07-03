// src/features/product/templateCandidate/components/CandidateReviewCard.jsx
import React from 'react';
import CandidateBadge from './CandidateBadge';

const FieldRow = ({ label, value }) => (
  <div className="grid grid-cols-3 gap-3 text-sm">
    <div className="text-slate-500">{label}</div>
    <div className="col-span-2 font-medium text-slate-900">{value || '-'}</div>
  </div>
);

const CandidateReviewCard = ({
  candidate,
  onOpen,
  onPromote,
  onReject,
  onRequestRevision,
  isBusy = false,
}) => {
  if (!candidate) return null;

  return (
    <article className="rounded-2xl border bg-white p-4 shadow-sm space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="font-semibold text-slate-900 truncate">
            {candidate.proposedName || candidate.name}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Source Branch: {candidate.sourceBranchName || '-'} · Product ID: {candidate.sourceProductId || '-'}
          </div>
        </div>
        <CandidateBadge status={candidate.status} />
      </div>

      <div className="space-y-2 border-t pt-3">
        <FieldRow label="ประเภท" value={candidate.productTypeName} />
        <FieldRow label="แบรนด์" value={candidate.brandName} />
        <FieldRow label="หน่วย" value={candidate.unitName} />
        <FieldRow label="SN" value={candidate.trackSerialNumber ? 'ติดตาม Serial Number' : 'ไม่ติดตาม Serial Number'} />
      </div>

      <div className="flex flex-wrap justify-end gap-2 border-t pt-3">
        {onOpen && (
          <button type="button" className="rounded-lg border px-3 py-2 text-sm hover:bg-slate-50" onClick={() => onOpen(candidate)}>
            ดูรายละเอียด
          </button>
        )}
        {onRequestRevision && (
          <button type="button" className="rounded-lg border px-3 py-2 text-sm hover:bg-orange-50 disabled:opacity-50" disabled={isBusy} onClick={() => onRequestRevision(candidate)}>
            ขอแก้ไข
          </button>
        )}
        {onReject && (
          <button type="button" className="rounded-lg border border-red-200 px-3 py-2 text-sm text-red-700 hover:bg-red-50 disabled:opacity-50" disabled={isBusy} onClick={() => onReject(candidate)}>
            Reject
          </button>
        )}
        {onPromote && (
          <button type="button" className="rounded-lg bg-green-600 px-3 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50" disabled={isBusy} onClick={() => onPromote(candidate)}>
            Promote เป็น Template
          </button>
        )}
      </div>
    </article>
  );
};

export default CandidateReviewCard;
