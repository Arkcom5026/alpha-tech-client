// src/features/product/templateCandidate/components/CandidateStatus.jsx
import React from 'react';
import CandidateBadge from './CandidateBadge';
import { getCandidateLifecycleIndex, CANDIDATE_LIFECYCLE_STEPS } from '../utils/candidateLifecycle';
import { getCandidateStatusLabel } from '../utils/candidateStatus';

const CandidateStatus = ({ candidate }) => {
  const currentIndex = getCandidateLifecycleIndex(candidate?.status);

  return (
    <div className="rounded-xl border bg-white p-4 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="font-semibold text-slate-900">สถานะ Catalog Candidate</div>
          <div className="text-xs text-slate-500">
            ไม่บล็อกการใช้งานสินค้าในร้าน
          </div>
        </div>
        <CandidateBadge status={candidate?.status} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        {CANDIDATE_LIFECYCLE_STEPS.map((status, index) => (
          <div
            key={status}
            className={`rounded-lg border px-3 py-2 text-xs ${
              index <= currentIndex
                ? 'border-green-200 bg-green-50 text-green-700'
                : 'border-slate-200 bg-slate-50 text-slate-500'
            }`}
          >
            {getCandidateStatusLabel(status)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CandidateStatus;
