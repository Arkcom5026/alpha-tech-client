// src/features/product/templateCandidate/components/CandidateBadge.jsx
import React from 'react';
import { getCandidateStatusLabel, getCandidateStatusTone } from '../utils/candidateStatus';

const toneClassName = {
  slate: 'bg-slate-50 text-slate-700 border-slate-200',
  amber: 'bg-amber-50 text-amber-700 border-amber-200',
  blue: 'bg-blue-50 text-blue-700 border-blue-200',
  orange: 'bg-orange-50 text-orange-700 border-orange-200',
  red: 'bg-red-50 text-red-700 border-red-200',
  purple: 'bg-purple-50 text-purple-700 border-purple-200',
  green: 'bg-green-50 text-green-700 border-green-200',
};

const CandidateBadge = ({ status, className = '' }) => {
  const tone = getCandidateStatusTone(status);
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${toneClassName[tone] || toneClassName.slate} ${className}`}>
      {getCandidateStatusLabel(status)}
    </span>
  );
};

export default CandidateBadge;
