import React from 'react';
import { CLAIM_STATUS_LABELS, REPAIR_STATUS_LABELS, statusTone } from '../utils/repairStatus';

const StatusBadge = ({ status, type = 'repair' }) => {
  const labels = type === 'claim' ? CLAIM_STATUS_LABELS : REPAIR_STATUS_LABELS;
  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-black ${statusTone(status)}`}>
      {labels[status] || status || '-'}
    </span>
  );
};

export default StatusBadge;
