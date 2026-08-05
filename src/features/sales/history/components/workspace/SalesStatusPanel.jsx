import React from 'react';
import SalesWorkspaceButton from './SalesWorkspaceButton';

const SalesStatusPanel = ({ eyebrow = 'สถานะงานขาย', title, description, tone = 'neutral', actionLabel, onAction }) => {
  const tones = {
    neutral: 'border-slate-200 bg-white',
    good: 'border-emerald-200 bg-emerald-50',
    warn: 'border-amber-200 bg-amber-50',
    critical: 'border-rose-200 bg-rose-50',
  };
  const dots = {
    neutral: 'bg-slate-400',
    good: 'bg-emerald-500',
    warn: 'bg-amber-500',
    critical: 'bg-rose-500',
  };

  return (
    <div className={`rounded-2xl border p-5 ${tones[tone] || tones.neutral}`}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className={`h-2.5 w-2.5 rounded-full ${dots[tone] || dots.neutral}`} />
            <p className="text-xs font-semibold text-slate-500">{eyebrow}</p>
          </div>
          <p className="mt-2 text-base font-semibold text-slate-950">{title}</p>
          {description && <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p>}
        </div>
        {onAction && <SalesWorkspaceButton onClick={onAction}>{actionLabel || 'ดูรายละเอียด'}</SalesWorkspaceButton>}
      </div>
    </div>
  );
};

export default SalesStatusPanel;
